# Portal Inclusão Digital para Idosos

Site de inclusão digital feito para a **ação social da Igreja Cristã Maranata**
(projeto acadêmico da FDV). Ajuda pessoas idosas a acessar, com autonomia e
segurança, os serviços oficiais do governo.

**Importante:** este portal **não imita** as telas do governo. Ele tem marca
própria, ensina o passo a passo em letras grandes e **redireciona** a pessoa
para os sites oficiais (`.gov.br` e `es.gov.br`), onde o login é feito com
segurança. Nenhuma senha é digitada aqui.

## O que tem no site
- **Barra de acessibilidade:** letra maior/menor, alto contraste e "ouvir página" (voz).
- **Faixa antigolpe** no topo.
- **Serviços do governo** com logotipo oficial e passo a passo ilustrado (desenho do
  celular com o "dedo amarelo" mostrando onde tocar): Meu INSS, Gov.br, Acesso Cidadão,
  Carteira Digital de Trânsito (app CNH do Brasil), Título de Eleitor Digital (e-Título)
  e Meu SUS Digital.
- **Para o dia a dia:** dicas de internet banking e Pix, números de emergência (toque
  para ligar) e jogos (memória e palavra embaralhada).
- **Verificador de Notícias** com botão "Nova consulta" e "copiar resposta para o WhatsApp".
- **FAQ** com as 6 dúvidas mais comuns.
- **Página do Projeto Social:** ação da Igreja Cristã Maranata (com logo e vídeo),
  responsáveis, foto do grupo, galeria de ações e créditos acadêmicos com o logo da FDV.

## Onde trocar conteúdo
| O quê | Onde |
|---|---|
| Passo a passo, serviços, emergência, FAQ | `static/js/tutoriais.js` |
| Foto do grupo | `static/img/fotos/grupo.jpg` |
| Fotos das ações anteriores | `static/img/fotos/acao-1.jpg` … `acao-6.jpg` (legendas em `static/projeto.html`, lista `GALERIA`) |
| Responsáveis e link do vídeo | `static/projeto.html` |
| Logotipos | `static/img/` e `static/img/logos/` |

Enquanto uma foto não existir, o site mostra um espaço reservado com o nome do arquivo.

## Como o verificador decide
1. Checagem de agência **sobre o mesmo assunto** dizendo "falso" → **boato** (vermelho)
2. Sinais de golpe (pede senha/Pix, pressa, link encurtado, site imitando o governo) → **cara de golpe** (vermelho)
3. Link de site oficial (.gov.br, .jus.br…) → **site oficial** (verde)
4. Checagem relacionada dizendo "verdadeiro" → **verdadeiro** (verde)
5. Link de jornal conhecido ou agência de checagem → **fonte conhecida** (verde)
6. Nada encontrado → **ainda não verificado, não repasse** (amarelo)

Os passos 2, 3, 5 e 6 funcionam **sem nenhuma chave de API**.
Testes: `.venv\Scripts\pip install pytest` e depois `.venv\Scripts\python -m pytest tests`.

## Como rodar no seu computador (teste)
```bash
python -m venv .venv
# Windows:
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload
# Linux/Mac:
# .venv/bin/pip install -r requirements.txt
# .venv/bin/uvicorn app.main:app --reload
```
Abra: http://127.0.0.1:8000

## Estrutura
```
app/            # backend (FastAPI)
  main.py       # serve o site + rota /api/verificar
  verificador.py# lógica do bot antifake (degrada com segurança sem chaves)
static/         # o site (HTML, CSS, JS) e os tutoriais
Dockerfile
docker-compose.yml
.env.example    # modelo de configuração (copie para .env)
```

## Verificador de Notícias — chaves de API (opcionais)
O site **funciona sem nenhuma chave**: o verificador já reconhece sites oficiais,
jornais conhecidos e sinais de golpe. As chaves acrescentam a consulta às agências
de checagem e a redação da resposta por IA.

Para ativar a verificação de verdade, copie `.env.example` para `.env` e preencha:
- `GOOGLE_FACTCHECK_API_KEY` — da Google Fact Check Tools API.
- `ANTHROPIC_API_KEY` (ou `OPENAI_API_KEY`) — para redigir a resposta acolhedora.

> ⚠️ **Nunca** envie o arquivo `.env` para o GitHub nem cole as chaves em chats.
> Ele já está no `.gitignore` e no `.dockerignore`.

---

# Como publicar na VPS Hostinger

O projeto já vem pronto para **Docker**. Escolha o caminho do seu painel.

## Opção A — Coolify / Dokploy / EasyPanel (recomendado)
1. Suba esta pasta para um repositório no GitHub (sem o `.env`).
2. No painel, crie um novo projeto/app a partir do repositório.
3. O painel detecta o `Dockerfile` automaticamente. Defina a **porta** como `8000`.
4. (Opcional) Em *Environment Variables*, cole as chaves de API do `.env.example`.
5. Aponte o seu domínio e ative o HTTPS (Let's Encrypt) no painel — é um clique.
6. Deploy. Pronto.

## Opção B — CloudPanel (ou VPS com Docker via SSH)
```bash
# já conectado na VPS, dentro da pasta do projeto:
cp .env.example .env     # edite se tiver chaves (opcional)
docker compose up -d --build
```
O app sobe na porta `8000`. No CloudPanel, crie um site e configure o
**reverse proxy** apontando para `http://127.0.0.1:8000`, e ative o SSL.

## Opção C — Sem Docker (Nginx + systemd)
1. Instale Python 3.12+ e crie o ambiente (passos de "Como rodar", acima).
2. Rode com: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   (ideal como serviço `systemd` para reiniciar sozinho).
3. Configure o Nginx como reverse proxy para a porta 8000 e ative o SSL (certbot).

---
Dúvida comum: qual painel você usa na Hostinger? Diga o nome que eu te passo o
passo a passo exato (tela a tela).
