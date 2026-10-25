// =====================================================================
// middlewares/auth.js — Os "porteiros" do Pixel Burguer
// Parte do Allan (servidor / segurança).
//
// O QUE É UM MIDDLEWARE?
// É uma função que fica NO MEIO do caminho: o pedido do navegador passa
// por ela antes de chegar na rota. Ela decide:
//   - "pode passar"  -> chama next()  (a rota continua)
//   - "barrado"      -> responde na hora (redireciona ou mostra erro)
//
// COMO USAR EM QUALQUER ROTA (o João e o Kauan também podem usar):
//   const { exigirLogin, exigirAdmin } = require('../middlewares/auth');
//
//   router.get('/pedido', exigirLogin, (req, res) => res.render('pedido'));
//   router.get('/admin',  exigirAdmin, (req, res) => res.render('admin'));
//
// Eles dependem da sessão, que o app.js liga com express-session.
// A sessão é criada no login (veja controllers/authController.js).
// =====================================================================


// ---------------------------------------------------------------------
// PORTEIRO 1 — exigirLogin
// Só passa quem já fez login: cliente (check-in na mesa) OU admin.
// ---------------------------------------------------------------------
function exigirLogin(req, res, next) {
  // req.session.usuario só existe depois que a pessoa logou
  if (req.session && req.session.usuario) {
    return next();               // tem login -> pode seguir para a rota
  }
  return res.redirect('/login'); // não tem login -> volta para a tela de login
}


// ---------------------------------------------------------------------
// PORTEIRO 2 — exigirAdmin
// Só passa o administrador. Cliente comum não entra no painel.
// ---------------------------------------------------------------------
function exigirAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.tipo === 'admin') {
    return next();               // é admin -> pode seguir
  }
  // 403 = "eu sei quem você é, mas você não tem permissão para isso"
  return res.status(403).render('login', {
    erro: 'Acesso restrito. Entre como administrador para ver o painel.',
  });
}


module.exports = { exigirLogin, exigirAdmin };