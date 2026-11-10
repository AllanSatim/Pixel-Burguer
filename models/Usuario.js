"use strict";

// Importa conexão com banco.
const pool = require("../config/db");

// Lista usuários cadastrados.
async function listar() {
  // Consulta usuários no banco.
  const [linhas] = await pool.query("SELECT id, nome, email FROM usuarios");

  // Retorna usuários encontrados.
  return linhas;
}

// Busca usuário pelo ID.
async function buscarPorId(id) {
  // Consulta usuário específico.
  const [linhas] = await pool.execute(
    "SELECT id, nome, email FROM usuarios WHERE id = ?",
    [id],
  );

  // Retorna usuário encontrado.
  return linhas[0] || null;
}

// Busca usuário pelo e-mail.
async function buscarPorEmail(email) {
  // Consulta dados para autenticação.
  const [linhas] = await pool.execute(
    "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?",
    [email],
  );

  // Retorna usuário encontrado.
  return linhas[0] || null;
}

// Cadastra novo usuário.
async function criar(dados) {
  // Insere dados no banco.
  const [resultado] = await pool.execute(
    `INSERT INTO usuarios (nome, email, senha_hash)
         VALUES (?, ?, ?)`,
    [dados.nome, dados.email, dados.senha_hash],
  );

  // Retorna ID cadastrado.
  return resultado.insertId;
}

// Atualiza usuário existente.
async function atualizar(id, dados) {
  // Atualiza nome e e-mail.
  const [resultado] = await pool.execute(
    `UPDATE usuarios
         SET nome = ?, email = ?
         WHERE id = ?`,
    [dados.nome, dados.email, id],
  );

  // Retorna quantidade afetada.
  return resultado.affectedRows;
}

// Exclui usuário cadastrado.
async function excluir(id) {
  // Remove registro pelo ID.
  const [resultado] = await pool.execute("DELETE FROM usuarios WHERE id = ?", [
    id,
  ]);

  // Retorna quantidade excluída.
  return resultado.affectedRows;
}

// Exporta funções aos controllers.
module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail,
  criar,
  atualizar,
  excluir,
};
