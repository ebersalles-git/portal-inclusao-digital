/* ============================================================
   Portal Inclusão Digital — interface
   ============================================================ */
(function () {
  "use strict";

  const raiz = document.documentElement;
  const $ = (id) => document.getElementById(id);

  function guardar(chave, valor) { try { localStorage.setItem(chave, valor); } catch (e) {} }
  function ler(chave) { try { return localStorage.getItem(chave); } catch (e) { return null; } }

  /* ---------- 1. Tamanho da letra ---------- */
  const ESCALA_MIN = 1, ESCALA_MAX = 1.7, PASSO = 0.1;
  let escala = parseFloat(ler("escala")) || 1;
  function aplicarEscala() {
    escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala));
    raiz.style.setProperty("--escala", escala.toFixed(2));
    guardar("escala", escala);
  }
  aplicarEscala();
  if ($("fonte-mais")) $("fonte-mais").addEventListener("click", () => { escala += PASSO; aplicarEscala(); });
  if ($("fonte-menos")) $("fonte-menos").addEventListener("click", () => { escala -= PASSO; aplicarEscala(); });

  /* ---------- 2. Alto contraste ---------- */
  const btnContraste = $("alto-contraste");
  function aplicarContraste(ativo) {
    raiz.setAttribute("data-contraste", ativo ? "alto" : "normal");
    if (btnContraste) btnContraste.setAttribute("aria-pressed", ativo ? "true" : "false");
    guardar("contraste", ativo ? "alto" : "normal");
  }
  aplicarContraste(ler("contraste") === "alto");
  if (btnContraste) btnContraste.addEventListener("click", () =>
    aplicarContraste(raiz.getAttribute("data-contraste") !== "alto"));

  /* ---------- 3. Leitura em voz ---------- */
  const btnOuvir = $("ouvir-pagina");
  const temVoz = "speechSynthesis" in window;
  let lendo = false;
  function pararLeitura() {
    if (temVoz) window.speechSynthesis.cancel();
    lendo = false;
    if (btnOuvir) { btnOuvir.setAttribute("aria-pressed", "false"); btnOuvir.querySelector(".txt").textContent = "Ouvir página"; }
  }
  function lerTexto(texto) {
    if (!temVoz) { avisar("Seu navegador não tem leitura em voz. Tente pelo Google Chrome."); return; }
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.92;
    fala.onend = pararLeitura;
    window.speechSynthesis.speak(fala);
  }
  if (btnOuvir) {
    btnOuvir.addEventListener("click", function () {
      if (lendo) { pararLeitura(); return; }
      const alvo = (modal && modal.classList.contains("aberto")) ? modalCorpo : (document.querySelector("main") || document.body);
      lerTexto(alvo.innerText.replace(/\s+/g, " ").trim());
      lendo = true;
      btnOuvir.setAttribute("aria-pressed", "true");
      btnOuvir.querySelector(".txt").textContent = "Parar leitura";
    });
  }
  window.addEventListener("beforeunload", pararLeitura);
  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-ler]");
    if (b) lerTexto(b.getAttribute("data-ler"));
  });
  function avisar(msg) {
    const r = $("resultado");
    if (r) { r.className = "resultado mostrar neutro"; r.textContent = msg; }
  }

  /* ---------- 4. Cartões de serviço ---------- */
  function logoHtml(s, classe) {
    if (s.logo) {
      return '<div class="' + classe + (s.logoLargo ? " largo" : "") + '"><img src="' + s.logo +
        '" alt="Logotipo ' + s.nome + '" loading="lazy" /></div>';
    }
    return '<div class="' + classe + ' emoji" aria-hidden="true">' + (s.icone || "📱") + '</div>';
  }

  const grade = $("grade-servicos");
  const gradeDia = $("grade-dia");
  if (grade && window.SERVICOS) {
    Object.keys(window.SERVICOS).forEach(function (id) {
      const s = window.SERVICOS[id];
      if (s.grupo === "governo") {
        const card = document.createElement("article");
        card.className = "servico";
        card.style.setProperty("--cor", s.cor);
        card.innerHTML =
          logoHtml(s, "logo-serv") +
          '<h3>' + s.nome + (s.subnome ? '<span class="subnome">' + s.subnome + '</span>' : "") + '</h3>' +
          '<p class="desc">' + s.descricao + '</p>' +
          '<div class="acoes">' +
            '<button class="botao botao-principal" type="button" style="--cor:' + s.cor + '" data-abrir="' + id + '">📖 Passo a passo</button>' +
            '<a class="botao botao-secundario" style="--cor:' + s.cor + '" href="' + s.site + '" target="_blank" rel="noopener noreferrer">Site oficial ↗</a>' +
          '</div>';
        grade.appendChild(card);
      } else if (gradeDia) {
        const card = document.createElement("article");
        card.className = "dia";
        card.style.setProperty("--cor", s.cor);
        let extra = "";
        if (s.tipo === "emergencia" && window.EMERGENCIA) {
          extra = '<div class="atalhos">' + window.EMERGENCIA.slice(0, 3).map(function (n) {
            return '<a href="tel:' + n.n + '" aria-label="Ligar ' + n.n + ', ' + n.nome + '"><b>' + n.n + '</b><span>' + n.nome + '</span></a>';
          }).join("") + '</div>';
        }
        const rotulo = s.tipo === "emergencia" ? "Ver todos os números" : s.tipo === "jogos" ? "Jogar agora" : "Ver as dicas";
        card.innerHTML =
          '<span class="emoji" aria-hidden="true">' + s.icone + '</span>' +
          '<h3>' + s.nome + '</h3><p>' + s.descricao + '</p>' + extra +
          '<button class="botao botao-principal botao-largo" type="button" style="--cor:' + s.cor + '" data-abrir="' + id + '">' + rotulo + '</button>';
        gradeDia.appendChild(card);
      }
    });
  }

  /* ---------- 5. FAQ ---------- */
  const faqLista = $("faq-lista");
  if (faqLista && window.FAQ) {
    window.FAQ.forEach((item, i) => {
      const wrap = document.createElement("div");
      wrap.className = "faq-item";
      wrap.innerHTML =
        '<button class="faq-pergunta" aria-expanded="false" aria-controls="faq-r-' + i + '" id="faq-p-' + i + '">' +
          '<span>' + item.p + '</span><span class="mais" aria-hidden="true">+</span></button>' +
        '<div class="faq-resposta" id="faq-r-' + i + '" role="region" aria-labelledby="faq-p-' + i + '"><p>' + item.r + '</p></div>';
      faqLista.appendChild(wrap);
    });
    faqLista.addEventListener("click", function (e) {
      const btn = e.target.closest(".faq-pergunta");
      if (!btn) return;
      const aberto = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", aberto ? "false" : "true");
      $(btn.getAttribute("aria-controls")).classList.toggle("aberta", !aberto);
    });
  }

  /* ---------- 6. Janela (passo a passo, emergência, jogos) ---------- */
  const modal = $("modal-tutorial");
  const modalCab = $("modal-cabecalho");
  const modalCorpo = $("modal-corpo");
  const modalTitulo = $("modal-titulo");
  const modalLogo = $("modal-logo");
  let ultimoFoco = null;
  let servAtual = null;
  const ORDEM_ABAS = [["entrar", "Entrar"], ["criar", "Criar conta"], ["depois", "Depois de entrar"], ["senha", "Esqueci a senha"]];

  function telaHtml(tela, cor) {
    if (!tela) return "";
    const classes = { topo: "c-topo", texto: "c-texto", campo: "c-campo", botao: "c-botao", link: "c-link", lista: "c-lista", icone: "c-icone" };
    return '<div class="cel" style="--cor:' + cor + '" aria-hidden="true">' +
      tela.itens.map(function (it) {
        return '<div class="' + classes[it[0]] + (it[2] ? " alvo" : "") + '">' + (it[1] || "&nbsp;") + '</div>';
      }).join("") + '</div>';
  }

  function montarAba(serv, chave) {
    const aba = serv.abas[chave];
    const texto = (aba.titulo + ". " + aba.passos.map((p, i) => "Passo " + (i + 1) + ". " + p.t + ". " + p.d).join(" "));
    let html = '<div class="aba-titulo"><h3>' + aba.titulo + '</h3>' +
      '<button type="button" class="btn-ouvir" data-ler="' + escaparAttr(texto) + '">🔊 Ouvir estes passos</button></div>' +
      '<ol class="passos" style="list-style:none;padding:0;margin:0">';
    aba.passos.forEach((p, i) => {
      html += '<li class="passo"><div class="num" aria-hidden="true">' + (i + 1) + '</div>' +
        '<div class="passo-txt"><h4><span class="sr">Passo ' + (i + 1) + ': </span>' + p.t + '</h4><p>' + p.d + '</p></div>' +
        telaHtml(p.tela, serv.cor) + '</li>';
    });
    return html + '</ol>';
  }

  function corpoTutorial(serv) {
    const abas = ORDEM_ABAS.filter(([c]) => serv.abas[c]);
    let html = '<div class="aba-tutorial" role="tablist" aria-label="Escolha o que você quer fazer">';
    abas.forEach(([chave, rotulo], i) => {
      const nome = (serv.rotulos && serv.rotulos[chave]) || rotulo;
      html += '<button role="tab" type="button" data-aba="' + chave + '" aria-selected="' + (i === 0) + '">' + nome + '</button>';
    });
    html += '</div><div id="aba-conteudo">' + montarAba(serv, abas[0][0]) + '</div>';
    if (serv.ajuda) html += '<p class="ajuda-tutorial">🆘 ' + serv.ajuda + '</p>';
    if (serv.aviso) html += '<div class="aviso-tutorial">⚠️ ' + serv.aviso + '</div>';
    if (serv.site) {
      html += '<div class="modal-rodape"><a class="botao botao-principal" style="--cor:' + serv.cor + '" href="' + serv.site +
        '" target="_blank" rel="noopener noreferrer">Abrir o site oficial ↗</a>' +
        '<small>Você vai para: <strong>' + serv.site.replace(/^https?:\/\//, "").replace(/\/$/, "") + '</strong></small></div>';
    }
    return html;
  }

  function corpoEmergencia() {
    return '<p style="font-weight:700">Toque no número para ligar. As ligações são gratuitas, mesmo sem crédito.</p>' +
      '<div class="grade-emerg">' + window.EMERGENCIA.map(function (n) {
        return '<a class="ligar" style="--cor:' + n.cor + '" href="tel:' + n.n + '"><b>' + n.n + '</b><strong>' + n.nome +
          '</strong><span>' + n.d + '</span></a>';
      }).join("") + '</div>' +
      '<div class="aviso-tutorial">💡 Dica: anote estes números num papel e deixe perto do telefone ou na geladeira.</div>';
  }

  function corpoJogos() {
    return '<div class="jogo" id="jogo-memoria"><div class="jogo-topo"><h3>Jogo da memória</h3>' +
        '<span class="jogo-status" id="mem-status"></span></div>' +
        '<p>Toque em duas cartas para virar. Encontre os pares iguais.</p>' +
        '<div class="memoria" id="memoria"></div>' +
        '<div class="linha-acoes"><button type="button" class="botao botao-secundario" id="mem-novo">↺ Começar de novo</button></div></div>' +
      '<div class="jogo"><div class="jogo-topo"><h3>Palavra embaralhada</h3><span class="jogo-status" id="pal-status"></span></div>' +
        '<p>As letras estão fora de ordem. Que palavra é essa?</p>' +
        '<p class="embaralhada" id="pal-letras"></p><p id="pal-dica" style="color:var(--tinta-2)"></p>' +
        '<form id="pal-form"><label for="pal-resp" class="sr">Sua resposta</label>' +
        '<input type="text" id="pal-resp" autocomplete="off" autocapitalize="characters" placeholder="Escreva aqui" />' +
        '<div class="linha-acoes"><button type="submit" class="botao botao-principal">Conferir</button>' +
        '<button type="button" class="botao botao-secundario" id="pal-pular">Outra palavra</button></div></form>' +
        '<p class="retorno" id="pal-retorno" role="status" aria-live="polite"></p></div>' +
      '<div class="aviso-tutorial" style="background:#f1ebfa;border-color:var(--cor);color:inherit">🧠 Outras ideias para exercitar a mente: palavras cruzadas, caça-palavras, ler em voz alta, aprender uma música nova e conversar com amigos.</div>';
  }

  function abrir(id) {
    const serv = window.SERVICOS[id];
    if (!serv || !modal) return;
    servAtual = serv;
    ultimoFoco = document.activeElement;
    [modalCab, modalCorpo].forEach((el) => el.style.setProperty("--cor", serv.cor));
    modalTitulo.textContent = serv.tipo ? serv.nome : "Passo a passo: " + serv.nome;
    modalLogo.innerHTML = serv.logo ? '<img src="' + serv.logo + '" alt="" />' : (serv.icone || "");
    if (serv.tipo === "emergencia") modalCorpo.innerHTML = corpoEmergencia();
    else if (serv.tipo === "jogos") { modalCorpo.innerHTML = corpoJogos(); iniciarMemoria(); novaPalavra(); }
    else modalCorpo.innerHTML = corpoTutorial(serv);
    modal.classList.add("aberto");
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
    $("fechar-modal").focus();
  }

  function fecharModal() {
    if (!modal || !modal.classList.contains("aberto")) return;
    pararLeitura();
    modal.classList.remove("aberto");
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  if (modalCorpo) {
    modalCorpo.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-aba]");
      if (!tab || !servAtual) return;
      pararLeitura();
      modalCorpo.querySelectorAll("[data-aba]").forEach(t => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
      $("aba-conteudo").innerHTML = montarAba(servAtual, tab.getAttribute("data-aba"));
    });
  }
  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-abrir]");
    if (b) abrir(b.getAttribute("data-abrir"));
  });
  if ($("fechar-modal")) $("fechar-modal").addEventListener("click", fecharModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });

  /* ---------- 7. Jogos ---------- */
  const FIGURAS = ["🌻", "🐶", "☕", "🍎", "🏠", "🎵"];
  let memVirada = [], memPares = 0, memJogadas = 0, memTravado = false;

  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function iniciarMemoria() {
    const area = $("memoria");
    if (!area) return;
    memVirada = []; memPares = 0; memJogadas = 0; memTravado = false;
    area.innerHTML = "";
    embaralhar(FIGURAS.concat(FIGURAS)).forEach(function (f, i) {
      const c = document.createElement("button");
      c.type = "button"; c.className = "carta"; c.dataset.fig = f;
      c.setAttribute("aria-label", "Carta " + (i + 1) + ", virada para baixo");
      c.innerHTML = '<span aria-hidden="true">' + f + '</span>';
      area.appendChild(c);
    });
    $("mem-status").textContent = "Pares: 0 de " + FIGURAS.length;
  }
  document.addEventListener("click", function (e) {
    if (e.target.id === "mem-novo") { iniciarMemoria(); return; }
    const c = e.target.closest(".carta");
    if (!c || memTravado || c.classList.contains("virada") || c.classList.contains("par")) return;
    c.classList.add("virada");
    c.setAttribute("aria-label", "Carta virada: " + c.dataset.fig);
    memVirada.push(c);
    if (memVirada.length < 2) return;
    memJogadas++;
    const [a, b] = memVirada;
    if (a.dataset.fig === b.dataset.fig) {
      a.classList.add("par"); b.classList.add("par");
      memVirada = []; memPares++;
      $("mem-status").textContent = memPares === FIGURAS.length
        ? "🎉 Parabéns! Você terminou em " + memJogadas + " jogadas."
        : "Pares: " + memPares + " de " + FIGURAS.length;
    } else {
      memTravado = true;
      setTimeout(function () {
        [a, b].forEach((x) => { x.classList.remove("virada"); x.setAttribute("aria-label", "Carta virada para baixo"); });
        memVirada = []; memTravado = false;
      }, 1100);
    }
  });

  let palAtual = null, palAcertos = 0;
  function novaPalavra() {
    if (!$("pal-letras") || !window.PALAVRAS) return;
    let p;
    do { p = window.PALAVRAS[Math.floor(Math.random() * window.PALAVRAS.length)]; } while (window.PALAVRAS.length > 1 && palAtual && p[0] === palAtual[0]);
    palAtual = p;
    let mist;
    do { mist = embaralhar(p[0].split("")).join(""); } while (mist === p[0]);
    $("pal-letras").textContent = mist;
    $("pal-dica").textContent = "Dica: " + p[1];
    $("pal-resp").value = "";
    $("pal-retorno").textContent = "";
    $("pal-status").textContent = "Acertos: " + palAcertos;
  }
  function semAcento(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim(); }
  document.addEventListener("submit", function (e) {
    if (e.target.id !== "pal-form") return;
    e.preventDefault();
    const resp = semAcento($("pal-resp").value);
    if (!resp) return;
    if (resp === palAtual[0]) {
      palAcertos++;
      $("pal-retorno").textContent = "✅ Muito bem! A palavra é " + palAtual[0] + ".";
      $("pal-status").textContent = "Acertos: " + palAcertos;
      setTimeout(novaPalavra, 1800);
    } else {
      $("pal-retorno").textContent = "Quase! Tente de novo, com calma.";
    }
  });
  document.addEventListener("click", function (e) { if (e.target.id === "pal-pular") novaPalavra(); });

  /* ---------- 8. Verificador de Notícias ---------- */
  const form = $("form-verificador");
  const entrada = $("entrada");
  const resultado = $("resultado");
  const carregando = $("carregando");
  const btnVerificar = $("btn-verificar");

  const VISUAL = {
    oficial: ["verde", "✅"], confiavel: ["verde", "✅"], verdadeiro: ["verde", "✅"],
    falso: ["vermelho", "❌"], suspeito: ["vermelho", "🚩"],
  };

  function pintarResultado(data) {
    const [classe, selo] = VISUAL[data.status] || ["neutro", "⚠️"];
    let html = '<h3><span class="selo" aria-hidden="true">' + selo + '</span>' + escapar(data.titulo) + '</h3>' +
      '<p>' + escapar(data.mensagem) + '</p>';
    if (data.titulo_pagina) html += '<p class="pagina">Página analisada: “' + escapar(data.titulo_pagina) + '”</p>';
    if (data.motivos && data.motivos.length) {
      html += '<ul class="motivos">' + data.motivos.map((m) => '<li>' + escapar(m) + '</li>').join("") + '</ul>';
    }
    if (data.fonte) html += '<p>Fonte da checagem: <strong>' + escapar(data.fonte) + '</strong></p>';
    if (data.url_fonte && /^https?:\/\//i.test(data.url_fonte)) {
      html += '<a class="fonte-link" href="' + escaparAttr(data.url_fonte) + '" target="_blank" rel="noopener noreferrer">Ver a checagem completa ↗</a>';
    }
    const textoWhats = "Olá! Conferi essa mensagem no Portal Inclusão Digital. " + data.titulo + ": " + data.mensagem +
      " Na dúvida, confirme sempre em sites oficiais (.gov.br). 💙";
    html += '<div class="acoes-res">' +
      '<button type="button" class="botao botao-secundario" style="--cor:var(--marinho)" data-copiar="' + escaparAttr(textoWhats) + '">📋 Copiar resposta para o WhatsApp</button>' +
      '<button type="button" class="botao botao-secundario" style="--cor:var(--vinho)" data-ler="' + escaparAttr(data.titulo + ". " + data.mensagem) + '">🔊 Ouvir resposta</button>' +
      '</div>';
    resultado.className = "resultado mostrar " + classe;
    resultado.innerHTML = html;
    resultado.setAttribute("tabindex", "-1");
    resultado.focus();
  }

  function limparConsulta() {
    pararLeitura();
    entrada.value = "";
    resultado.className = "resultado";
    resultado.innerHTML = "";
    carregando.classList.remove("mostrar");
    if (btnVerificar) btnVerificar.disabled = false;
    entrada.focus();
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const texto = (entrada.value || "").trim();
      if (texto.length < 3) { entrada.focus(); return; }
      resultado.className = "resultado";
      carregando.classList.add("mostrar");
      btnVerificar.disabled = true;
      try {
        const resp = await fetch("/api/verificar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: texto }),
        });
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        pintarResultado(await resp.json());
      } catch (err) {
        pintarResultado({
          status: "erro", titulo: "Não consegui verificar agora",
          mensagem: "A conexão falhou. Confira se a internet está ligada e tente de novo. Enquanto isso, não repasse a mensagem.",
        });
      } finally {
        carregando.classList.remove("mostrar");
        btnVerificar.disabled = false;
      }
    });
  }
  if ($("btn-limpar")) $("btn-limpar").addEventListener("click", limparConsulta);

  document.addEventListener("click", async function (e) {
    const b = e.target.closest("[data-copiar]");
    if (!b) return;
    const texto = b.getAttribute("data-copiar");
    const original = b.textContent;
    try {
      await navigator.clipboard.writeText(texto);
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = texto; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) {}
      document.body.removeChild(ta);
    }
    b.textContent = "✅ Copiado! Agora é só colar no WhatsApp";
    setTimeout(() => { b.textContent = original; }, 3000);
  });

  /* ---------- 9. Galeria (página do projeto) ---------- */
  const galeria = $("galeria");
  if (galeria && window.GALERIA) {
    window.GALERIA.forEach(function (f, i) {
      const fig = document.createElement("figure");
      fig.innerHTML = '<img src="/img/fotos/' + f.arquivo + '" alt="' + escaparAttr(f.legenda) + '" />' +
        '<div class="vaga"><span>📷 Foto ' + (i + 1) + '<br><small>arquivo: img/fotos/' + f.arquivo + '</small></span></div>' +
        '<figcaption>' + escapar(f.legenda) + '</figcaption>';
      fig.querySelector("img").addEventListener("error", () => fig.classList.add("vazia"));
      galeria.appendChild(fig);
    });
  }

  /* ---------- utilitários ---------- */
  function escapar(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function escaparAttr(s) { return escapar(s).replace(/"/g, "&quot;"); }
})();
