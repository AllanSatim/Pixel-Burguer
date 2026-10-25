// =====================================================================
// routes/auth.js — Mapa de endereços da autenticação
// Parte do Allan (servidor).
//
// Este arquivo ficou pequeno de propósito. Ele só responde a pergunta:
//   "quando alguém acessar ESTE endereço, qual função chamo?"
// A lógica de verdade mora em controllers/authController.js.
//
// No app.js ele é ligado com:  app.use('/', require('./routes/auth'));
//
// GET  = o navegador PEDIU uma página (digitou o endereço ou clicou num link)
// POST = o navegador está ENVIANDO dados (a pessoa clicou em enviar no formulário)
// =====================================================================

const express = require('express');
const router = express.Router();

// As funções que fazem o trabalho (login, cadastro, recuperação, logout)
const auth = require('../controllers/authController');

// ---------- Telas (só mostram as páginas) ----------
router.get('/login', auth.mostrarLogin);
router.get('/cadastro', auth.mostrarCadastro);
router.get('/recuperar-senha', auth.mostrarRecuperarSenha);

// ---------- Ações (recebem os dados dos formulários) ----------
router.post('/auth/cliente', auth.loginCliente);               // cliente: nome e mesa
router.post('/auth/admin', auth.loginAdmin);                   // admin: usuário e senha
router.post('/auth/cadastro', auth.cadastrar);                 // criar conta
router.post('/auth/recuperar-senha', auth.recuperarSenha);     // pedir recuperação de senha

// ---------- Sair ----------
router.get('/auth/logout', auth.logout);

module.exports = router;