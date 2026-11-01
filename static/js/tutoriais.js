/* ============================================================
   Conteúdo dos tutoriais passo a passo.
   Transcrito dos folhetos de referência (frente e verso).
   Cada serviço tem abas: entrar, criar, depois, senha.
   ============================================================ */
window.SERVICOS = {
  inss: {
    nome: "Meu INSS",
    cor: "var(--inss)",
    sigla: "INSS",
    descricao: "Veja extratos, agende perícia e acompanhe pedidos de aposentadoria e benefícios.",
    site: "https://meu.inss.gov.br/",
    ajuda: "Precisa de ajuda? Ligue 135, do telefone fixo ou do celular.",
    aviso: "O INSS não cobra para liberar benefício. Não passe senha nem códigos a ninguém.",
    abas: {
      entrar: {
        titulo: "Já tenho conta: quero entrar",
        passos: [
          { t: 'Toque em "Entrar com gov.br"', d: "É o botão azul da primeira tela. Toque nele uma vez." },
          { t: "Digite o seu CPF", d: "Escreva os 11 números do CPF e toque em Continuar." },
          { t: "Digite a sua senha", d: "Escreva a senha do Gov.br e toque em Entrar. Se pedir um código, digite-o." },
        ],
      },
      criar: {
        titulo: "Ainda não tenho conta: quero criar",
        passos: [
          { t: 'Toque em "Criar conta gov.br"', d: 'Depois de tocar em "Entrar com gov.br", escolha criar a conta.' },
          { t: "Confirme seus dados", d: "O site pergunta, por exemplo, o nome da sua mãe e a sua data de nascimento." },
          { t: "Crie uma senha", d: "Escolha uma senha que só você saiba. Anote num papel e guarde em casa." },
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Ver os meus extratos", d: 'Na tela inicial, procure a palavra "extrato". Toque no extrato que você quer (de pagamento ou de contribuições). Na dúvida, peça ajuda à família.' },
          { t: "Marcar perícia ou atendimento", d: 'Procure "Agende sua Perícia" ou "Agendamentos". Toque em "Agendar Novo" e escolha o dia e o lugar. Anote tudo num papel e leve seus documentos.' },
          { t: "Acompanhar um pedido", d: 'Procure a área dos seus pedidos (requerimentos). "Em análise" quer dizer que o INSS está olhando. Se pedirem um documento, siga as instruções na tela.' },
        ],
      },
      senha: {
        titulo: "Esqueci a minha senha: calma, tem jeito",
        passos: [
          { t: "Comece a entrar", d: 'Toque em "Entrar com gov.br" e digite o CPF.' },
          { t: 'Toque em "Esqueci minha senha"', d: "O próprio site mostra essa opção." },
          { t: "Crie a nova senha", d: "Escolha como criar a nova senha e siga as telas." },
        ],
      },
    },
  },

  govbr: {
    nome: "Gov.br",
    cor: "var(--govbr)",
    sigla: "gov",
    descricao: "Uma senha só para vários serviços do governo. É a sua conta principal.",
    site: "https://www.gov.br/",
    ajuda: "Precisa de ajuda? Acesse gov.br/atendimento ou peça ajuda a um familiar.",
    aviso: "Só digite sua senha em endereços que terminam em gov.br.",
    abas: {
      entrar: {
        titulo: "Já tenho conta: quero entrar",
        passos: [
          { t: 'Toque em "Entrar"', d: "No site gov.br, o botão Entrar fica no alto da tela. Toque nele." },
          { t: "Digite o seu CPF", d: "Escreva os 11 números do CPF e toque em Continuar." },
          { t: "Digite a sua senha", d: "Escreva a senha e toque em Entrar. Se o site pedir um código, digite-o." },
        ],
      },
      criar: {
        titulo: "Ainda não tenho conta: quero criar",
        passos: [
          { t: 'Toque em "Criar conta gov.br"', d: "Digite o seu CPF e toque em Continuar." },
          { t: "Confirme seus dados", d: "O site faz algumas perguntas para ter certeza de que é você." },
          { t: "Crie uma senha", d: "Escolha uma senha que só você saiba. Anote num papel e guarde em casa." },
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Usar a mesma conta em outros serviços", d: 'Abra o serviço que você quer (por exemplo, o Meu INSS), toque em "Entrar com gov.br" e digite o CPF e a senha. Não precisa criar outra conta.' },
          { t: "Subir o selo: Bronze, Prata, Ouro", d: 'No app gov.br, toque em "Aumentar nível da conta" e depois em "Reconhecimento facial". Enquadre o rosto e espere a mensagem de sucesso. Selo mais alto abre mais serviços.' },
          { t: "Deixar a conta mais segura", d: 'Nunca conte a senha nem os códigos para ninguém. Em contas Prata ou Ouro, ative a "verificação em duas etapas". Peça a um familiar de confiança para ficar ao seu lado nessa hora.' },
        ],
      },
      senha: {
        titulo: "Esqueci a minha senha: calma, tem jeito",
        passos: [
          { t: "Comece a entrar", d: 'Toque em "Entrar", digite o CPF e toque em "Esqueci minha senha".' },
          { t: "Escolha uma opção", d: "Foto do rosto, banco, e-mail ou telefone." },
          { t: "Crie a nova senha", d: "Siga as telas e crie uma nova senha." },
        ],
      },
    },
  },

  cidadao: {
    nome: "Acesso Cidadão",
    cor: "var(--cidadao)",
    sigla: "ES",
    descricao: "Seu login para serviços do Governo do Espírito Santo (identidade, Detran e mais).",
    site: "https://acessocidadao.es.gov.br/",
    ajuda: "Atalho: se você já tem Gov.br, dá para entrar com o Gov.br na tela de entrada.",
    aviso: "Use só endereços que terminam em es.gov.br. Não passe senha nem códigos.",
    abas: {
      entrar: {
        titulo: "Já tenho conta: quero entrar",
        passos: [
          { t: "Escreva o seu usuário", d: "Use o mesmo usuário que você escolheu quando criou a conta." },
          { t: "Escreva a sua senha", d: "Digite com calma. Os pontinhos escondem a senha para ninguém ver." },
          { t: 'Toque em "Entrar"', d: "Se o site pedir um código, digite o que aparece no seu celular." },
        ],
      },
      criar: {
        titulo: "Ainda não tenho conta: quero criar",
        passos: [
          { t: 'Toque em "Criar uma Conta"', d: "Esse botão fica na página inicial do Acesso Cidadão." },
          { t: "Preencha os seus dados", d: "Digite os dados pessoais pedidos e crie uma senha. Anote a senha num papel." },
          { t: "Valide a sua conta", d: 'Toque no seu nome, escolha "Verificar conta" e siga as telas até o fim.' },
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Marcar a carteira de identidade", d: "Abra o site agenda.es.gov.br, entre com o seu Acesso Cidadão e escolha o serviço, o local, o dia e a hora. Anote num papel. Os avisos chegam no seu e-mail." },
          { t: "Usar os serviços do Detran|ES", d: "Abra o site do Detran|ES, entre com o seu Acesso Cidadão e escolha o que precisa: habilitação (CNH), veículos ou infrações." },
          { t: "Achar outros serviços do Estado", d: 'Abra o site conectacidadao.es.gov.br, procure o serviço pelo nome (por exemplo, "identidade") e leia o que é preciso levar antes de sair de casa.' },
        ],
      },
      senha: {
        titulo: "Esqueci a minha senha: calma, tem jeito",
        passos: [
          { t: "Procure na tela de entrada", d: 'Procure "Esqueci minha senha".' },
          { t: "Informe o que for pedido", d: "Digite o dado que o site pedir e siga as instruções." },
          { t: "Não deu certo?", d: "Tente entrar com o Gov.br ou peça ajuda a um familiar." },
        ],
      },
    },
  },

  fgts: {
    nome: "FGTS",
    cor: "var(--fgts)",
    sigla: "FGTS",
    descricao: "Veja o saldo do seu Fundo de Garantia pelo celular e acompanhe os depósitos.",
    site: "https://www.fgts.gov.br/",
    ajuda: "Prefere falar com alguém? Ligue para a Caixa: 0800 726 0207 (grátis).",
    aviso: "Não passe senha nem códigos por telefone ou WhatsApp. Não clique em links recebidos.",
    abas: {
      entrar: {
        titulo: "Já tenho cadastro no app: quero entrar",
        passos: [
          { t: 'Abra o app e toque em "Entrar no aplicativo"', d: "É o botão da primeira tela do app FGTS." },
          { t: "Digite CPF e senha", d: "Escreva o seu CPF e a senha que você criou no app." },
          { t: 'Toque em "Meu FGTS"', d: "Veja o saldo de cada empresa. Toque no desenho do olho para mostrar o valor." },
        ],
      },
      criar: {
        titulo: "Primeira vez: quero me cadastrar",
        passos: [
          { t: 'Toque em "Cadastre-se"', d: "Use esse botão na primeira vez que abrir o app." },
          { t: "Digite os seus dados", d: "CPF, nome, nascimento, CEP e e-mail. Depois crie uma senha e anote num papel." },
          { t: 'Responda e toque em "Concordar"', d: "O app faz perguntas sobre seus empregos. Leia as condições e toque em Concordar." },
        ],
      },
      depois: {
        titulo: "Depois de entrar",
        passos: [
          { t: "Ver o extrato e guardar em PDF", d: 'Toque em "Meu FGTS" ou em "ver todas as suas contas", toque na conta (empresa) que você quer e, para guardar, toque em "gerar extrato PDF".' },
          { t: "Saber quando pode sacar", d: "O dinheiro do FGTS só pode ser sacado nos casos que a lei permite (demissão sem justa causa, aposentadoria, casa própria e doença grave). Na dúvida, ligue para a Caixa antes." },
          { t: "Pedir o saque pelo aplicativo", d: "Toque na opção de saque que o app mostrar, indique a conta onde quer receber e envie os documentos pedidos. Acompanhe as etapas no próprio app." },
        ],
      },
      senha: {
        titulo: "Esqueci a minha senha: calma, tem jeito",
        passos: [
          { t: "Procure na tela de entrada", d: 'Na tela de entrada do app, procure "Esqueci minha senha".' },
          { t: "Crie uma nova senha", d: "Siga as telas para criar uma nova senha." },
          { t: "Não deu certo?", d: "Ligue 0800 726 0207 ou vá a uma agência da Caixa." },
        ],
      },
    },
  },
};

/* Perguntas frequentes (6 dúvidas digitais comuns de idosos) */
window.FAQ = [
  {
    p: "Como eu sei se um site do governo é de verdade?",
    r: "Os sites oficiais do governo federal terminam em <strong>.gov.br</strong>. Se o endereço for diferente disso, ou vier por link de mensagem, desconfie. Prefira sempre entrar pelos botões deste portal.",
  },
  {
    p: "O governo liga ou manda mensagem pedindo minha senha?",
    r: "<strong>Nunca.</strong> Nenhum órgão oficial pede senha, código ou número do cartão por telefone, WhatsApp ou e-mail. Se pedirem, é golpe. Desligue e não responda.",
  },
  {
    p: "O que é a conta Gov.br e para que serve?",
    r: "É uma senha única que abre vários serviços do governo (INSS, FGTS e outros). Você cria uma vez e usa em todos. Guarde essa senha num papel, em casa, e não conte para ninguém.",
  },
  {
    p: "Esqueci minha senha. E agora?",
    r: "Calma, tem jeito. Na tela de entrada, procure o botão <strong>\"Esqueci minha senha\"</strong> e siga os passos. Você pode recuperar por e-mail, telefone ou reconhecimento facial. Se precisar, peça ajuda a um familiar de confiança.",
  },
  {
    p: "Recebi uma mensagem dizendo que tenho dinheiro para sacar. É verdade?",
    r: "Muito cuidado. Golpistas usam isso para roubar dados. Não clique no link da mensagem. Confira seu saldo só pelos canais oficiais e, na dúvida, use o <strong>Verificador de Notícias</strong> aqui do portal ou ligue para o órgão.",
  },
  {
    p: "É seguro fazer essas coisas pelo celular?",
    r: "Sim, desde que você use os aplicativos e sites oficiais e não compartilhe sua senha. Mantenha o celular com uma senha de bloqueio e, se tiver dúvida, faça junto com alguém de confiança.",
  },
];
