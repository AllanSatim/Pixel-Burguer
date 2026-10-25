// =====================================================================
// models/Usuario.js — VERSÃO PROVISÓRIA (guarda tudo na memória)
// Serve só para você testar o auth.js enquanto o Vitor não entrega o
// model de verdade com o banco. Quando ele entregar, é só trocar este
// arquivo pelo dele (mantendo os mesmos nomes de função).
// ATENÇÃO: ao reiniciar o servidor, os usuários cadastrados somem.
// =====================================================================

const usuarios = [];   // lista de usuários na memória
let proximoId = 1;     // contador para dar um id a cada usuário

module.exports = {
  // Procura um usuário pelo e-mail. Devolve o usuário ou null.
  async buscarPorEmail(email) {
    return usuarios.find((u) => u.email === email) || null;
  },

  // Cria um usuário novo e devolve ele.
  async criar({ nome, email, telefone, senhaHash }) {
    const usuario = { id: proximoId++, nome, email, telefone, senhaHash };
    usuarios.push(usuario);
    return usuario;
  },

  // Guarda o token de recuperação de senha no usuário.
  async salvarTokenRecuperacao(id, token, expiraEm) {
    const usuario = usuarios.find((u) => u.id === id);
    if (usuario) {
      usuario.tokenRecuperacao = token;
      usuario.tokenExpiraEm = expiraEm;
    }
  },
};