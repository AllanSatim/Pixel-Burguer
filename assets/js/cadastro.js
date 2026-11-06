"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector(".auth-form");

    const campoNome = document.getElementById("signup-name");
    const campoEmail = document.getElementById("signup-email");
    const campoTelefone = document.getElementById("signup-phone");
    const campoSenha = document.getElementById("signup-password");
    const campoConfirmacao = document.getElementById(
        "signup-confirm-password"
    );
    const termos = document.getElementById("terms-agree");

    if (!formulario) {
        console.warn("Formulário de cadastro não encontrado.");
        return;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim();
        const telefone = campoTelefone.value.trim();
        const senha = campoSenha.value;
        const confirmacao = campoConfirmacao.value;

        if (nome === "") {
            alert("Digite seu nome completo.");
            campoNome.focus();
            return;
        }

        if (email === "") {
            alert("Digite seu e-mail.");
            campoEmail.focus();
            return;
        }

        if (telefone === "") {
            alert("Digite seu telefone ou WhatsApp.");
            campoTelefone.focus();
            return;
        }

        if (senha.length < 6) {
            alert("A senha precisa ter pelo menos 6 caracteres.");
            campoSenha.focus();
            return;
        }

        if (senha !== confirmacao) {
            alert("As senhas não são iguais.");
            campoConfirmacao.focus();
            return;
        }

        if (!termos.checked) {
            alert("Você precisa aceitar os Termos de Uso.");
            termos.focus();
            return;
        }

        console.log("Cadastro validado:", {
            nome: nome,
            email: email,
            telefone: telefone
        });

        alert(
            "Cadastro validado com sucesso! " +
            "A criação de uma conta real ainda precisa ser implementada."
        );

        formulario.reset();
    });

    console.log("JavaScript do cadastro carregado!");
});