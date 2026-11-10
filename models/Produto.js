"use strict";

// Importa o Model de produtos.
const Produto = require("../models/Produto");

// Verifica se o ID é válido.
function idValido(id) {
  return /^[1-9]\d*$/.test(String(id)) && Number.isSafeInteger(Number(id));
}

// Valida os dados do produto.
function validarProduto(dados) {
  return (
    dados &&
    typeof dados.nome === "string" &&
    dados.nome.trim() !== "" &&
    dados.preco !== null &&
    dados.preco !== undefined &&
    dados.preco !== "" &&
    Number.isFinite(Number(dados.preco)) &&
    Number(dados.preco) >= 0 &&
    typeof dados.disponivel === "boolean"
  );
}

// Lista todos os produtos.
async function listar(req, res) {
  try {
    // Consulta produtos no Model.
    const produtos = await Produto.listar();

    // Retorna lista em JSON.
    return res.status(200).json(produtos);
  } catch (erro) {
    // Registra falha no terminal.
    console.error(erro);

    // Retorna erro do servidor.
    return res.status(500).json({
      erro: "Erro ao listar produtos",
    });
  }
}

// Busca produto pelo ID.
async function buscar(req, res) {
  // Verifica identificador recebido.
  if (!idValido(req.params.id)) {
    return res.status(400).json({
      erro: "ID inválido",
    });
  }

  try {
    // Busca produto específico.
    const produto = await Produto.buscarPorId(req.params.id);

    // Verifica produto inexistente.
    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    // Retorna produto encontrado.
    return res.status(200).json(produto);
  } catch (erro) {
    // Registra erro da consulta.
    console.error(erro);

    // Retorna erro interno.
    return res.status(500).json({
      erro: "Erro ao buscar produto",
    });
  }
}

// Cadastra um novo produto.
async function criar(req, res) {
  // Valida dados recebidos.
  if (!validarProduto(req.body)) {
    return res.status(400).json({
      erro: "Dados inválidos",
    });
  }

  try {
    // Organiza os dados recebidos.
    const dados = {
      nome: req.body.nome.trim(),
      preco: Number(req.body.preco),
      disponivel: req.body.disponivel,
    };

    // Insere produto pelo Model.
    const id = await Produto.criar(dados);

    // Confirma cadastro realizado.
    return res.status(201).json({
      id,
      mensagem: "Produto cadastrado",
    });
  } catch (erro) {
    // Registra erro do cadastro.
    console.error(erro);

    // Retorna falha do servidor.
    return res.status(500).json({
      erro: "Erro ao cadastrar produto",
    });
  }
}

// Atualiza produto existente.
async function atualizar(req, res) {
  // Verifica ID e dados.
  if (!idValido(req.params.id) || !validarProduto(req.body)) {
    return res.status(400).json({
      erro: "Dados inválidos",
    });
  }

  try {
    // Organiza informações atualizadas.
    const dados = {
      nome: req.body.nome.trim(),
      preco: Number(req.body.preco),
      disponivel: req.body.disponivel,
    };

    // Atualiza registro no banco.
    const alterados = await Produto.atualizar(req.params.id, dados);

    // Verifica registro não encontrado.
    if (!alterados) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    // Confirma atualização realizada.
    return res.status(200).json({
      mensagem: "Produto atualizado",
    });
  } catch (erro) {
    // Registra falha da atualização.
    console.error(erro);

    // Retorna erro interno.
    return res.status(500).json({
      erro: "Erro ao atualizar produto",
    });
  }
}

// Exclui produto existente.
async function excluir(req, res) {
  // Verifica ID informado.
  if (!idValido(req.params.id)) {
    return res.status(400).json({
      erro: "ID inválido",
    });
  }

  try {
    // Exclui produto pelo Model.
    const removidos = await Produto.excluir(req.params.id);

    // Verifica produto inexistente.
    if (!removidos) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    // Confirma exclusão sem conteúdo.
    return res.status(204).send();
  } catch (erro) {
    // Registra erro no terminal.
    console.error(erro);

    // Identifica conflito de relacionamento.
    if (erro.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        erro: "Produto vinculado a pedidos",
      });
    }

    // Retorna erro interno.
    return res.status(500).json({
      erro: "Erro ao excluir produto",
    });
  }
}

// Exporta funções para as rotas.
module.exports = {
  listar,
  buscar,
  criar,
  atualizar,
  excluir,
};
