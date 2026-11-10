"use strict";

// Aguarda carregar o HTML.
document.addEventListener("DOMContentLoaded", function () {
  // Localiza formulário de cadastro.
  const formulario = document.querySelector(".auth-form");

  // Localiza campo do nome.
  const campoNome = document.getElementById("signup-name");
  // Localiza campo do e-mail.
  const campoEmail = document.getElementById("signup-email");
  // Localiza campo do telefone.
  const campoTelefone = document.getElementById("signup-phone");
  // Localiza campo da senha.
  const campoSenha = document.getElementById("signup-password");
  // Localiza confirmação da senha.
  const campoConfirmacao = document.getElementById("signup-confirm-password");
  // Localiza aceite dos termos.
  const termos = document.getElementById("terms-agree");

  // Verifica existência do formulário.
  if (!formulario) {
    // Exibe aviso no console.
    console.warn("Formulário de cadastro não encontrado.");
    // Interrompe a função atual.
    return;
  }

  // Escuta envio do formulário.
  formulario.addEventListener("submit", function (event) {
    // Impede recarregamento automático da página.
    event.preventDefault();

    // Lê nome sem espaços externos.
    const nome = campoNome.value.trim();
    // Lê e-mail sem espaços externos.
    const email = campoEmail.value.trim();
    // Lê telefone sem espaços externos.
    const telefone = campoTelefone.value.trim();
    // Lê valor da senha.
    const senha = campoSenha.value;
    // Lê confirmação da senha.
    const confirmacao = campoConfirmacao.value;

    // Verifica nome não preenchido.
    if (nome === "") {
      // Solicita preenchimento do nome.
      alert("Digite seu nome completo.");
      // Posiciona cursor no nome.
      campoNome.focus();
      // Interrompe este envio.
      return;
    }

    // Verifica e-mail não preenchido.
    if (email === "") {
      // Solicita preenchimento do e-mail.
      alert("Digite seu e-mail.");
      // Posiciona cursor no e-mail.
      campoEmail.focus();
      // Interrompe este envio.
      return;
    }

    // Verifica telefone não preenchido.
    if (telefone === "") {
      // Solicita preenchimento do telefone.
      alert("Digite seu telefone ou WhatsApp.");
      // Posiciona cursor no telefone.
      campoTelefone.focus();
      // Interrompe este envio.
      return;
    }

    // Exige seis caracteres mínimos.
    if (senha.length < 6) {
      // Informa tamanho mínimo exigido.
      alert("A senha precisa ter pelo menos 6 caracteres.");
      // Posiciona cursor na senha.
      campoSenha.focus();
      // Interrompe este envio.
      return;
    }

    // Compara senha e confirmação.
    if (senha !== confirmacao) {
      // Avisa que senhas diferem.
      alert("As senhas não são iguais.");
      // Destaca campo de confirmação.
      campoConfirmacao.focus();
      // Interrompe este envio.
      return;
    }

    // Verifica aceite dos termos.
    if (!termos.checked) {
      // Solicita aceite dos termos.
      alert("Você precisa aceitar os Termos de Uso.");
      // Posiciona foco na opção.
      termos.focus();
      // Interrompe este envio.
      return;
    }

    // Mostra dados validados no console.
    console.log("Cadastro validado:", {
      nome: nome, // Inclui nome informado.
      email: email, // Inclui e-mail informado.
      telefone: telefone, // Inclui telefone informado.
    });

    // Informa validação sem cadastro real.
    alert(
      "Cadastro validado com sucesso! " +
        "A criação de uma conta real ainda precisa ser implementada.",
    );

    // Limpa campos do formulário.
    formulario.reset();
  });

  // Confirma carregamento do script.
  console.log("JavaScript do cadastro carregado!");
});
