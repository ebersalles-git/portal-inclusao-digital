
Por favor, atue como um desenvolvedor web especialista em acessibilidade e crie o código de um site voltado à inclusão digital de idosos, focado em facilidade extrema de uso e autonomia.

### 1. Diretrizes Visuais e Acessibilidade (Foco no Idoso)
* *Tipografia e Contraste:* Fontes grandes (mínimo 18px para texto base), legíveis, sem serifa e com excelente contraste.
* *Paleta de Cores:* Fundo e base sofisticados em azul-marinho e vinho, mantendo alto contraste em textos e áreas de clique.
* *Barra de Acessibilidade Superior:*
  * Botões de "Aumentar Fonte (+A)" e "Diminuir Fonte (-A)".
  * Botão de "Alto Contraste" (preto e amarelo/branco).
  * Botão de "Ouvir Página" (leitura por voz sintética via Web Speech API).
* *Alerta Antigolpe no Topo:* Uma faixa de destaque com fundo suave alertando: "Atenção: O governo oficial termina em .gov.br e NUNCA pede senhas por mensagens ou ligações."

---

### 2. Estrutura da Página Principal (Home)

1. *Acesso Direto aos Serviços Oficiais:*
   * 4 cartões com botões grandes, bem espaçados, com ícones claros e cores distintas:
     * *INSS* (Azul)
     * *Gov.br* (Verde)
     * *Acesso Cidadão* (Laranja)
     * *FGTS* (Amarelo)
   * Ao lado ou abaixo de cada botão, insira um player ou container para vídeo curto/tutorial em formato visual ("passo a passo" simples e direto). Produzam esse vídeo de acordo com as imagens que estou enviando como referência. 

2. *Verificador de Notícias (Bot Antifake):*
   * Interface limpa de chat: uma caixa de texto ampla com texto de apoio amigável ("Cole aqui o link ou a mensagem que você recebeu no WhatsApp").
   * Um botão de ação grande e visível: *"Verificar Notícia"*.
   * Resposta do bot:
     * Card verde para notícias verdadeiras/seguras.
     * Card vermelho para notícias falsas/enganosas, citando a fonte oficial da checagem.
     * Se não houver dados: "Essa informação ainda não foi verificada por agências confiáveis. Por segurança, evite repassar."
     * Inclua um botão *"Copiar resposta para o WhatsApp"*, permitindo que o idoso responda a quem enviou o boato com um aviso gentil.

3. *Perguntas Frequentes (FAQ):*
   * Acordeão simples (clicou, abre a resposta em letras grandes) respondendo às 6 dúvidas digitais mais comuns de idosos.

---

### 3. Código do Backend do Verificador (Python / Script à parte)
Escreva um script simples em Python (FastAPI ou Flask) para processar o verificador:
* Recebe a URL ou texto enviado pelo formulário.
* Extrai o conteúdo principal da página.
* Faz a requisição à *Google Fact Check Tools API* (em português).
* Utiliza um prompt estruturado para LLM formatar o resultado em até 3 frases acolhedoras, sem jargões técnicos da internet, dizendo de forma clara se a mensagem é segura ou se é boato.

---

### 4. Segunda Página: O Projeto Social
Crie a estrutura para a segunda aba/página institucional:
* *Ação Social da Igreja Cristã Maranata:* Destaque para o funcionamento da assistência digital à comunidade, espaços para fotos de ações sociais e menção aos líderes do projeto.
* *Créditos Acadêmicos:*
  * Projeto interdisciplinar da disciplina de Sociologia – Faculdade de Direito de Vitória (FDV).
  * Tema: Inclusão digital de idosos em situação de vulnerabilidade socioeconômica.
  * Professor Orientador: Antônio Leal.
  * Alunas participantes: Mariana Salles, Isabela Donatti, Giovana Israel, Ana Luiza Zanelato, Isabela Rosário e Manuela Fiorotti.
  * Espaço reservado para o logotipo da FDV.

Por favor, forneça o HTML, CSS e JavaScript da interface prontos para uso, além do script em Python do backend de checagem.