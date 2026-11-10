"use strict";

// Importa o framework Express.
const express = require("express");

// Importa configurações de ambiente.
require("dotenv").config();

// Importa ferramentas de caminhos.
const path = require("path");

// Inicializa aplicação do Express.
const app = express();

// Define a porta do servidor.
const PORT = process.env.PORT || 3000;

// Interpreta dados recebidos em JSON.
app.use(express.json());

// Interpreta dados de formulários.
app.use(express.urlencoded({ extended: true }));

// Disponibiliza arquivos CSS, JS e imagens.
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Rota para verificar funcionamento.
app.get("/api/status", (req, res) => {
  // Retorna confirmação do servidor.
  res.status(200).json({
    mensagem: "API Pixel-Burguer funcionando!",
    status: "online",
  });
});

// Inicia servidor na porta configurada.
app.listen(PORT, () => {
  // Informa endereço no terminal.
  console.log(`Servidor Pixel-Burguer rodando em http://localhost:${PORT}`);
});
