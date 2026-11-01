"""
Portal Inclusão Digital — app FastAPI.

Serve o site (HTML/CSS/JS estáticos) e expõe a API do Verificador de Notícias.
Rodar local:   uvicorn app.main:app --reload
Produção:      uvicorn app.main:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .verificador import verificar

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Portal Inclusão Digital", docs_url=None, redoc_url=None)


class EntradaVerificacao(BaseModel):
    texto: str = ""


@app.get("/api/saude")
async def saude():
    """Checagem simples de saúde para o painel/monitoramento."""
    return {"ok": True}


@app.post("/api/verificar")
async def api_verificar(dados: EntradaVerificacao):
    resultado = await verificar(dados.texto)
    return JSONResponse(resultado)


# Arquivos estáticos (o site) servidos na raiz. Deve ficar por ÚLTIMO,
# para não capturar as rotas /api acima.
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="site")
