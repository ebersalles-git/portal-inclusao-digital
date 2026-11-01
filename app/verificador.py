"""
Verificador de Notícias (Bot Antifake) — lógica de checagem.

Funciona em 3 níveis, degradando com segurança:
  1. Sem nenhuma chave  -> resposta padrão segura ("não verificado, não repasse").
  2. Com Google Fact Check -> busca checagens reais de agências.
  3. Com chave de IA      -> redige a resposta em 3 frases acolhedoras.

Nunca inventa que algo é "verdadeiro". Na dúvida, orienta a NÃO repassar.
"""
from __future__ import annotations

import os
import re
import html
import httpx

# Veredictos que tratamos como "falso/enganoso"
_RATINGS_FALSO = (
    "false", "falso", "fake", "incorrect", "incorreto", "enganoso",
    "misleading", "distorcido", "sem contexto", "exagerado", "pants on fire",
    "insustentável", "distorce", "boato", "não é bem assim",
)
# Veredictos que tratamos como "verdadeiro/confiável"
_RATINGS_VERDADEIRO = (
    "true", "verdadeiro", "correct", "correto", "accurate", "confirmado",
)

_URL_RE = re.compile(r"https?://[^\s]+", re.IGNORECASE)


def _extrair_consulta(entrada: str) -> str:
    """Extrai um termo de busca a partir do texto/link colado pelo usuário."""
    entrada = (entrada or "").strip()
    # Se houver URL, usamos as palavras do caminho como pista de busca.
    url = _URL_RE.search(entrada)
    if url and len(entrada) <= len(url.group(0)) + 5:
        caminho = re.sub(r"https?://", "", url.group(0))
        caminho = re.sub(r"[/_\-\.\?\=\&]+", " ", caminho)
        return caminho.strip()[:300]
    return entrada[:300]


async def _consultar_factcheck(consulta: str, api_key: str) -> list[dict]:
    """Consulta a Google Fact Check Tools API (em português)."""
    params = {
        "query": consulta,
        "languageCode": "pt",
        "key": api_key,
        "pageSize": 5,
    }
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    async with httpx.AsyncClient(timeout=12) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        dados = resp.json()
    return dados.get("claims", []) or []


def _classificar(claims: list[dict]) -> tuple[str, dict | None]:
    """Decide status (falso/verdadeiro/indefinido) a partir das checagens."""
    for claim in claims:
        for review in claim.get("claimReview", []):
            rating = (review.get("textualRating") or "").lower()
            if any(t in rating for t in _RATINGS_FALSO):
                return "falso", {"claim": claim, "review": review}
    for claim in claims:
        for review in claim.get("claimReview", []):
            rating = (review.get("textualRating") or "").lower()
            if any(t in rating for t in _RATINGS_VERDADEIRO):
                return "verdadeiro", {"claim": claim, "review": review}
    if claims:
        review = (claims[0].get("claimReview") or [{}])[0]
        return "indefinido", {"claim": claims[0], "review": review}
    return "sem_dados", None


async def _redigir_com_ia(status: str, entrada: str, fonte: dict | None) -> str | None:
    """Usa uma IA (se houver chave) para redigir 3 frases acolhedoras."""
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
    rating = ""
    publisher = ""
    if fonte:
        review = fonte.get("review", {})
        rating = review.get("textualRating", "")
        publisher = (review.get("publisher") or {}).get("name", "")

    instrucao = (
        "Você ajuda pessoas idosas a entender se uma mensagem recebida no "
        "WhatsApp é verdadeira ou é boato. Responda em português do Brasil, "
        "em no máximo 3 frases curtas, com tom gentil e acolhedor, SEM jargão "
        "técnico. Não use links nem termos de internet. Deixe claro se é seguro "
        "ou se é golpe/boato. Se não houver certeza, oriente a não repassar.\n\n"
        f"Situação detectada: {status}.\n"
        f"Agência de checagem: {publisher or 'nenhuma'}.\n"
        f"Veredicto da agência: {rating or 'nenhum'}.\n"
        f"Mensagem recebida pela pessoa: {entrada[:600]}"
    )

    try:
        if provider == "openai":
            key = os.getenv("OPENAI_API_KEY")
            if not key:
                return None
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}"},
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": instrucao}],
                        "max_tokens": 220,
                        "temperature": 0.3,
                    },
                )
                r.raise_for_status()
                return r.json()["choices"][0]["message"]["content"].strip()
        else:  # anthropic (padrão)
            key = os.getenv("ANTHROPIC_API_KEY")
            if not key:
                return None
            model = os.getenv("ANTHROPIC_MODEL", "claude-haiku-5-5")
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": model,
                        "max_tokens": 220,
                        "messages": [{"role": "user", "content": instrucao}],
                    },
                )
                r.raise_for_status()
                return r.json()["content"][0]["text"].strip()
    except Exception:
        return None


async def verificar(entrada: str) -> dict:
    """
    Retorna um dicionário pronto para o front-end:
      { status, titulo, mensagem, fonte, url_fonte }
    status ∈ {verdadeiro, falso, indefinido, sem_dados, erro}
    """
    entrada = (entrada or "").strip()
    if len(entrada) < 3:
        return {
            "status": "sem_dados",
            "titulo": "Escreva ou cole a mensagem",
            "mensagem": (
                "Cole aqui o link ou a mensagem que você recebeu para eu poder "
                "verificar. Na dúvida, não repasse antes de conferir."
            ),
            "fonte": None,
            "url_fonte": None,
        }

    api_key = os.getenv("GOOGLE_FACTCHECK_API_KEY")

    # NÍVEL 1 — sem chave do Fact Check: resposta segura padrão.
    if not api_key:
        return {
            "status": "sem_dados",
            "titulo": "Ainda não foi possível verificar",
            "mensagem": (
                "Essa informação ainda não foi conferida por agências confiáveis "
                "por aqui. Por segurança, evite repassar. Na dúvida, procure um "
                "familiar de confiança ou os canais oficiais (sites que terminam "
                "em .gov.br)."
            ),
            "fonte": None,
            "url_fonte": None,
        }

    # NÍVEL 2/3 — com chave: consulta real.
    try:
        consulta = _extrair_consulta(entrada)
        claims = await _consultar_factcheck(consulta, api_key)
        status, fonte = _classificar(claims)
    except Exception:
        return {
            "status": "erro",
            "titulo": "Não consegui verificar agora",
            "mensagem": (
                "Tive um problema para consultar as agências de checagem neste "
                "momento. Por segurança, evite repassar até ter certeza."
            ),
            "fonte": None,
            "url_fonte": None,
        }

    publisher = None
    url_fonte = None
    if fonte:
        review = fonte.get("review", {})
        publisher = (review.get("publisher") or {}).get("name")
        url_fonte = review.get("url")

    # Texto redigido por IA, se disponível; senão, texto padrão por status.
    texto_ia = await _redigir_com_ia(status, entrada, fonte)

    padroes = {
        "verdadeiro": (
            "Boas notícias: agências de checagem indicam que essa informação é "
            "verdadeira. Mesmo assim, confie sempre em fontes oficiais."
        ),
        "falso": (
            "Atenção: agências de checagem apontam que essa mensagem é falsa ou "
            "enganosa. Não repasse para ninguém. Se pediram senha ou dinheiro, "
            "é golpe."
        ),
        "indefinido": (
            "Encontrei uma checagem parecida, mas sem um resultado claro. Por "
            "segurança, evite repassar até ter certeza."
        ),
        "sem_dados": (
            "Essa informação ainda não foi verificada por agências confiáveis. "
            "Por segurança, evite repassar."
        ),
    }
    titulos = {
        "verdadeiro": "Parece ser verdadeiro",
        "falso": "Cuidado: parece ser boato",
        "indefinido": "Não deu para ter certeza",
        "sem_dados": "Ainda não foi verificado",
    }

    return {
        "status": status,
        "titulo": titulos.get(status, "Resultado"),
        "mensagem": texto_ia or padroes.get(status, padroes["sem_dados"]),
        "fonte": publisher,
        "url_fonte": url_fonte,
    }
