// =====================================================================
// app.js — Servidor do Pixel Burguer
// É aqui que o Express "liga tudo": pastas públicas, sessão, views e rotas.
//
// COMO RODAR (na pasta do projeto):
//   npm install express express-session bcryptjs dotenv ejs
//   node app.js
// Depois abra no navegador:  http://localhost:3000
// (Importante: use este endereço, e NÃO o Live Server. As rotas como
//  /cardapio e /login só existem quando o servidor está rodando.)
// =====================================================================

require('dotenv').config();              // lê o arquivo .env (senha do admin, segredo da sessão)

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------
// 1) VIEWS (as páginas .ejs que ficam na pasta views)
// Quando uma rota faz res.render('login'), o Express abre views/login.ejs
// ---------------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------------------------------------------------------------------
// 2) PASTA PÚBLICA (css, js e imagens)
// Com o '/public' na frente, o endereço /public/assets/css/style.css
// aponta para o arquivo public/assets/css/style.css — igualzinho ao
// que está escrito nos HTMLs. Funciona aqui e no Live Server.
// ---------------------------------------------------------------------
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------
// 3) LEITURA DOS FORMULÁRIOS
// Sem esta linha, req.body chega vazio e o login/cadastro não funcionam.
// ---------------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------
// 4) SESSÃO (a "memória" do servidor sobre quem está logado)
// O segredo vem do .env. Se esquecerem de criar, usamos um temporário
// só para desenvolvimento e avisamos no terminal.
// ---------------------------------------------------------------------
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET não definido no .env. Usando um segredo TEMPORÁRIO (só para testes).');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'segredo-temporario-so-para-testes',
    resave: false,              // não regrava a sessão se nada mudou
    saveUninitialized: false,   // não cria sessão para quem nem logou
    cookie: {
      httpOnly: true,           // o JavaScript do navegador não consegue ler o cookie
      sameSite: 'lax',          // proteção básica contra envios vindos de outros sites
      maxAge: 1000 * 60 * 60 * 4, // a sessão dura 4 horas
    },
  })
);

// ---------------------------------------------------------------------
// 5) DADOS DISPONÍVEIS EM TODAS AS VIEWS
// Assim qualquer .ejs pode usar a variável "usuario" (ex.: mostrar o
// link do Painel Admin só para o administrador).
// ---------------------------------------------------------------------
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// ---------------------------------------------------------------------
// 6) ROTAS
// ---------------------------------------------------------------------
app.use('/', require('./routes/auth'));     // login, cadastro, recuperar senha, logout (Allan)
app.use('/', require('./routes/paginas'));  // telas do site (equipe)

// Se ninguém respondeu, a página não existe
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

// ---------------------------------------------------------------------
// 7) LIGAR O SERVIDOR
// ---------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🍔 Pixel Burguer rodando em http://localhost:${PORT}`);
});