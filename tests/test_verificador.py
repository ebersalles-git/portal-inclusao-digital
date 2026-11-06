"""Testes da lógica do Verificador de Notícias (sem acesso à internet)."""
import asyncio

import pytest

from app import verificador as v


# ---------- análise do domínio ----------
@pytest.mark.parametrize("url,tipo", [
    ("https://www.gov.br/inss/pt-br/noticias", "oficial"),
    ("https://meu.inss.gov.br/", "oficial"),
    ("https://www.tse.jus.br/comunicacao", "oficial"),
    ("https://acessocidadao.es.gov.br/", "oficial"),
    ("https://g1.globo.com/economia/noticia/2026/11/01/abc.ghtml", "imprensa"),
    ("https://www.agazeta.com.br/es/politica/abc", "imprensa"),
    ("https://lupa.uol.com.br/jornalismo/2026/abc", "checagem"),
    ("https://www.aosfatos.org/noticias/abc", "checagem"),
    ("https://bit.ly/3abcde", "encurtador"),
    ("https://gov-br-beneficio.com/liberar", "imitacao"),
    ("https://inss-saque.site/", "imitacao"),
    ("https://www.exemplo-qualquer.com/abc", "desconhecido"),
])
def test_tipo_dominio(url, tipo):
    assert v.tipo_dominio(url) == tipo


# ---------- sinais de golpe ----------
def test_golpe_pede_senha_e_link():
    texto = "URGENTE! Seu benefício do INSS será bloqueado. Clique no link e informe sua senha: http://inss-libera.com"
    assert len(v.sinais_de_golpe(texto)) >= 2


def test_mensagem_comum_sem_sinais():
    texto = "A vacinação contra a gripe para idosos começa na segunda-feira nas unidades de saúde."
    assert v.sinais_de_golpe(texto) == []


# ---------- relevância das checagens ----------
def _claim(texto, rating, publisher="Agência Lupa"):
    return {"text": texto, "claimReview": [{
        "textualRating": rating, "publisher": {"name": publisher},
        "url": "https://lupa.uol.com.br/x", "title": texto}]}


def test_checagem_sem_relacao_e_ignorada():
    """O defeito antigo: qualquer checagem 'falso' marcava a notícia como falsa."""
    consulta = "Governo anuncia reajuste do salário mínimo para 2027"
    claims = [_claim("Vacina contra covid altera o DNA humano", "Falso")]
    status, _ = v.classificar(claims, consulta)
    assert status == "sem_dados"


def test_checagem_relacionada_falsa():
    consulta = "INSS vai pagar 14º salário para aposentados em dezembro"
    claims = [_claim("INSS vai pagar 14º salário aos aposentados em dezembro", "Falso")]
    status, fonte = v.classificar(claims, consulta)
    assert status == "falso"
    assert fonte["review"]["publisher"]["name"] == "Agência Lupa"


def test_checagem_relacionada_verdadeira():
    consulta = "Campanha de vacinação contra gripe para idosos começa segunda"
    claims = [_claim("Campanha de vacinação contra a gripe para idosos começa na segunda", "Verdadeiro")]
    status, _ = v.classificar(claims, consulta)
    assert status == "verdadeiro"


# ---------- decisão final (sem chaves de API, sem internet) ----------
def _rodar(entrada, monkeypatch, pagina=None):
    monkeypatch.delenv("GOOGLE_FACTCHECK_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    async def falsa_pagina(url):
        return pagina
    monkeypatch.setattr(v, "ler_pagina", falsa_pagina)
    return asyncio.run(v.verificar(entrada))


def test_link_de_jornal_confiavel_nao_e_falso(monkeypatch):
    r = _rodar("https://g1.globo.com/economia/noticia/2026/11/01/salario.ghtml", monkeypatch,
               pagina={"titulo": "Salário mínimo de 2027 é anunciado", "descricao": "", "url_final":
                       "https://g1.globo.com/economia/noticia/2026/11/01/salario.ghtml"})
    assert r["status"] == "confiavel"


def test_link_oficial(monkeypatch):
    r = _rodar("https://www.gov.br/inss/pt-br/assuntos/noticias/abc", monkeypatch)
    assert r["status"] == "oficial"


def test_link_imitando_governo(monkeypatch):
    r = _rodar("https://gov-br-beneficio.com/liberar", monkeypatch)
    assert r["status"] == "suspeito"


def test_mensagem_de_golpe(monkeypatch):
    r = _rodar("Parabéns! Você tem R$ 1.500 para sacar. Envie o código que chegou por SMS e faça um Pix de R$ 20 para liberar.",
               monkeypatch)
    assert r["status"] == "suspeito"


def test_mensagem_neutra_sem_dados(monkeypatch):
    r = _rodar("A vacinação contra a gripe para idosos começa na segunda-feira.", monkeypatch)
    assert r["status"] == "sem_dados"


def test_entrada_vazia(monkeypatch):
    r = _rodar("  ", monkeypatch)
    assert r["status"] == "vazio"
