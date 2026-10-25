// =====================================================================
// definir-admin.js — Define a senha do administrador no .env, SEM copiar e colar
//
// Por que existe: copiar o hash na mão já deu erro (sobraram letras no começo).
// Este script gera o hash e escreve a linha ADMIN_SENHA_HASH no .env sozinho.
//
// COMO USAR (no terminal, na pasta do projeto, onde fica o .env):
//   node definir-admin.js SUA_SENHA
//   node definir-admin.js SUA_SENHA meuusuario     (se quiser escolher o usuário)
//
// Depois: pare o servidor (Ctrl + C) e rode  node app.js  de novo.
//
// Dica: use uma senha simples, só com letras e números, com 6 ou mais
// caracteres (símbolos como $ ! & podem ser mal lidos pelo terminal).
// =====================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const senha = process.argv[2];
const usuarioEscolhido = process.argv[3]; // opcional

// --- 1) Conferir o que foi digitado -----------------------------------
if (!senha) {
  console.log('Falta a senha. Rode assim:  node definir-admin.js SUA_SENHA');
  process.exit(1);
}
if (senha.length < 6) {
  console.log('Use uma senha com pelo menos 6 caracteres.');
  process.exit(1);
}

// --- 2) Ler o .env que já existe (ou começar um novo) -----------------
const caminho = path.join(process.cwd(), '.env');
const existia = fs.existsSync(caminho);
const original = existia ? fs.readFileSync(caminho, 'utf8') : '';

// Guarda uma cópia de segurança (.env.bak). O .gitignore já esconde ".env.*" do Git.
if (existia) fs.writeFileSync(caminho + '.bak', original);

// Mantém o mesmo tipo de quebra de linha do arquivo (Windows usa \r\n)
const NL = original.includes('\r\n') ? '\r\n' : '\n';
const linhas = original.split(/\r?\n/);
while (linhas.length && linhas[linhas.length - 1].trim() === '') linhas.pop(); // tira linhas vazias do fim

// --- 3) Função que troca (ou cria) uma linha CHAVE=valor ---------------
function definir(chave, valor) {
  const texto = chave + '=' + valor;
  // Acha a linha da chave, mesmo que esteja errada (sem "=", com espaços...)
  const i = linhas.findIndex((l) => new RegExp('^\\s*' + chave + '\\s*(=|$)').test(l));
  if (i >= 0) linhas[i] = texto;
  else linhas.push(texto);
}

// Lê o valor atual de uma chave (ou texto vazio se não existir)
function ler(chave) {
  const linha = linhas.find((l) => new RegExp('^\\s*' + chave + '\\s*=').test(l));
  return linha ? linha.slice(linha.indexOf('=') + 1).trim() : '';
}

// --- 4) Aplicar as mudanças -------------------------------------------
// Usuário: só muda se você escolheu um; se não existe, usa "admin"
if (usuarioEscolhido) definir('ADMIN_USER', usuarioEscolhido);
else if (!ler('ADMIN_USER')) definir('ADMIN_USER', 'admin');

// Hash: sempre gerado de novo a partir da senha que você digitou
definir('ADMIN_SENHA_HASH', bcrypt.hashSync(senha, 10));

// Segredo da sessão: só cria se estiver faltando
if (!ler('SESSION_SECRET')) definir('SESSION_SECRET', crypto.randomBytes(32).toString('hex'));

fs.writeFileSync(caminho, linhas.join(NL) + NL);

// --- 5) Conferir se ficou certo (lê o arquivo de volta e testa a senha) -
const depois = fs.readFileSync(caminho, 'utf8').split(/\r?\n/);
const pegar = (chave) => {
  const l = depois.find((x) => x.startsWith(chave + '='));
  return l ? l.slice(chave.length + 1) : '';
};
const hash = pegar('ADMIN_SENHA_HASH');
const bate = bcrypt.compareSync(senha, hash);

console.log('');
console.log('✅ .env atualizado' + (existia ? ' (cópia da versão antiga em .env.bak)' : ''));
console.log('   Usuário do admin : ' + pegar('ADMIN_USER'));
console.log('   Senha do admin   : a que você acabou de digitar');
console.log('   Conferência      : ' + (bate ? '✅ a senha bate com o hash gravado' : '❌ algo deu errado, tente de novo'));
console.log('');
console.log('Agora pare o servidor (Ctrl + C), rode  node app.js  e entre em /login, aba "Painel Admin".');