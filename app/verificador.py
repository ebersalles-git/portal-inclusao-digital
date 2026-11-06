"""
Verificador de Notícias (Bot Antifake) — lógica de checagem.

Como decide (em ordem):
  1. Checagem de agência (Google Fact Check) que seja SOBRE O MESMO ASSUNTO
     e diga "falso"                              -> falso
  2. Sinais de golpe (pede senha/código/Pix, urgência, link disfarçado,
     site imitando o governo)                     -> suspeito
  3. Link de site oficial (.gov.br, .jus.br...)   -> oficial
  4. Checagem relacionada que diga "verdadeiro"   -> verdadeiro
  5. Link de jornal conhecido ou de agência de checagem -> confiavel
  6. Checagem relacionada sem conclusão clara     -> indefinido
  7. Nada encontrado                              -> sem_dados ("não repasse")

Funciona mesmo sem chaves de API (passos 2, 3, 5 e 7). Com a chave do Google
Fact Check, faz os passos 1, 4 e 6. Com chave de IA, só reescreve a mensagem
em linguagem acolhedora — a IA nunca muda a conclusão.

Defeito corrigido nesta versão: antes, QUALQUER checagem "falso" devolvida pela
busca marcava a notícia como falsa, mesmo sendo sobre outro assunto. Agora só
contam checagens realmente parecidas com o conteúdo enviado.
"""
from __future__ import annotations

import asyncio
import html
import ipaddress
import os
import re
import socket
import unicodedata
from urllib.parse import urljoin, urlparse

import httpx

# ------------------------------------------------------------------
# Listas de domínios
# ------------------------------------------------------------------
SUFIXOS_OFICIAIS = (".gov.br", ".jus.br", ".leg.br", ".mil.br", ".mp.br", ".def.br")

IMPRENSA = {
    "g1.globo.com", "globo.com", "oglobo.globo.com", "uol.com.br", "folha.uol.com.br",
    "estadao.com.br", "cnnbrasil.com.br", "bbc.com", "agenciabrasil.ebc.com.br",
    "ebc.com.br", "r7.com", "band.uol.com.br", "terra.com.br", "metropoles.com",
    "correiobraziliense.com.br", "valor.globo.com", "exame.com", "veja.abril.com.br",
    "poder360.com.br", "jovempan.com.br", "sbtnews.sbt.com.br", "cartacapital.com.br",
    # Espírito Santo
    "agazeta.com.br", "folhavitoria.com.br", "tribunaonline.com.br", "eshoje.com.br",
    "seculodiario.com.br",
}

CHECAGEM = {
    "aosfatos.org", "lupa.uol.com.br", "lupa.news", "boatos.org", "e-farsas.com",
    "projetocomprova.com.br", "estadao.com.br/estadao-verifica", "afp.com",
    "checamos.afp.com", "g1.globo.com/fato-ou-fake", "politica.estadao.com.br",
}

ENCURTADORES = {
    "bit.ly", "tinyurl.com", "cutt.ly", "encurtador.com.br", "t.co", "is.gd",
    "rebrand.ly", "shorturl.at", "ow.ly", "s.id", "rb.gy", "abre.ai", "l1nk.dev",
}

# Palavras que golpistas colocam no endereço para parecer órgão oficial
PALAVRAS_IMITACAO = {
    "gov", "govbr", "governo", "inss", "fgts", "caixa", "receita", "detran",
    "sus", "beneficio", "beneficios", "auxilio", "bolsa", "pis", "cpf",
    "denatran", "senatran", "tse", "restituicao", "valores", "resgate",
}

TLDS_SUSPEITOS = (".site", ".online", ".xyz", ".top", ".click", ".shop", ".live",
                  ".info", ".icu", ".buzz", ".vip", ".monster", ".rest")

# ------------------------------------------------------------------
# Veredictos das agências
# ------------------------------------------------------------------
_RATINGS_FALSO = (
    "false", "falso", "fake", "incorrect", "incorreto", "enganoso", "misleading",
    "distorcido", "sem contexto", "exagerado", "pants on fire", "insustentavel",
    "distorce", "boato", "nao e bem assim", "golpe", "montagem", "mentira",
)
_RATINGS_VERDADEIRO = (
    "true", "verdadeiro", "correct", "correto", "accurate", "confirmado", "fato",
)

_URL_RE = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)

_STOP = {
    "para", "pelo", "pela", "pelos", "pelas", "como", "mais", "muito", "esse", "essa",
    "este", "esta", "isso", "isto", "aqui", "voce", "voces", "sobre", "entre", "depois",
    "antes", "quando", "onde", "porque", "pois", "seja", "sera", "foram", "sendo",
    "esta", "estao", "tambem", "ainda", "apenas", "todo", "toda", "todos", "todas",
    "noticia", "noticias", "https", "http", "html", "ghtml", "shtml", "www", "com",
    "materia", "brasil", "dizer", "diz", "segundo", "anos", "partir", "sobre", "contra",
    "vai", "vao", "tem", "nao", "sim", "uma", "umas", "uns", "dos", "das", "nos", "nas",
}


# ------------------------------------------------------------------
# Utilitários de texto
# ------------------------------------------------------------------
def _sem_acento(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


def _palavras(s: str) -> set[str]:
    """Palavras significativas (sem acento, sem plural simples)."""
    out = set()
    for p in re.findall(r"[a-z0-9]+", _sem_acento(s)):
        if p.isdigit():
            if len(p) >= 2:
                out.add(p)
            continue
        if len(p) < 4 or p in _STOP:
            continue
        if p.endswith("s") and len(p) > 4:
            p = p[:-1]
        out.add(p)
    return out


def _host(url: str) -> str:
    try:
        h = (urlparse(url).hostname or "").lower()
    except ValueError:
        return ""
    return h[4:] if h.startswith("www.") else h


def _casa(host: str, url: str, lista: set[str]) -> bool:
    """host é igual ou subdomínio de algum item; itens com '/' casam pelo caminho."""
    alvo = host + (urlparse(url).path or "")
    for item in lista:
        if "/" in item:
            if alvo.startswith(item):
                return True
        elif host == item or host.endswith("." + item):
            return True
    return False


# ------------------------------------------------------------------
# Análise do link
# ------------------------------------------------------------------
def tipo_dominio(url: str) -> str:
    """oficial | checagem | imprensa | encurtador | imitacao | desconhecido"""
    host = _host(url)
    if not host:
        return "desconhecido"
    if host.endswith(SUFIXOS_OFICIAIS) or host in {s.lstrip(".") for s in SUFIXOS_OFICIAIS}:
        return "oficial"
    if _casa(host, url, CHECAGEM):
        return "checagem"
    if _casa(host, url, IMPRENSA):
        return "imprensa"
    if _casa(host, url, ENCURTADORES):
        return "encurtador"
    pedacos = set(re.split(r"[.\-_]", host))
    if pedacos & PALAVRAS_IMITACAO or host.endswith(TLDS_SUSPEITOS):
        return "imitacao"
    return "desconhecido"


def sinais_de_golpe(texto: str) -> list[str]:
    """Lista de motivos (em linguagem simples) que indicam golpe."""
    t = _sem_acento(texto)
    motivos: list[str] = []
    if re.search(r"\b(senha|codigo|token|cvv|codigo de seguranca|numero do cartao)\b", t):
        motivos.append("Pede senha, código ou dados do cartão — órgãos oficiais nunca pedem isso.")
    if re.search(r"\b(pix|taxa|deposit\w*|transferenci\w*|boleto)\b", t) and \
       re.search(r"\b(liberar|desbloque\w*|receber|sacar|resgat\w*|taxa)\b", t):
        motivos.append("Pede pagamento ou Pix para liberar dinheiro — isso é golpe.")
    if re.search(r"\b(urgente|ultimo dia|ultima chance|imediatamente|24 horas|hoje mesmo|"
                 r"sera (bloquead|cancelad|suspens)\w*|vai ser (bloquead|cancelad)\w*|bloquead\w*)", t):
        motivos.append("Usa pressa ou ameaça de bloqueio para assustar.")
    if re.search(r"\b(parabens|sorteado|premio|ganhou|voce tem r\$|dinheiro esquecido|"
                 r"valores a receber|para sacar|liberad\w* para voce)", t):
        motivos.append("Promete prêmio ou dinheiro fácil.")
    for url in _URL_RE.findall(texto or ""):
        tipo = tipo_dominio(url)
        if tipo == "encurtador":
            motivos.append("Usa link encurtado, que esconde o endereço verdadeiro.")
        elif tipo == "imitacao":
            motivos.append(f"O endereço '{_host(url)}' tenta imitar um site do governo, mas não termina em .gov.br.")
    # remove repetidos mantendo a ordem
    vistos, unicos = set(), []
    for m in motivos:
        if m not in vistos:
            vistos.add(m)
            unicos.append(m)
    return unicos


# ------------------------------------------------------------------
# Leitura segura da página (com proteção contra endereços internos)
# ------------------------------------------------------------------
def _host_publico(host: str) -> bool:
    try:
        infos = socket.getaddrinfo(host, None)
    except OSError:
        return False
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified):
            return False
    return True


def _meta(conteudo: str, nome: str) -> str:
    padrao = (r'<meta[^>]+(?:property|name)=["\']' + re.escape(nome) +
              r'["\'][^>]*content=["\']([^"\']+)["\']')
    m = re.search(padrao, conteudo, re.IGNORECASE)
    if not m:
        padrao = (r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']' +
                  re.escape(nome) + r'["\']')
        m = re.search(padrao, conteudo, re.IGNORECASE)
    return html.unescape(m.group(1)).strip() if m else ""


async def ler_pagina(url: str) -> dict | None:
    """Baixa a página (até 1 MB) e devolve título, descrição e endereço final."""
    atual = url
    try:
        async with httpx.AsyncClient(
            timeout=10, follow_redirects=False,
            headers={"User-Agent": "Mozilla/5.0 (PortalInclusaoDigital verificador)"},
        ) as client:
            for _ in range(5):
                partes = urlparse(atual)
                if partes.scheme not in ("http", "https") or not partes.hostname:
                    return None
                publico = await asyncio.to_thread(_host_publico, partes.hostname)
                if not publico:
                    return None
                async with client.stream("GET", atual) as resp:
                    if resp.is_redirect:
                        atual = urljoin(atual, resp.headers.get("location", ""))
                        continue
                    if resp.status_code >= 400:
                        return {"titulo": "", "descricao": "", "url_final": atual}
                    corpo = b""
                    async for pedaco in resp.aiter_bytes():
                        corpo += pedaco
                        if len(corpo) > 1_000_000:
                            break
                    texto = corpo.decode(resp.encoding or "utf-8", errors="ignore")
                    titulo = _meta(texto, "og:title")
                    if not titulo:
                        m = re.search(r"<title[^>]*>(.*?)</title>", texto, re.IGNORECASE | re.DOTALL)
                        titulo = html.unescape(m.group(1)).strip() if m else ""
                    descricao = _meta(texto, "og:description") or _meta(texto, "description")
                    return {
                        "titulo": re.sub(r"\s+", " ", titulo)[:300],
                        "descricao": re.sub(r"\s+", " ", descricao)[:500],
                        "url_final": atual,
                    }
    except (httpx.HTTPError, ValueError, OSError):
        return None
    return None


# ------------------------------------------------------------------
# Google Fact Check + relevância
# ------------------------------------------------------------------
async def _consultar_factcheck(consulta: str, api_key: str) -> list[dict]:
    params = {"query": consulta, "languageCode": "pt", "key": api_key, "pageSize": 10}
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    async with httpx.AsyncClient(timeout=12) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json().get("claims", []) or []


def _relevante(claim: dict, consulta_palavras: set[str]) -> bool:
    review = (claim.get("claimReview") or [{}])[0]
    texto = (claim.get("text") or "") + " " + (review.get("title") or "")
    c = _palavras(texto)
    if not c or not consulta_palavras:
        return False
    comum = len(c & consulta_palavras)
    menor = min(len(c), len(consulta_palavras))
    return comum >= 3 and comum / menor >= 0.5


def classificar(claims: list[dict], consulta: str) -> tuple[str, dict | None]:
    """Considera só checagens sobre o mesmo assunto da consulta."""
    q = _palavras(consulta)
    relevantes = [c for c in claims if _relevante(c, q)]
    for alvo, termos in (("falso", _RATINGS_FALSO), ("verdadeiro", _RATINGS_VERDADEIRO)):
        for claim in relevantes:
            for review in claim.get("claimReview", []):
                rating = _sem_acento(review.get("textualRating") or "")
                if any(t in rating for t in termos):
                    return alvo, {"claim": claim, "review": review}
    if relevantes:
        review = (relevantes[0].get("claimReview") or [{}])[0]
        return "indefinido", {"claim": relevantes[0], "review": review}
    return "sem_dados", None


def _consulta_de_url(url: str) -> str:
    caminho = urlparse(url).path or ""
    partes = [p for p in re.split(r"[/_\-.]+", caminho)
              if p and not re.fullmatch(r"\d+|[a-z0-9]{12,}|html?|ghtml|shtml|php", p, re.I)]
    return " ".join(partes)[:300]


# ------------------------------------------------------------------
# Textos de resposta
# ------------------------------------------------------------------
TITULOS = {
    "falso": "Cuidado: é boato",
    "suspeito": "Cuidado: tem cara de golpe",
    "oficial": "É um site oficial do governo",
    "verdadeiro": "Parece ser verdadeiro",
    "confiavel": "Vem de uma fonte conhecida",
    "indefinido": "Não deu para ter certeza",
    "sem_dados": "Ainda não foi verificado",
    "erro": "Não consegui verificar agora",
    "vazio": "Escreva ou cole a mensagem",
}

MENSAGENS = {
    "falso": ("Agências de checagem já analisaram esse assunto e concluíram que é falso ou "
              "enganoso. Não repasse para ninguém."),
    "suspeito": ("Essa mensagem tem sinais típicos de golpe. Não clique em links, não passe "
                 "senha nem códigos e não faça nenhum pagamento."),
    "oficial": ("O endereço termina em um domínio oficial do governo, então o site é "
                "verdadeiro. Mesmo assim, nunca passe sua senha para outras pessoas."),
    "verdadeiro": ("Agências de checagem indicam que essa informação é verdadeira. Mesmo "
                   "assim, confie sempre em fontes oficiais."),
    "confiavel": ("O link é de um veículo de notícias conhecido e não encontramos checagem "
                  "dizendo que é boato. Confira a data da notícia antes de repassar."),
    "indefinido": ("Encontrei uma checagem parecida, mas sem uma conclusão clara. Por "
                   "segurança, evite repassar até ter certeza."),
    "sem_dados": ("Essa informação ainda não foi verificada por agências confiáveis. Por "
                  "segurança, evite repassar."),
    "erro": ("Tive um problema para consultar as agências de checagem agora. Por segurança, "
             "evite repassar até ter certeza."),
    "vazio": ("Cole aqui o link ou a mensagem que você recebeu para eu poder verificar."),
}


async def _redigir_com_ia(status: str, entrada: str, motivos: list[str],
                          fonte_nome: str | None, rating: str | None) -> str | None:
    """Reescreve a mensagem em até 3 frases acolhedoras. NÃO muda a conclusão."""
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
    instrucao = (
        "Você ajuda pessoas idosas a entender se uma mensagem recebida no WhatsApp é "
        "confiável. A conclusão JÁ FOI DECIDIDA e você não pode mudá-la: apenas explique-a. "
        "Responda em português do Brasil, em no máximo 3 frases curtas, tom gentil, sem "
        "jargão técnico, sem links.\n\n"
        f"Conclusão: {TITULOS.get(status, status)}.\n"
        f"Explicação padrão: {MENSAGENS.get(status, '')}\n"
        f"Motivos encontrados: {'; '.join(motivos) or 'nenhum'}.\n"
        f"Agência de checagem: {fonte_nome or 'nenhuma'}. Veredicto: {rating or 'nenhum'}.\n"
        f"Mensagem recebida: {entrada[:600]}"
    )
    try:
        if provider == "openai":
            key = os.getenv("OPENAI_API_KEY")
            if not key:
                return None
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}"},
                    json={"model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                          "messages": [{"role": "user", "content": instrucao}],
                          "max_tokens": 220, "temperature": 0.3},
                )
                r.raise_for_status()
                return r.json()["choices"][0]["message"]["content"].strip()
        key = os.getenv("ANTHROPIC_API_KEY")
        if not key:
            return None
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": key, "anthropic-version": "2023-06-01",
                         "content-type": "application/json"},
                json={"model": os.getenv("ANTHROPIC_MODEL", "claude-haiku-5-5"),
                      "max_tokens": 220,
                      "messages": [{"role": "user", "content": instrucao}]},
            )
            r.raise_for_status()
            return r.json()["content"][0]["text"].strip()
    except Exception:
        return None


def _resposta(status: str, mensagem: str | None = None, motivos: list[str] | None = None,
              fonte: str | None = None, url_fonte: str | None = None,
              titulo_pagina: str | None = None) -> dict:
    return {
        "status": status,
        "titulo": TITULOS[status],
        "mensagem": mensagem or MENSAGENS[status],
        "motivos": motivos or [],
        "fonte": fonte,
        "url_fonte": url_fonte,
        "titulo_pagina": titulo_pagina,
    }


# ------------------------------------------------------------------
# Função principal
# ------------------------------------------------------------------
async def verificar(entrada: str) -> dict:
    """
    Devolve: { status, titulo, mensagem, motivos[], fonte, url_fonte, titulo_pagina }
    status ∈ {falso, suspeito, oficial, verdadeiro, confiavel, indefinido,
              sem_dados, erro, vazio}
    """
    entrada = (entrada or "").strip()[:4000]
    if len(entrada) < 3:
        return _resposta("vazio")

    motivos = sinais_de_golpe(entrada)
    urls = _URL_RE.findall(entrada)
    url = urls[0].rstrip(".,);") if urls else None

    # --- análise do link ---
    tipo = None
    pagina = None
    if url:
        tipo = tipo_dominio(url)
        if tipo not in ("imitacao",):
            pagina = await ler_pagina(url)
        # link encurtado: olha para onde ele leva de verdade
        if pagina and pagina.get("url_final") and _host(pagina["url_final"]) != _host(url):
            tipo_final = tipo_dominio(pagina["url_final"])
            if tipo_final == "imitacao":
                motivos.append(f"O link leva para '{_host(pagina['url_final'])}', que imita um site do governo.")
            tipo = tipo_final if tipo_final != "desconhecido" else tipo

    titulo_pagina = (pagina or {}).get("titulo") or None

    # --- consulta às agências (se houver chave) ---
    status_check, fonte = "sem_dados", None
    api_key = os.getenv("GOOGLE_FACTCHECK_API_KEY")
    if api_key:
        texto_sem_link = _URL_RE.sub(" ", entrada).strip()
        if titulo_pagina:
            consulta = titulo_pagina
        elif len(texto_sem_link) >= 15:
            consulta = texto_sem_link
        elif url:
            consulta = _consulta_de_url(url)
        else:
            consulta = entrada
        consulta = consulta[:300]
        if len(_palavras(consulta)) >= 2:
            try:
                claims = await _consultar_factcheck(consulta, api_key)
                status_check, fonte = classificar(claims, consulta)
            except Exception:
                status_check = "erro"

    # --- decisão final ---
    if status_check == "falso":
        status = "falso"
    elif tipo in ("imitacao",) or len(motivos) >= 2:
        status = "suspeito"
    elif tipo == "oficial":
        status = "oficial"
    elif status_check == "verdadeiro":
        status = "verdadeiro"
    elif tipo in ("imprensa", "checagem"):
        status = "confiavel"
    elif status_check == "indefinido":
        status = "indefinido"
    elif len(motivos) == 1:
        status = "suspeito"
    elif status_check == "erro":
        status = "erro"
    else:
        status = "sem_dados"

    if tipo == "imitacao" and not any("imitar" in m for m in motivos):
        motivos.append(f"O endereço '{_host(url)}' tenta imitar um site do governo, mas não termina em .gov.br.")
    if tipo == "oficial":
        host = _host((pagina or {}).get("url_final") or url)
        sufixo = next((s for s in SUFIXOS_OFICIAIS if host.endswith(s)), ".gov.br")
        motivos = [f"O endereço '{host}' termina em '{sufixo}', que só o governo pode usar."]
    if tipo == "imprensa":
        motivos.append(f"O link é do site '{_host(url)}', um veículo de imprensa conhecido.")

    fonte_nome = url_fonte = rating = None
    if fonte:
        review = fonte.get("review", {})
        fonte_nome = (review.get("publisher") or {}).get("name")
        url_fonte = review.get("url")
        rating = review.get("textualRating")
        if fonte_nome and rating:
            motivos.insert(0, f"A agência {fonte_nome} classificou como: \"{rating}\".")

    texto_ia = await _redigir_com_ia(status, entrada, motivos, fonte_nome, rating)
    return _resposta(status, texto_ia, motivos, fonte_nome, url_fonte, titulo_pagina)
