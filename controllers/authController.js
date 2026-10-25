// =====================================================================
// controllers/authController.js — A lógica do login, cadastro e recuperação
// Parte do Allan (servidor).
//
// ONDE ESTE ARQUIVO SE ENCAIXA (a ideia dos 3 arquivos):
//
//   routes/auth.js              -> só diz "este endereço chama esta função"
//   controllers/authController  -> (ESTE) decide o que fazer com os dados
//   middlewares/auth.js         -> os porteiros que barram quem não pode entrar
//
// Em todo código abaixo:
//   req = o que CHEGOU do navegador (dados do formulário, sessão...)
//   res = o que vamos DEVOLVER (mostrar uma página, redirecionar...)
// =====================================================================


// =====================================================================
// PASSO 0 — FERRAMENTAS
// =====================================================================

const bcrypt = require('bcryptjs');   // embaralha senhas de forma segura (hash)
const crypto = require('crypto');     // já vem no Node; gera o token de recuperação

// O model do Vitor: é ele quem conversa com o banco de dados.
// Aqui só CHAMAMOS as funções dele, não mexemos no banco.
//   Usuario.buscarPorEmail(email)                         -> acha o usuário ou devolve null
//   Usuario.criar({ nome, email, telefone, senhaHash })   -> salva um usuário novo
//   Usuario.salvarTokenRecuperacao(id, token, expiraEm)   -> guarda o token da recuperação
const Usuario = require('../models/Usuario');


// =====================================================================
// PASSO 1 — FUNÇÕES AJUDANTES
// Pequenas funções para não repetir o mesmo código em todo lugar.
// =====================================================================

// Confere se o texto parece um e-mail (algo@algo.com).
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Limpa um texto: tira espaços das pontas. Se vier algo estranho
// (undefined, número, objeto...), devolve texto vazio em vez de quebrar.
function limpar(texto) {
  return typeof texto === 'string' ? texto.trim() : '';
}

// Cria a sessão de login.
//
// O QUE É SESSÃO? É a "memória" do servidor sobre quem está logado.
// O servidor guarda os dados e entrega ao navegador um cookie (um
// "crachá" com um número). A cada clique, o navegador mostra o crachá
// e o servidor lembra quem é a pessoa.
//
// O "regenerate" troca o número do crachá no momento do login. Isso
// impede o ataque "session fixation" (alguém plantar um crachá antes de você logar).
function iniciarSessao(req, dadosDoUsuario, callback) {
  req.session.regenerate((erro) => {
    if (erro) return callback(erro);
    req.session.usuario = dadosDoUsuario; // o que guardamos sobre quem logou
    callback(null);
  });
}


// =====================================================================
// PASSO 2 — AS TELAS (só mostram as páginas)
//
// Elas mandam "erro" e "sucesso" como null para o EJS não reclamar de
// variável inexistente.
// =====================================================================

// Tela de login (abas: Cliente na Mesa e Painel Admin)
function mostrarLogin(req, res) {
  res.render('login', { erro: null }); // abre views/login.ejs
}

// Tela de criar conta
function mostrarCadastro(req, res) {
  res.render('cadastro', { erro: null, sucesso: null });
}

// Tela de "esqueci minha senha"
function mostrarRecuperarSenha(req, res) {
  res.render('recuperar-senha', { erro: null, sucesso: null });
}


// =====================================================================
// PASSO 3 — LOGIN DO CLIENTE (sem senha, só nome e mesa)
//
// Fluxo: pega nome e mesa -> confere -> cria a sessão -> manda pro cardápio.
// =====================================================================
function loginCliente(req, res) {
  // PASSO 3.1 — Pegar os dados do formulário.
  // Os nomes (cliente_nome e numero_mesa) vêm do atributo "name" dos
  // inputs do login.ejs. Se o nome lá mudar, tem que mudar aqui também.
  const nome = limpar(req.body.cliente_nome);
  const mesa = limpar(req.body.numero_mesa);

  // PASSO 3.2 — Os dois campos são obrigatórios.
  if (!nome || !mesa) {
    return res.status(400).render('login', {
      erro: 'Preencha seu nome e o número da mesa para continuar.',
    });
  }

  // PASSO 3.3 — Limite de tamanho (evita alguém colar um textão gigante).
  if (nome.length > 40 || mesa.length > 20) {
    return res.status(400).render('login', {
      erro: 'Nome ou mesa muito longos. Tente algo mais curto.',
    });
  }

  // PASSO 3.4 — Tudo certo: cria a sessão e leva a pessoa pro cardápio.
  iniciarSessao(req, { tipo: 'cliente', nome, mesa }, (erro) => {
    if (erro) {
      console.error('Erro ao criar sessão do cliente:', erro);
      return res.status(500).render('login', {
        erro: 'Algo deu errado do nosso lado. Tente de novo.',
      });
    }
    return res.redirect('/cardapio');
  });
}


// =====================================================================
// PASSO 4 — LOGIN DO ADMIN (com usuário e senha)
//
// O usuário e a senha NÃO ficam escritos no código. Ficam no .env:
//   ADMIN_USER=admin
//   ADMIN_SENHA_HASH=$2a$10$....   (a senha embaralhada, nunca a senha pura)
//
// Para definir ou trocar a senha, rode no terminal:
//   node definir-admin.js SUA_SENHA
//
// Fluxo: pega usuário e senha -> compara com o .env -> cria sessão -> /admin.
// =====================================================================
async function loginAdmin(req, res) {
  // PASSO 4.1 — Pegar os dados (names: admin_user e admin_password).
  const usuario = limpar(req.body.admin_user);
  // A senha NÃO passa por "limpar": espaços podem fazer parte dela.
  const senha = typeof req.body.admin_password === 'string' ? req.body.admin_password : '';

  // PASSO 4.2 — Os dois campos são obrigatórios.
  if (!usuario || !senha) {
    return res.status(400).render('login', {
      erro: 'Informe o usuário e a senha do administrador.',
    });
  }

  try {
    // PASSO 4.3 — O usuário digitado é o mesmo do .env?
    const usuarioCerto = usuario === process.env.ADMIN_USER;

    // PASSO 4.4 — A senha digitada "bate" com o hash do .env?
    // O compare() embaralha a senha digitada do mesmo jeito e compara.
    // O "|| ''" evita erro se esquecerem de preencher o .env.
    const senhaCerta = await bcrypt.compare(senha, process.env.ADMIN_SENHA_HASH || '');

    // PASSO 4.5 — Se algo estiver errado, avisa.
    // A mensagem é IGUAL para usuário errado e senha errada, de propósito:
    // assim ninguém descobre se o usuário existe (isso ajudaria um invasor).
    if (!usuarioCerto || !senhaCerta) {
      return res.status(401).render('login', {
        erro: 'Usuário ou senha incorretos.',
      });
    }

    // PASSO 4.6 — Tudo certo: cria a sessão de admin e abre o painel.
    iniciarSessao(req, { tipo: 'admin', nome: 'Administrador' }, (erro) => {
      if (erro) {
        console.error('Erro ao criar sessão do admin:', erro);
        return res.status(500).render('login', {
          erro: 'Algo deu errado do nosso lado. Tente de novo.',
        });
      }
      return res.redirect('/admin');
    });
  } catch (erro) {
    // Se qualquer coisa inesperada acontecer, não derruba o servidor.
    console.error('Erro no login do admin:', erro);
    return res.status(500).render('login', {
      erro: 'Algo deu errado do nosso lado. Tente de novo.',
    });
  }
}


// =====================================================================
// PASSO 5 — CADASTRO (criar conta)
//
// Campos do cadastro.ejs: fullname, email, phone, password,
// confirm_password e terms.
//
// Fluxo: pega os dados -> valida um por um -> vê se o e-mail já existe
// -> embaralha a senha -> salva -> mostra mensagem de sucesso.
// =====================================================================
async function cadastrar(req, res) {
  // PASSO 5.1 — Pegar os dados do formulário.
  const nome = limpar(req.body.fullname);
  const email = limpar(req.body.email).toLowerCase(); // e-mail sempre em minúsculo
  const telefone = limpar(req.body.phone);
  const senha = typeof req.body.password === 'string' ? req.body.password : '';
  const confirmar = typeof req.body.confirm_password === 'string' ? req.body.confirm_password : '';
  const aceitouTermos = req.body.terms; // checkbox: vem "on" quando marcado, vazio quando não

  // Função curtinha para devolver um erro sem repetir o render toda hora.
  const erroCadastro = (mensagem, status = 400) =>
    res.status(status).render('cadastro', { erro: mensagem, sucesso: null });

  // PASSO 5.2 — Validações, uma de cada vez, com mensagem clara.
  if (!nome || !email || !telefone || !senha || !confirmar) {
    return erroCadastro('Preencha todos os campos obrigatórios.');
  }
  if (!emailValido(email)) {
    return erroCadastro('Esse e-mail não parece válido. Confere aí?');
  }
  if (senha.length < 6) {
    return erroCadastro('A senha precisa ter no mínimo 6 caracteres.');
  }
  if (senha !== confirmar) {
    return erroCadastro('As senhas não são iguais.');
  }
  if (!aceitouTermos) {
    return erroCadastro('Você precisa aceitar os Termos de Uso para criar a conta.');
  }

  try {
    // PASSO 5.3 — Já existe alguém com esse e-mail?
    const jaExiste = await Usuario.buscarPorEmail(email);
    if (jaExiste) {
      // 409 = "conflito": o que você quer criar já existe
      return erroCadastro('Já existe uma conta com esse e-mail. Tente fazer login.', 409);
    }

    // PASSO 5.4 — Embaralhar a senha. NUNCA salvamos a senha pura.
    // O "10" é a força do embaralhamento (quanto maior, mais lento e mais seguro).
    const senhaHash = await bcrypt.hash(senha, 10);

    // PASSO 5.5 — Salvar no banco (função do model do Vitor).
    await Usuario.criar({ nome, email, telefone, senhaHash });

    // PASSO 5.6 — Deu certo! Mostra o sucesso na própria tela de cadastro.
    return res.status(201).render('cadastro', {
      erro: null,
      sucesso: 'Conta criada com sucesso! Agora é só fazer login.',
    });
  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    return erroCadastro('Não foi possível criar a conta agora. Tente novamente.', 500);
  }
}


// =====================================================================
// PASSO 6 — RECUPERAR SENHA
//
// Regra de ouro: a resposta é SEMPRE a mesma, exista o e-mail ou não.
// Assim ninguém usa esta tela para descobrir quem tem conta.
//
// Fluxo: pega o e-mail -> procura o usuário -> se achar, gera um token
// (uma "chavinha" de uso único) -> responde com a mesma mensagem.
// =====================================================================
async function recuperarSenha(req, res) {
  // PASSO 6.1 — Pegar o e-mail.
  const email = limpar(req.body.email).toLowerCase();

  // PASSO 6.2 — Conferir se parece um e-mail.
  if (!email || !emailValido(email)) {
    return res.status(400).render('recuperar-senha', {
      erro: 'Informe um e-mail válido.',
      sucesso: null,
    });
  }

  try {
    // PASSO 6.3 — Procurar o usuário.
    const usuario = await Usuario.buscarPorEmail(email);

    if (usuario) {
      // PASSO 6.4 — Gerar o token: 32 bytes aleatórios escritos em letras e números.
      const token = crypto.randomBytes(32).toString('hex');
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // vale por 1 hora

      // PASSO 6.5 — Guardar o token no usuário (função do model do Vitor).
      await Usuario.salvarTokenRecuperacao(usuario.id, token, expiraEm);

      // TODO (equipe): aqui entraria o envio de e-mail de verdade (ex.: nodemailer).
      // Por enquanto mostramos o link no terminal, só para testar em desenvolvimento.
      console.log(`[DEV] Link de recuperação para ${email}: /redefinir-senha/${token}`);
    }

    // PASSO 6.6 — Mesma mensagem nos dois casos (existe ou não existe).
    return res.render('recuperar-senha', {
      erro: null,
      sucesso: 'Se esse e-mail estiver cadastrado, você vai receber as instruções em instantes.',
    });
  } catch (erro) {
    console.error('Erro na recuperação de senha:', erro);
    return res.status(500).render('recuperar-senha', {
      erro: 'Não foi possível processar agora. Tente novamente.',
      sucesso: null,
    });
  }
}


// =====================================================================
// PASSO 7 — LOGOUT (sair)
//
// Apaga a sessão no servidor, apaga o cookie (o "crachá") no navegador
// e volta para o login. Usamos GET para ficar fácil de usar como link,
// mas em um projeto de produção o ideal é POST.
// =====================================================================
function logout(req, res) {
  req.session.destroy((erro) => {
    if (erro) {
      console.error('Erro ao encerrar sessão:', erro);
    }
    res.clearCookie('connect.sid'); // nome padrão do cookie do express-session
    return res.redirect('/login');
  });
}


// =====================================================================
// EXPORTAÇÃO — o routes/auth.js importa estas funções
// =====================================================================
module.exports = {
  mostrarLogin,
  mostrarCadastro,
  mostrarRecuperarSenha,
  loginCliente,
  loginAdmin,
  cadastrar,
  recuperarSenha,
  logout,
};