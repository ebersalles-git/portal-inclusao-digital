/* ============================================================
   Portal Inclusão Digital — interface
   ============================================================ */
(function () {
  "use strict";

  const raiz = document.documentElement;

  /* ---------- 1. Aumentar / diminuir fonte ---------- */
  const ESCALA_MIN = 1, ESCALA_MAX = 1.7, PASSO = 0.1;
  let escala = parseFloat(localStorage.getItem("escala")) || 1;
  function aplicarEscala() {
    escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala));
    raiz.style.setProperty("--escala", escala.toFixed(2));
    try { localStorage.setItem("escala", escala); } catch (e) {}
  }
  aplicarEscala();
  const btnMais = document.getElementById("fonte-mais");
  const btnMenos = document.getElementById("fonte-menos");
  if (btnMais) btnMais.addEventListener("click", () => { escala += PASSO; aplicarEscala(); });
  if (btnMenos) btnMenos.addEventListener("click", () => { escala -= PASSO; aplicarEscala(); });

  /* ---------- 2. Alto contraste ---------- */
  const btnContraste = document.getElementById("alto-contraste");
  function aplicarContraste(ativo) {
    raiz.setAttribute("data-contraste", ativo ? "alto" : "normal");
    if (btnContraste) btnContraste.setAttribute("aria-pressed", ativo ? "true" : "false");
    try { localStorage.setItem("contraste", ativo ? "alto" : "normal"); } catch (e) {}
  }
  aplicarContraste(localStorage.getItem("contraste") === "alto");
  if (btnContraste) {
    btnContraste.addEventListener("click", () =>
      aplicarContraste(raiz.getAttribute("data-contraste") !== "alto"));
  }

  /* ---------- 3. Ouvir a página (Web Speech API) ---------- */
  const btnOuvir = document.getElementById("ouvir-pagina");
  const temVoz = "speechSynthesis" in window;
  let lendo = false;
  function pararLeitura() {
    if (temVoz) window.speechSynthesis.cancel();
    lendo = false;
    if (btnOuvir) { btnOuvir.setAttribute("aria-pressed", "false"); btnOuvir.querySelector(".txt").textContent = "Ouvir Página"; }
  }
  function lerTexto(texto) {
    if (!temVoz) { alert("Seu navegador não permite a leitura em voz. Tente pelo Google Chrome."); return; }
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.95;
    fala.onend = pararLeitura;
    window.speechSynthesis.speak(fala);
  }
  if (btnOuvir) {
    btnOuvir.addEventListener("click", function () {
      if (lendo) { pararLeitura(); return; }
      const alvo = document.querySelector("main") || document.body;
      const texto = alvo.innerText.replace(/\s+/g, " ").trim();
      lerTexto(texto);
      lendo = true;
      btnOuvir.setAttribute("aria-pressed", "true");
      btnOuvir.querySelector(".txt").textContent = "Parar leitura";
    });
  }
  window.addEventListener("beforeunload", pararLeitura);

  // botões "ouvir este trecho" (data-ler)
  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-ler]");
    if (!b) return;
    lerTexto(b.getAttribute("data-ler"));
  });

  /* ---------- 4. FAQ (acordeão) ---------- */
  const faqLista = document.getElementById("faq-lista");
  if (faqLista && window.FAQ) {
    window.FAQ.forEach((item, i) => {
      const wrap = document.createElement("div");
      wrap.className = "faq-item";
      wrap.innerHTML =
        '<button class="faq-pergunta" aria-expanded="false" aria-controls="faq-r-' + i + '" id="faq-p-' + i + '">' +
          '<span>' + item.p + '</span><span class="mais" aria-hidden="true">+</span>' +
        '</button>' +
        '<div class="faq-resposta" id="faq-r-' + i + '" role="region" aria-labelledby="faq-p-' + i + '">' +
          '<p>' + item.r + '</p>' +
        '</div>';
      faqLista.appendChild(wrap);
    });
    faqLista.addEventListener("click", function (e) {
      const btn = e.target.closest(".faq-pergunta");
      if (!btn) return;
      const aberto = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", aberto ? "false" : "true");
      btn.querySelector(".mais").textContent = aberto ? "+" : "–";
      const resp = document.getElementById(btn.getAttribute("aria-controls"));
      resp.classList.toggle("aberta", !aberto);
    });
  }

  /* ---------- 5. Modal de tutorial ---------- */
  const modal = document.getElementById("modal-tutorial");
  const modalCab = document.getElementById("modal-cabecalho");
  const modalCorpo = document.getElementById("modal-corpo");
  const modalTitulo = document.getElementById("modal-titulo");
  let ultimoFoco = null;
  const ORDEM_ABAS = [
    ["entrar", "Entrar"],
    ["criar", "Criar conta"],
    ["depois", "Depois de entrar"],
    ["senha", "Esqueci a senha"],
  ];

  function montarAba(serv, chave) {
    const aba = serv.abas[chave];
    if (!aba) return "";
    let html = '<h3>' + aba.titulo + '</h3><div class="passos">';
    aba.passos.forEach((p, i) => {
      html +=
        '<div class="passo">' +
          '<div class="num" aria-hidden="true">' + (i + 1) + '</div>' +
          '<div class="passo-txt"><h4>' + p.t + '</h4><p>' + p.d + '</p></div>' +
        '</div>';
    });
    html += '</div>';
    return html;
  }

  function abrirTutorial(id) {
    const serv = window.SERVICOS[id];
    if (!serv || !modal) return;
    ultimoFoco = document.activeElement;
    modalCab.style.setProperty("--cor", serv.cor);
    modalCorpo.style.setProperty("--cor", serv.cor);
    modalTitulo.textContent = "Passo a passo: " + serv.nome;

    const abasDisp = ORDEM_ABAS.filter(([c]) => serv.abas[c]);
    let abasHtml = '<div class="aba-tutorial" role="tablist">';
    abasDisp.forEach(([chave, rotulo], i) => {
      abasHtml += '<button role="tab" data-aba="' + chave + '" aria-selected="' +
        (i === 0 ? "true" : "false") + '">' + rotulo + '</button>';
    });
    abasHtml += '</div><div id="aba-conteudo">' + montarAba(serv, abasDisp[0][0]) + '</div>';

    const textoOuvir = (serv.abas[abasDisp[0][0]].titulo + ". " +
      serv.abas[abasDisp[0][0]].passos.map((p, i) => (i + 1) + ". " + p.t + ". " + p.d).join(" "))
      .replace(/"/g, "'");

    abasHtml +=
      '<p class="ajuda-tutorial">🆘 ' + serv.ajuda + '</p>' +
      '<div class="aviso-tutorial">⚠️ ' + serv.aviso + '</div>' +
      '<div class="modal-rodape" style="padding:20px 0 0">' +
        '<a class="botao botao-principal" style="--cor:' + serv.cor + '" href="' +
          serv.site + '" target="_blank" rel="noopener noreferrer">' +
          'Abrir o site oficial agora <span class="seta" aria-hidden="true">↗</span></a>' +
        '<p style="margin-top:10px;font-weight:600">Você vai para: <strong>' + serv.site + '</strong></p>' +
      '</div>';

    modalCorpo.innerHTML = abasHtml;
    modal.classList.add("aberto");
    document.body.style.overflow = "hidden";
    const fechar = document.getElementById("fechar-modal");
    if (fechar) fechar.focus();
  }

  // trocar de aba dentro do modal
  if (modalCorpo) {
    modalCorpo.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-aba]");
      if (!tab) return;
      const id = modal.getAttribute("data-servico");
      const serv = window.SERVICOS[id];
      modalCorpo.querySelectorAll("[data-aba]").forEach(t =>
        t.setAttribute("aria-selected", t === tab ? "true" : "false"));
      document.getElementById("aba-conteudo").innerHTML = montarAba(serv, tab.getAttribute("data-aba"));
    });
  }

  function fecharModal() {
    if (!modal) return;
    pararLeitura();
    modal.classList.remove("aberto");
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  // abrir tutorial pelos botões dos cartões
  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-tutorial]");
    if (b) {
      const id = b.getAttribute("data-tutorial");
      modal.setAttribute("data-servico", id);
      abrirTutorial(id);
    }
  });

  const btnFechar = document.getElementById("fechar-modal");
  if (btnFechar) btnFechar.addEventListener("click", fecharModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });

  /* ---------- 6. Verificador de Notícias ---------- */
  const form = document.getElementById("form-verificador");
  const entrada = document.getElementById("entrada");
  const resultado = document.getElementById("resultado");
  const carregando = document.getElementById("carregando");

  function pintarResultado(data) {
    let classe = "neutro";
    if (data.status === "verdadeiro") classe = "verde";
    else if (data.status === "falso") classe = "vermelho";

    let html = '<h3>' + (data.status === "falso" ? "❌ " : data.status === "verdadeiro" ? "✅ " : "⚠️ ") +
      escapar(data.titulo) + '</h3><p>' + escapar(data.mensagem) + '</p>';
    if (data.fonte) {
      html += '<p>Fonte da checagem: <strong>' + escapar(data.fonte) + '</strong></p>';
    }
    if (data.url_fonte) {
      html += '<a class="fonte-link" href="' + encodeURI(data.url_fonte) +
        '" target="_blank" rel="noopener noreferrer">Ver a checagem completa ↗</a>';
    }
    const textoWhats =
      "Olá! Verifiquei essa mensagem no portal de inclusão digital. " +
      data.titulo + ": " + data.mensagem +
      " Na dúvida, confirme sempre em sites oficiais (.gov.br). 💙";
    html +=
      '<div class="acoes-res">' +
        '<button type="button" class="botao botao-secundario" style="width:auto;--cor:var(--marinho)" ' +
          'data-copiar="' + escaparAttr(textoWhats) + '">📋 Copiar resposta para o WhatsApp</button>' +
        '<button type="button" class="botao botao-secundario" style="width:auto;--cor:var(--vinho)" ' +
          'data-ler="' + escaparAttr(data.titulo + ". " + data.mensagem) + '">🔊 Ouvir resposta</button>' +
      '</div>';

    resultado.className = "resultado mostrar " + classe;
    resultado.innerHTML = html;
    resultado.setAttribute("tabindex", "-1");
    resultado.focus();
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const texto = (entrada.value || "").trim();
      if (texto.length < 3) {
        entrada.focus();
        return;
      }
      resultado.className = "resultado";
      carregando.classList.add("mostrar");
      try {
        const resp = await fetch("/api/verificar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: texto }),
        });
        const data = await resp.json();
        pintarResultado(data);
      } catch (err) {
        pintarResultado({
          status: "erro",
          titulo: "Não consegui verificar agora",
          mensagem: "Tive um problema de conexão. Por segurança, não repasse a mensagem até ter certeza.",
          fonte: null, url_fonte: null,
        });
      } finally {
        carregando.classList.remove("mostrar");
      }
    });
  }

  // copiar para o WhatsApp / área de transferência
  document.addEventListener("click", async function (e) {
    const b = e.target.closest("[data-copiar]");
    if (!b) return;
    const texto = b.getAttribute("data-copiar");
    try {
      await navigator.clipboard.writeText(texto);
      const original = b.textContent;
      b.textContent = "✅ Copiado! Agora é só colar no WhatsApp";
      setTimeout(() => { b.textContent = original; }, 3000);
    } catch (err) {
      // reserva: seleciona num campo temporário
      const ta = document.createElement("textarea");
      ta.value = texto; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) {}
      document.body.removeChild(ta);
      b.textContent = "✅ Copiado!";
    }
  });

  /* ---------- utilitários ---------- */
  function escapar(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function escaparAttr(s) {
    return escapar(s).replace(/"/g, "&quot;");
  }
})();
