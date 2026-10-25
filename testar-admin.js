// =====================================================================
// testar-admin.js — Ferramenta para descobrir por que o login do admin falha
//
// Ela NÃO liga o servidor. Só lê o seu .env e confere se a senha que você
// digitar bate com o hash guardado lá — exatamente o que o auth.js faz.
//
// COMO USAR (no terminal, na pasta do projeto, onde fica o .env):
//   node testar-admin.js SUA_SENHA
//
// Dica: use uma senha simples, só com letras e números. Símbolos como
// $ ! & podem ser mal interpretados pelo terminal e atrapalhar o teste.
// =====================================================================

require('dotenv').config({ quiet: true }); // lê o .env sem escrever aviso no terminal
const bcrypt = require('bcryptjs');

const usuario = process.env.ADMIN_USER;
const hash = process.env.ADMIN_SENHA_HASH;
const secret = process.env.SESSION_SECRET;
const senhaDigitada = process.argv[2]; // o que você escreveu depois de "node testar-admin.js"

console.log('--- Conferindo o seu .env ---');

// 1) O .env foi encontrado e lido?
if (!usuario && !hash && !secret) {
  console.log('❌ Nenhuma variável foi lida. O arquivo .env está vazio, com outro nome ou em outra pasta.');
  console.log('   Ele precisa se chamar exatamente ".env" e ficar na mesma pasta do app.js.');
  process.exit(1);
}

// 2) Usuário do admin
if (!usuario) {
  console.log('❌ ADMIN_USER não existe no .env (ou está sem valor).');
} else {
  console.log(`✅ ADMIN_USER lido: "${usuario}"  (é este o texto que vai no campo Usuário, igualzinho)`);
  if (usuario !== usuario.trim()) console.log('⚠️  Tem espaço sobrando no começo ou no fim do usuário.');
  if (/^["']|["']$/.test(usuario)) console.log('⚠️  O usuário está com aspas. Tire as aspas do .env.');
}

// 3) Hash da senha
if (!hash) {
  console.log('❌ ADMIN_SENHA_HASH não existe no .env (ou está sem valor).');
} else {
  const formatoOk = /^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$/.test(hash);
  console.log(`${formatoOk ? '✅' : '❌'} Hash com ${hash.length} caracteres (um hash válido tem 60 e começa com $2a$, $2b$ ou $2y$).`);
  if (!formatoOk) {
    console.log('   O hash está errado: sobrou texto no começo, faltou pedaço, ou tem aspas/espaço.');
    console.log('   Gere de novo: node -e "console.log(require(\'bcryptjs\').hashSync(\'SUA_SENHA\', 10))"');
  }
}

// 4) Segredo da sessão
console.log(secret ? `✅ SESSION_SECRET definido (${secret.length} caracteres).` : '⚠️  SESSION_SECRET não definido.');

// 5) A senha digitada bate com o hash?
console.log('\n--- Conferindo a senha ---');
if (!senhaDigitada) {
  console.log('Você não digitou uma senha. Rode assim:  node testar-admin.js SUA_SENHA');
  process.exit(0);
}
if (!hash) process.exit(1);

bcrypt.compare(senhaDigitada, hash).then((bate) => {
  if (bate) {
    console.log('✅ A senha BATE com o hash. No login, use o usuário acima e essa senha.');
    console.log('   Se mesmo assim o login falhar, o problema não é o .env: reinicie o servidor (Ctrl + C e node app.js).');
  } else {
    console.log('❌ A senha NÃO bate com o hash.');
    console.log('   Ou você digitou outra senha na hora de gerar o hash, ou o hash foi colado errado.');
    console.log('   Solução: gere um hash novo com uma senha que você anote e cole no .env.');
  }
});