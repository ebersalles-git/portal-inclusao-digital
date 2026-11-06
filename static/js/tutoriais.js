/* ============================================================
   Conteúdo do portal: serviços, passo a passo, dicas, emergência,
   jogos e perguntas frequentes.

   Cada passo pode ter uma "tela": um desenho simples de celular
   mostrando ONDE tocar (o círculo amarelo é o dedo).
   Itens da tela:  ["topo", "texto"]   barra de título do app
                   ["texto", "..."]    frase na tela
                   ["campo", "..."]    caixa para escrever
                   ["botao", "...", true]  botão (true = tocar aqui)
                   ["link", "...", true]   texto clicável
                   ["lista", "...", true]  item de menu
                   ["icone", "🔒"]     desenho grande
   ============================================================ */

/* Botões da primeira tela, repetidos em vários apps que usam gov.br */
const T_GOVBR_BOTAO = (app) => ({ itens: [["topo", app], ["icone", "📱"], ["botao", "Entrar com gov.br", true]] });
const T_CPF = { itens: [["topo", "gov.br"], ["texto", "Digite seu CPF"], ["campo", "000.000.000-00"], ["botao", "Continuar", true]] };
const T_SENHA = { itens: [["topo", "gov.br"], ["texto", "Digite sua senha"], ["campo", "• • • • • • • •"], ["botao", "Entrar", true]] };
const T_ESQUECI = { itens: [["topo", "gov.br"], ["texto", "Digite sua senha"], ["campo", ""], ["link", "Esqueci minha senha", true], ["botao", "Entrar"]] };

/* Os 3 passos para entrar com gov.br — usados em quase todos os serviços */
const passosEntrarGovbr = (app, primeiro) => [
  { t: primeiro || 'Toque em "Entrar com gov.br"', d: `Abra o ${app}. Na primeira tela, toque uma vez no botão azul "Entrar com gov.br".`, tela: T_GOVBR_BOTAO(app) },
  { t: "Digite o seu CPF", d: "Escreva só os 11 números do CPF, sem ponto nem traço. Depois toque em Continuar.", tela: T_CPF },
  { t: "Digite a sua senha do gov.br", d: "É a mesma senha que você usa no gov.br. Toque em Entrar. Se aparecer um pedido de código, ele chega por SMS ou pelo app gov.br.", tela: T_SENHA },
];

const passosSenhaGovbr = (app) => [
  { t: "Comece a entrar normalmente", d: `No ${app}, toque em "Entrar com gov.br" e digite o seu CPF.`, tela: T_CPF },
  { t: 'Toque em "Esqueci minha senha"', d: "Fica logo abaixo do lugar da senha. Toque nele.", tela: T_ESQUECI },
  { t: "Escolha como recuperar", d: "Pode ser pelo e-mail, pelo celular (SMS) ou pela foto do rosto no app gov.br. Escolha a que for mais fácil e siga as telas.", tela: { itens: [["topo", "gov.br"], ["texto", "Recuperar senha"], ["lista", "Por e-mail"], ["lista", "Por SMS", true], ["lista", "Pelo rosto (app)"]] } },
  { t: "Crie a nova senha e anote", d: "Escolha uma senha nova, anote num papel e guarde em casa, longe da carteira.", tela: { itens: [["topo", "gov.br"], ["icone", "🔒"], ["campo", "Nova senha"], ["botao", "Salvar", true]] } },
];

window.SERVICOS = {
  /* ------------------------------------------------------------ */
  inss: {
    nome: "Meu INSS",
    grupo: "governo",
    cor: "#1565c0",
    logo: "/img/logos/meuinss.png",
    descricao: "Extrato de pagamento, perícia, aposentadoria e pedidos ao INSS.",
    site: "https://meu.inss.gov.br/",
    app: "Meu INSS",
    ajuda: "Ligue 135 (de telefone fixo é grátis). Atende de segunda a sábado, das 7h às 22h.",
    aviso: "O INSS não liga pedindo senha e não cobra para liberar benefício. Se pedirem dinheiro, é golpe.",
    abas: {
      entrar: { titulo: "Já tenho conta gov.br: quero entrar", passos: passosEntrarGovbr("Meu INSS") },
      criar: {
        titulo: "Ainda não tenho conta: quero criar",
        passos: [
          { t: 'Toque em "Entrar com gov.br"', d: "Para usar o Meu INSS você precisa de uma conta gov.br. Ela é criada ali mesmo.", tela: T_GOVBR_BOTAO("Meu INSS") },
          { t: "Digite o CPF e toque em Continuar", d: "O site percebe que você ainda não tem conta e mostra o caminho para criar.", tela: T_CPF },
          { t: "Responda às perguntas", d: "Por exemplo: o nome da sua mãe e o ano em que você nasceu. É para ter certeza de que é você.", tela: { itens: [["topo", "gov.br"], ["texto", "Qual o nome da sua mãe?"], ["lista", "Maria da Silva", true], ["lista", "Ana Souza"], ["botao", "Continuar"]] } },
          { t: "Crie a senha e anote num papel", d: "Use letras e números. Guarde o papel em casa. Pronto: essa senha serve para o INSS e para vários outros serviços.", tela: { itens: [["topo", "gov.br"], ["icone", "🔒"], ["campo", "• • • • • •"], ["botao", "Salvar", true]] } },
        ],
      },
      depois: {
        titulo: "Depois de entrar: o que dá para fazer",
        passos: [
          { t: "Ver o extrato de pagamento", d: 'Na tela inicial, toque na lupa e escreva "extrato". Toque em "Extrato de Pagamento" para ver quanto você recebe e os descontos.', tela: { itens: [["topo", "Meu INSS"], ["campo", "🔍 extrato"], ["lista", "Extrato de Pagamento", true], ["lista", "Extrato de Empréstimos"]] } },
          { t: "Conferir empréstimos no seu nome", d: 'Toque em "Extrato de Empréstimos". Se aparecer um empréstimo que você não fez, ligue 135 na hora.', tela: { itens: [["topo", "Meu INSS"], ["campo", "🔍 extrato"], ["lista", "Extrato de Pagamento"], ["lista", "Extrato de Empréstimos", true]] } },
          { t: "Marcar perícia ou atendimento", d: 'Escreva "agendar" na lupa. Escolha o dia e a agência. Anote a data num papel e leve seus documentos.', tela: { itens: [["topo", "Meu INSS"], ["lista", "Agendar Perícia", true], ["lista", "Agendamentos"], ["botao", "Agendar novo"]] } },
          { t: "Acompanhar um pedido", d: 'Toque em "Consultar Pedidos". "Em análise" quer dizer que o INSS ainda está olhando. "Exigência" quer dizer que pediram um documento.', tela: { itens: [["topo", "Meu INSS"], ["lista", "Consultar Pedidos", true], ["texto", "Situação: Em análise"]] } },
        ],
      },
      senha: { titulo: "Esqueci a senha: calma, tem jeito", passos: passosSenhaGovbr("Meu INSS") },
    },
  },

  /* ------------------------------------------------------------ */
  govbr: {
    nome: "Gov.br",
    grupo: "governo",
    cor: "#1351b4",
    logo: "/img/logos/govbr-app.png",
    descricao: "Uma conta só para entrar em quase todos os serviços do governo.",
    site: "https://www.gov.br/",
    app: "gov.br",
    ajuda: "Peça ajuda a um familiar de confiança ou procure o atendimento presencial da sua cidade.",
    aviso: "Só digite a senha em endereços que terminam em gov.br. O gov.br nunca manda link pedindo senha.",
    abas: {
      entrar: { titulo: "Já tenho conta: quero entrar", passos: passosEntrarGovbr("app gov.br") },
      criar: {
        titulo: "Ainda não tenho conta: quero criar",
        passos: [
          { t: "Baixe o app gov.br", d: 'No celular, abra a "Play Store" (Android) ou a "App Store" (iPhone), procure "gov.br" e instale o que tem a bandeira do Brasil.', tela: { itens: [["topo", "Play Store"], ["campo", "🔍 gov.br"], ["lista", "gov.br — Governo Federal", true], ["botao", "Instalar"]] } },
          { t: 'Toque em "Entrar com gov.br" e digite o CPF', d: "O app percebe que você ainda não tem conta e mostra o botão para criar.", tela: T_CPF },
          { t: "Confirme que é você", d: "O jeito mais fácil é pela foto do rosto: segure o celular na frente do rosto, em lugar claro, e siga o que a tela pede.", tela: { itens: [["topo", "gov.br"], ["icone", "🙂"], ["texto", "Posicione o rosto no círculo"], ["botao", "Começar", true]] } },
          { t: "Crie a senha e anote num papel", d: "Essa senha vale para INSS, SUS, CNH, título de eleitor e muito mais.", tela: { itens: [["topo", "gov.br"], ["icone", "🔒"], ["campo", "• • • • • •"], ["botao", "Salvar", true]] } },
        ],
      },
      depois: {
        titulo: "Depois de entrar: aumentar o nível da conta",
        passos: [
          { t: "Entenda os níveis: Bronze, Prata e Ouro", d: "Alguns serviços (como a CNH digital) só abrem com conta Prata ou Ouro. Subir de nível é grátis.", tela: { itens: [["topo", "gov.br"], ["texto", "Nível da conta"], ["lista", "🥉 Bronze"], ["lista", "🥈 Prata"], ["lista", "🥇 Ouro"]] } },
          { t: 'Toque em "Aumentar nível"', d: "Na tela inicial do app gov.br, procure seu nome e toque em aumentar o nível da conta.", tela: { itens: [["topo", "gov.br"], ["texto", "Olá, Maria"], ["botao", "Aumentar nível", true]] } },
          { t: "Use a foto do rosto ou o seu banco", d: "Escolha reconhecimento facial (foto do rosto) ou entrar pelo app do seu banco. Siga as telas até aparecer a mensagem de sucesso.", tela: { itens: [["topo", "gov.br"], ["lista", "Reconhecimento facial", true], ["lista", "Pelo seu banco"]] } },
        ],
      },
      senha: { titulo: "Esqueci a senha: calma, tem jeito", passos: passosSenhaGovbr("app gov.br") },
    },
  },

  /* ------------------------------------------------------------ */
  cidadao: {
    nome: "Acesso Cidadão",
    grupo: "governo",
    cor: "#0b6fa4",
    logo: "/img/logos/acessocidadao.svg",
    logoLargo: true,
    descricao: "A porta de entrada para os serviços do Governo do Espírito Santo.",
    site: "https://acessocidadao.es.gov.br/",
    app: "Acesso Cidadão",
    ajuda: "Prefere atendimento pessoal? Procure uma unidade do Faça Fácil na Grande Vitória.",
    aviso: "O endereço oficial termina em es.gov.br. Não entre por links recebidos em mensagens.",
    abas: {
      entrar: {
        titulo: "Já tenho cadastro: quero entrar",
        passos: [
          { t: "Abra o site do Acesso Cidadão", d: "Use o botão deste portal. O endereço tem que ser acessocidadao.es.gov.br.", tela: { itens: [["topo", "es.gov.br"], ["icone", "🏛️"], ["botao", "Entrar", true]] } },
          { t: 'Escolha "Entrar com gov.br"', d: "É o jeito mais fácil: use o mesmo CPF e senha do gov.br. Se você criou senha própria do Acesso Cidadão, pode usar o CPF e essa senha.", tela: { itens: [["topo", "Acesso Cidadão"], ["campo", "CPF"], ["campo", "Senha"], ["botao", "Entrar com gov.br", true]] } },
          { t: "Digite CPF e senha", d: "Toque em Entrar. Pronto, você está dentro.", tela: T_SENHA },
        ],
      },
      criar: {
        titulo: "Primeira vez: quero me cadastrar",
        passos: [
          { t: 'Toque em "Cadastre-se"', d: "Fica na tela de entrada, abaixo do botão Entrar.", tela: { itens: [["topo", "Acesso Cidadão"], ["botao", "Entrar"], ["link", "Cadastre-se", true]] } },
          { t: "Preencha seus dados", d: "Nome completo, CPF, data de nascimento, e-mail e celular. Escreva com calma e confira antes de seguir.", tela: { itens: [["topo", "Cadastro"], ["campo", "Nome"], ["campo", "CPF"], ["campo", "E-mail"], ["botao", "Continuar", true]] } },
          { t: "Confirme pelo e-mail ou celular", d: "Vai chegar um código. Digite o código no site e crie sua senha. Anote num papel.", tela: { itens: [["topo", "Cadastro"], ["texto", "Digite o código"], ["campo", "_ _ _ _ _ _"], ["botao", "Confirmar", true]] } },
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Procure o serviço pelo nome", d: 'Use a busca e escreva o que você precisa, por exemplo "agendamento", "identidade" ou "IPVA".', tela: { itens: [["topo", "Acesso Cidadão"], ["campo", "🔍 agendamento", true], ["lista", "Agendar no Faça Fácil"]] } },
          { t: "Agendar atendimento no Faça Fácil", d: "Escolha o serviço, a unidade, o dia e o horário. Anote tudo num papel e leve os documentos pedidos.", tela: { itens: [["topo", "Faça Fácil"], ["lista", "Escolher serviço"], ["lista", "Escolher dia", true], ["botao", "Confirmar"]] } },
          { t: "Acompanhar o que você pediu", d: 'Em "Meus serviços" ou "Minhas solicitações" você vê o andamento dos seus pedidos.', tela: { itens: [["topo", "Acesso Cidadão"], ["lista", "Minhas solicitações", true]] } },
        ],
      },
      senha: {
        titulo: "Esqueci a senha: calma, tem jeito",
        passos: [
          { t: 'Toque em "Esqueci minha senha"', d: "Fica na tela de entrada, perto do lugar da senha.", tela: T_ESQUECI },
          { t: "Digite o CPF ou o e-mail", d: "Vai chegar uma mensagem com um link ou código para criar uma senha nova.", tela: { itens: [["topo", "Acesso Cidadão"], ["campo", "CPF"], ["botao", "Enviar", true]] } },
          { t: "Ou entre pelo gov.br", d: 'Se lembrar a senha do gov.br, toque em "Entrar com gov.br" e use ela. Funciona do mesmo jeito.', tela: T_GOVBR_BOTAO("Acesso Cidadão") },
        ],
      },
    },
  },

  /* ------------------------------------------------------------ */
  cnh: {
    nome: "Carteira Digital de Trânsito",
    subnome: "Agora o app se chama \"CNH do Brasil\"",
    grupo: "governo",
    cor: "#0b7a3b",
    logo: "/img/logos/cnh.png",
    descricao: "Sua carteira de motorista e o documento do carro no celular, além das multas.",
    site: "https://www.gov.br/transportes/pt-br/cnh-do-brasil",
    app: "CNH do Brasil",
    ajuda: "Para dúvidas sobre a sua carteira, procure o Detran do seu estado.",
    aviso: "Ninguém pode cobrar para \"liberar\" a CNH digital. O app é grátis e só funciona com a sua conta gov.br.",
    abas: {
      entrar: {
        titulo: "Instalar e entrar pela primeira vez",
        passos: [
          { t: 'Baixe o app "CNH do Brasil"', d: 'O antigo app "Carteira Digital de Trânsito" mudou de nome. Na loja do celular, procure "CNH do Brasil" com a bandeira do Brasil.', tela: { itens: [["topo", "Play Store"], ["campo", "🔍 CNH do Brasil"], ["lista", "CNH do Brasil — Senatran", true], ["botao", "Instalar"]] } },
          ...passosEntrarGovbr("CNH do Brasil").slice(0, 3),
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Mostrar a carteira de motorista", d: 'Toque em "CNH". Ela aparece no celular e vale como documento em todo o Brasil.', tela: { itens: [["topo", "CNH do Brasil"], ["lista", "🪪 CNH", true], ["lista", "🚗 Veículos"], ["lista", "📋 Infrações"]] } },
          { t: "Ver o documento do carro", d: 'Toque em "Veículos" para ver o documento (CRLV) do carro que está no seu nome.', tela: { itens: [["topo", "CNH do Brasil"], ["lista", "🪪 CNH"], ["lista", "🚗 Veículos", true], ["lista", "📋 Infrações"]] } },
          { t: "Consultar multas", d: 'Toque em "Infrações". Algumas multas podem ser pagas com desconto pelo próprio app.', tela: { itens: [["topo", "CNH do Brasil"], ["lista", "🪪 CNH"], ["lista", "🚗 Veículos"], ["lista", "📋 Infrações", true]] } },
        ],
      },
      senha: {
        titulo: "Problemas para entrar",
        passos: [
          { t: "A carteira não aparece?", d: "A CNH digital só aparece para contas gov.br nível Prata ou Ouro. Veja no guia do Gov.br como aumentar o nível — é grátis.", tela: { itens: [["topo", "gov.br"], ["lista", "🥈 Prata", true], ["lista", "🥇 Ouro", true]] } },
          ...passosSenhaGovbr("app CNH do Brasil").slice(1, 3),
        ],
      },
    },
  },

  /* ------------------------------------------------------------ */
  etitulo: {
    nome: "Título de Eleitor Digital",
    subnome: "App e-Título, da Justiça Eleitoral",
    grupo: "governo",
    cor: "#b45f06",
    logo: "/img/logos/etitulo.png",
    descricao: "O título no celular, o seu local de votação e a justificativa de ausência.",
    site: "https://www.tse.jus.br/servicos-eleitorais/servicos/aplicativo-e-titulo",
    app: "e-Título",
    ajuda: "Dúvidas? Procure o cartório eleitoral da sua cidade ou o site tse.jus.br.",
    aviso: "A Justiça Eleitoral não manda mensagem dizendo que seu título será cancelado com link para clicar. Isso é golpe.",
    abas: {
      entrar: {
        titulo: "Instalar e entrar",
        passos: [
          { t: 'Baixe o app "e-Título"', d: 'Na loja do celular, procure "e-Título" e instale o da Justiça Eleitoral (TSE).', tela: { itens: [["topo", "Play Store"], ["campo", "🔍 e-Título"], ["lista", "e-Título — TSE", true], ["botao", "Instalar"]] } },
          { t: 'Toque em "Entrar com gov.br"', d: "Use o mesmo CPF e senha do gov.br.", tela: T_GOVBR_BOTAO("e-Título") },
          { t: "Digite CPF e senha", d: "Pronto. O seu título aparece na tela, com foto, se você já fez a biometria.", tela: T_SENHA },
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Ver onde você vota", d: 'Toque em "Onde votar". Aparece o endereço da escola e o número da sua seção.', tela: { itens: [["topo", "e-Título"], ["lista", "📍 Onde votar", true], ["lista", "✍️ Justificativa"], ["lista", "📄 Certidões"]] } },
          { t: "Justificar se não votou", d: 'Se não pôde votar, toque em "Justificativa" no dia da eleição (ou até 60 dias depois) e siga as telas.', tela: { itens: [["topo", "e-Título"], ["lista", "📍 Onde votar"], ["lista", "✍️ Justificativa", true], ["lista", "📄 Certidões"]] } },
          { t: "Bom saber: depois dos 70 anos", d: "Para quem tem mais de 70 anos, votar é opcional. Mesmo assim, você pode votar sempre que quiser.", tela: { itens: [["topo", "e-Título"], ["icone", "🗳️"], ["texto", "Voto opcional após os 70"]] } },
        ],
      },
      senha: {
        titulo: "Esqueci a senha",
        passos: passosSenhaGovbr("e-Título").slice(0, 3),
      },
    },
  },

  /* ------------------------------------------------------------ */
  meusus: {
    nome: "Meu SUS Digital",
    grupo: "governo",
    cor: "#3f51a3",
    logo: "/img/logos/meusus.png",
    descricao: "Cartão do SUS, vacinas, exames e remédios do Farmácia Popular.",
    site: "https://meususdigital.saude.gov.br/",
    app: "Meu SUS Digital",
    ajuda: "Disque Saúde: ligue 136 (grátis).",
    aviso: "O SUS é gratuito. Ninguém pode cobrar para marcar consulta, vacina ou exame.",
    abas: {
      entrar: { titulo: "Instalar e entrar", passos: [
        { t: 'Baixe o app "Meu SUS Digital"', d: 'Na loja do celular, procure "Meu SUS Digital" e instale o do Ministério da Saúde.', tela: { itens: [["topo", "Play Store"], ["campo", "🔍 Meu SUS Digital"], ["lista", "Meu SUS Digital", true], ["botao", "Instalar"]] } },
        ...passosEntrarGovbr("Meu SUS Digital").slice(0, 3),
      ] },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Ver as suas vacinas", d: 'Toque em "Vacinas". Aparecem as vacinas que você já tomou e as que estão faltando.', tela: { itens: [["topo", "Meu SUS Digital"], ["lista", "💉 Vacinas", true], ["lista", "🪪 Cartão do SUS"], ["lista", "💊 Medicamentos"]] } },
          { t: "Mostrar o Cartão do SUS", d: 'Toque em "Cartão do SUS" ou no seu nome. O número do cartão serve em postos de saúde e hospitais.', tela: { itens: [["topo", "Meu SUS Digital"], ["lista", "💉 Vacinas"], ["lista", "🪪 Cartão do SUS", true], ["lista", "💊 Medicamentos"]] } },
          { t: "Ver remédios e exames", d: 'Em "Medicamentos" você vê o que pegou no Farmácia Popular. Em "Exames" aparecem resultados enviados pelos laboratórios.', tela: { itens: [["topo", "Meu SUS Digital"], ["lista", "💉 Vacinas"], ["lista", "🪪 Cartão do SUS"], ["lista", "💊 Medicamentos", true]] } },
        ],
      },
      senha: { titulo: "Esqueci a senha", passos: passosSenhaGovbr("Meu SUS Digital").slice(0, 3) },
    },
  },

  /* ------------------------------------------------------------ */
  banco: {
    nome: "Dicas de Internet Banking",
    grupo: "dia",
    cor: "#1f6f5c",
    icone: "🏦",
    descricao: "Use o app do banco e o Pix sem medo, e saiba reconhecer os golpes.",
    ajuda: "Na dúvida, ligue para o banco pelo número que está atrás do seu cartão.",
    aviso: "O banco NUNCA liga pedindo senha, código, transferência ou para buscar o seu cartão em casa.",
    rotulos: { entrar: "Primeiros passos", criar: "Pix com segurança", depois: "Golpes comuns", senha: "Caí num golpe" },
    abas: {
      entrar: {
        titulo: "Primeiros passos no app do banco",
        passos: [
          { t: "Baixe o app só pela loja oficial", d: 'Use a "Play Store" ou a "App Store". Confira o nome do banco e o número de downloads. Nunca instale app por link de mensagem.', tela: { itens: [["topo", "Play Store"], ["campo", "🔍 nome do seu banco"], ["lista", "App oficial do banco", true]] } },
          { t: "Coloque senha no celular", d: "Ative a senha de bloqueio da tela (ou a digital). Se o celular for roubado, ninguém entra.", tela: { itens: [["topo", "Configurações"], ["lista", "🔒 Bloqueio de tela", true], ["lista", "👆 Digital"]] } },
          { t: "Use uma senha que só você saiba", d: "Não use data de nascimento. Não anote a senha junto do cartão nem no celular.", tela: { itens: [["topo", "Banco"], ["icone", "🔒"], ["campo", "• • • •"]] } },
        ],
      },
      criar: {
        titulo: "Pix com segurança",
        passos: [
          { t: "Confira o NOME antes de confirmar", d: "Depois de digitar a chave Pix, o app mostra o nome de quem vai receber. Se o nome for diferente do esperado, cancele.", tela: { itens: [["topo", "Pix"], ["texto", "Para: JOÃO DA SILVA"], ["texto", "R$ 50,00"], ["botao", "Confirmar", true]] } },
          { t: "Diminua o seu limite do Pix", d: 'No app do banco, procure "Pix" e depois "Meus limites". Coloque um valor baixo, principalmente à noite.', tela: { itens: [["topo", "Pix"], ["lista", "Meus limites", true], ["texto", "Noite: R$ 200,00"]] } },
          { t: "Pix não volta sozinho", d: "Depois de enviado, o dinheiro sai na hora. Por isso, nunca faça Pix com pressa ou porque alguém está pressionando.", tela: { itens: [["topo", "Pix"], ["icone", "⏳"], ["texto", "Calma antes de enviar"]] } },
        ],
      },
      depois: {
        titulo: "Os golpes mais comuns",
        passos: [
          { t: "Falsa central do banco", d: "Alguém liga dizendo ser do banco e pede senha, código ou transferência. Desligue e ligue você para o número atrás do cartão.", tela: { itens: [["topo", "Ligação"], ["icone", "📞"], ["texto", "\"Aqui é do seu banco...\""], ["botao", "Desligar", true]] } },
          { t: "Falso parente no WhatsApp", d: '"Oi, mãe, troquei de número, me faz um Pix?" Antes de qualquer coisa, ligue para o número antigo da pessoa.', tela: { itens: [["topo", "WhatsApp"], ["texto", "Oi mãe, troquei de número"], ["texto", "Me faz um Pix?"], ["botao", "Ligar para o número antigo", true]] } },
          { t: "Motoboy para buscar o cartão", d: "O banco nunca manda ninguém buscar cartão na sua casa. Não entregue. Corte o cartão só se o próprio banco pedir pelo app.", tela: { itens: [["topo", "Atenção"], ["icone", "🛵"], ["texto", "Banco não busca cartão"]] } },
          { t: "Mensagem com link", d: '"Sua conta foi bloqueada, clique aqui." Não clique. Abra o app do banco você mesmo para conferir.', tela: { itens: [["topo", "SMS"], ["texto", "Conta bloqueada! Clique:"], ["link", "bit.ly/xxxx"], ["botao", "Apagar", true]] } },
        ],
      },
      senha: {
        titulo: "Caí num golpe: o que fazer agora",
        passos: [
          { t: "Ligue para o banco na hora", d: "Use o número atrás do cartão. Peça o bloqueio da conta e do cartão. Se foi Pix, peça o MED (devolução do Pix por golpe).", tela: { itens: [["topo", "Ligação"], ["icone", "📞"], ["texto", "Número atrás do cartão"], ["botao", "Ligar", true]] } },
          { t: "Registre um boletim de ocorrência", d: "Pode ser na delegacia ou pela internet (Delegacia Online da Polícia Civil). Guarde o número do boletim.", tela: { itens: [["topo", "Delegacia Online"], ["lista", "Registrar ocorrência", true]] } },
          { t: "Troque as senhas e avise a família", d: "Troque a senha do banco e do gov.br. Conte para alguém de confiança: não há vergonha nenhuma, golpistas enganam todo mundo.", tela: { itens: [["topo", "Banco"], ["lista", "Trocar senha", true]] } },
        ],
      },
    },
  },

  /* ------------------------------------------------------------ */
  emergencia: {
    nome: "Números de Emergência",
    grupo: "dia",
    cor: "#b3261e",
    icone: "🚨",
    tipo: "emergencia",
    descricao: "Toque no número para ligar. Todas as ligações são gratuitas.",
  },

  /* ------------------------------------------------------------ */
  jogos: {
    nome: "Jogos e estímulos mentais",
    grupo: "dia",
    cor: "#6a3fa0",
    icone: "🧩",
    tipo: "jogos",
    descricao: "Exercite a memória e a atenção com jogos simples, sem cadastro.",
  },
};

/* Números de emergência (ligações gratuitas) */
window.EMERGENCIA = [
  { n: "192", nome: "SAMU", d: "Ambulância e urgência médica", cor: "#b3261e" },
  { n: "193", nome: "Bombeiros", d: "Incêndio, acidente, resgate", cor: "#c2410c" },
  { n: "190", nome: "Polícia Militar", d: "Roubo, violência, perigo", cor: "#1e3a8a" },
  { n: "100", nome: "Disque 100", d: "Maus-tratos ou violência contra a pessoa idosa", cor: "#6e1630" },
  { n: "180", nome: "Central da Mulher", d: "Violência contra a mulher", cor: "#7e22ce" },
  { n: "188", nome: "CVV", d: "Apoio emocional, conversa 24 horas", cor: "#0f766e" },
  { n: "136", nome: "Disque Saúde", d: "Dúvidas sobre o SUS", cor: "#3f51a3" },
  { n: "135", nome: "INSS", d: "Benefícios e aposentadoria", cor: "#1565c0" },
  { n: "199", nome: "Defesa Civil", d: "Enchente, deslizamento", cor: "#a16207" },
];

/* Palavras do jogo "Palavra embaralhada" */
window.PALAVRAS = [
  ["FAMILIA", "Quem mora com a gente e a gente ama"],
  ["JARDIM", "Lugar com flores e plantas"],
  ["CAFEZINHO", "Bebida quente da tarde"],
  ["NETINHO", "Filho do filho"],
  ["CELULAR", "Aparelho para ligar e mandar mensagem"],
  ["JANELA", "Por onde entra a luz da casa"],
  ["SAUDADE", "Sentimento por quem está longe"],
  ["FEIJAO", "Não falta no almoço do brasileiro"],
  ["VIZINHO", "Quem mora ao lado"],
  ["ORACAO", "Conversa com Deus"],
  ["DOMINGO", "Dia de descanso e almoço em família"],
  ["PRAIA", "Areia, mar e sol"],
];

/* Perguntas frequentes */
window.FAQ = [
  {
    p: "Como eu sei se um site do governo é de verdade?",
    r: "Os sites oficiais do governo terminam em <strong>.gov.br</strong> (no Espírito Santo, <strong>es.gov.br</strong>). Se o endereço for diferente, ou se chegou por link de mensagem, desconfie. Prefira sempre entrar pelos botões deste portal.",
  },
  {
    p: "O governo ou o banco liga pedindo minha senha?",
    r: "<strong>Nunca.</strong> Nenhum órgão oficial e nenhum banco pede senha, código ou número do cartão por telefone, WhatsApp ou e-mail. Se pedirem, é golpe: desligue e não responda.",
  },
  {
    p: "O que é a conta gov.br e para que serve?",
    r: "É uma senha única que abre vários serviços: INSS, SUS, CNH, título de eleitor e muitos outros. Você cria uma vez e usa em todos. Guarde essa senha num papel, em casa, e não conte para ninguém.",
  },
  {
    p: "Esqueci minha senha. E agora?",
    r: "Calma, tem jeito. Na tela de entrada, toque em <strong>\"Esqueci minha senha\"</strong> e siga os passos. Dá para recuperar pelo e-mail, pelo celular ou pela foto do rosto. Cada serviço deste portal tem o passo a passo na aba \"Esqueci a senha\".",
  },
  {
    p: "Recebi uma mensagem dizendo que tenho dinheiro para sacar. É verdade?",
    r: "Muito cuidado. Golpistas usam isso para roubar dados e dinheiro. Não clique no link. Cole a mensagem no <strong>Verificador de Notícias</strong> aqui do portal ou ligue para o órgão.",
  },
  {
    p: "É seguro usar esses serviços pelo celular?",
    r: "Sim, desde que você use os aplicativos e sites oficiais e não passe sua senha para ninguém. Mantenha o celular com senha de bloqueio e, na dúvida, faça junto com alguém de confiança.",
  },
];
