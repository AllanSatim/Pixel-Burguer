"use strict";

// Carrega variáveis de ambiente.
require("dotenv").config();

// Importa biblioteca do MySQL.
const mysql = require("mysql2/promise");

// Configura conexões do banco.
const pool = mysql.createPool({
  // Define endereço do servidor.
  host: process.env.DB_HOST || "localhost",

  // Define porta do MySQL.
  port: Number(process.env.DB_PORT || 3306),

  // Define usuário do banco.
  user: process.env.DB_USER,

  // Define senha do banco.
  password: process.env.DB_PASSWORD,

  // Define nome do banco.
  database: process.env.DB_NAME,

  // Aguarda conexões disponíveis.
  waitForConnections: true,

  // Limita conexões simultâneas.
  connectionLimit: 10,
});

// Exporta conexão compartilhada.
module.exports = pool;
