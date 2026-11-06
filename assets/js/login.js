
"use strict";

// PIXEL BURGUER
// PARTE 1: LOGIN DO CLIENTE
// PARTE 2: LOGIN DO ADMINISTRADOR

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // LOGIN DO CLIENTE
    // ==========================================

    const formularioCliente = document.querySelector(
        "#section-client-login form"
    );

    const campoNome = document.getElementById("client-name");
    const campoMesa = document.getElementById("client-table");

    if (formularioCliente && campoNome && campoMesa) {

        formularioCliente.addEventListener("submit", function (event) {

            const nome = campoNome.value.trim();
            const mesa = campoMesa.value.trim();

            if (nome === "") {
                event.preventDefault();
                alert("Digite seu nome ou Gamer Tag.");
                campoNome.focus();
                return;
            }

            if (mesa === "") {
                event.preventDefault();
                alert("Digite o número da sua mesa ou balcão.");
                campoMesa.focus();
                return;
            }

            const cliente = {
                nome: nome,
                mesa: mesa,
                dataEntrada: new Date().toISOString()
            };

            try {
                sessionStorage.setItem(
                    "pixelBurguer_cliente",
                    JSON.stringify(cliente)
                );
            } catch (erro) {
                console.error(
                    "Erro ao guardar os dados do cliente:",
                    erro
                );
            }

            campoNome.value = nome;
            campoMesa.value = mesa;

            console.log("Cliente validado:", cliente);

            // Continua o envio normal para cardapio.html.
        });

    } else {
        console.warn("Formulário de cliente não encontrado.");
    }


    // ==========================================
    // LOGIN DO ADMINISTRADOR
    // ==========================================

    const formularioAdmin = document.querySelector(
        "#section-admin-login form"
    );

    const campoUsuario = document.getElementById("admin-user-input");
    const campoSenha = document.getElementById("admin-pass-input");

    if (formularioAdmin && campoUsuario && campoSenha) {

        formularioAdmin.addEventListener("submit", function (event) {

            const usuario = campoUsuario.value.trim();
            const senha = campoSenha.value;

            // Verifica se o usuário foi preenchido
            if (usuario === "") {
                event.preventDefault();
                alert("Digite o usuário ou e-mail do administrador.");
                campoUsuario.focus();
                return;
            }

            // Verifica se a senha foi preenchida
            if (senha.trim() === "") {
                event.preventDefault();
                alert("Digite a senha do administrador.");
                campoSenha.focus();
                return;
            }

            // O HTML informa que este login é apenas demonstrativo.
            // Não envia a senha pela URL usando o método GET.
            event.preventDefault();

            console.log("Campos do administrador preenchidos.");

            alert(
                "Dados preenchidos! Este login ainda não possui " +
                "autenticação real. O acesso é apenas demonstrativo."
            );

        });

    } else {
        console.warn("Formulário de administrador não encontrado.");
    }

});
