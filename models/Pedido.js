"use strict";

// Importa conexão com banco.
const pool = require("../config/db");

// Lista todos os pedidos.
async function listar() {
  // Consulta pedidos com usuários.
  const [linhas] = await pool.query(
    `SELECT
            p.id,
            p.usuario_id,
            u.nome AS nome_usuario,
            p.status,
            p.data
         FROM pedidos AS p
         LEFT JOIN usuarios AS u
            ON p.usuario_id = u.id
         ORDER BY p.data DESC`,
  );

  // Retorna pedidos encontrados.
  return linhas;
}

// Busca pedido pelo identificador.
async function buscarPorId(id) {
  // Consulta pedido específico.
  const [pedidos] = await pool.execute(
    `SELECT
            p.id,
            p.usuario_id,
            u.nome AS nome_usuario,
            p.status,
            p.data
         FROM pedidos AS p
         LEFT JOIN usuarios AS u
            ON p.usuario_id = u.id
         WHERE p.id = ?`,
    [id],
  );

  // Verifica pedido inexistente.
  if (pedidos.length === 0) {
    return null;
  }

  // Consulta produtos do pedido.
  const [itens] = await pool.execute(
    `SELECT
            pi.produto_id,
            pr.nome AS produto,
            pi.quantidade,
            pi.preco_unitario
         FROM pedido_itens AS pi
         INNER JOIN produtos AS pr
            ON pi.produto_id = pr.id
         WHERE pi.pedido_id = ?`,
    [id],
  );

  // Retorna pedido com produtos.
  return {
    ...pedidos[0],
    itens,
  };
}

// Cadastra pedido com produtos.
async function criar(dados) {
  // Reserva conexão para transação.
  const conexao = await pool.getConnection();

  try {
    // Inicia transação no banco.
    await conexao.beginTransaction();

    // Insere informações do pedido.
    const [resultado] = await conexao.execute(
      `INSERT INTO pedidos (usuario_id, status)
             VALUES (?, ?)`,
      [dados.usuario_id, dados.status],
    );

    // Obtém identificador do pedido.
    const pedidoId = resultado.insertId;

    // Percorre os produtos recebidos.
    for (const item of dados.itens) {
      // Insere produto no pedido.
      await conexao.execute(
        `INSERT INTO pedido_itens
                    (pedido_id, produto_id, quantidade, preco_unitario)
                 VALUES (?, ?, ?, ?)`,
        [pedidoId, item.produto_id, item.quantidade, item.preco_unitario],
      );
    }

    // Confirma alterações no banco.
    await conexao.commit();

    // Retorna identificador criado.
    return pedidoId;
  } catch (erro) {
    // Desfaz alterações da transação.
    await conexao.rollback();

    // Repassa erro ao controller.
    throw erro;
  } finally {
    // Libera conexão utilizada.
    conexao.release();
  }
}

// Atualiza situação do pedido.
async function atualizarStatus(id, status) {
  // Modifica status do pedido.
  const [resultado] = await pool.execute(
    `UPDATE pedidos
         SET status = ?
         WHERE id = ?`,
    [status, id],
  );

  // Retorna quantidade atualizada.
  return resultado.affectedRows;
}

// Exclui pedido e produtos.
async function excluir(id) {
  // Reserva conexão para transação.
  const conexao = await pool.getConnection();

  try {
    // Inicia transação no banco.
    await conexao.beginTransaction();

    // Remove produtos do pedido.
    await conexao.execute("DELETE FROM pedido_itens WHERE pedido_id = ?", [id]);

    // Remove pedido cadastrado.
    const [resultado] = await conexao.execute(
      "DELETE FROM pedidos WHERE id = ?",
      [id],
    );

    // Confirma exclusões realizadas.
    await conexao.commit();

    // Retorna registros excluídos.
    return resultado.affectedRows;
  } catch (erro) {
    // Desfaz alterações realizadas.
    await conexao.rollback();

    // Repassa erro ao controller.
    throw erro;
  } finally {
    // Libera conexão utilizada.
    conexao.release();
  }
}

// Exporta funções aos controllers.
module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizarStatus,
  excluir,
};
