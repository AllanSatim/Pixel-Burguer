// =====================================================================
// routes/paginas.js — Rotas das telas do site
// ATENÇÃO: este arquivo é uma versão PROVISÓRIA só para você testar a
// navegação e o login. A divisão final (quem fica com cardápio, pedido
// e painel) é combinada com o João e o Kauan.
// =====================================================================

const express = require('express');
const router = express.Router();

// Os "porteiros" (agora ficam em middlewares/auth.js)
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');

// ---------- Páginas livres (qualquer pessoa vê) ----------
router.get('/', (req, res) => res.render('index'));
router.get('/sobre', (req, res) => res.render('sobre'));
router.get('/contato', (req, res) => res.render('contato'));
router.get('/cardapio', (req, res) => res.render('cardapio'));

// ---------- Só quem fez o check-in na mesa (ou é admin) ----------
router.get('/pedido', exigirLogin, (req, res) => res.render('pedido'));

// ---------- Só o administrador ----------
router.get('/admin', exigirAdmin, (req, res) => res.render('admin'));

module.exports = router;