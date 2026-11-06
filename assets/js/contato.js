
/* ========================================
   FORMULÁRIO DE CONTATO - PIXEL BURGUER
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.querySelector(".contato-form-card form");

    if (!formulario) {
        console.error("Formulário de contato não encontrado.");
        return;
    }

    const campoNome = document.querySelector("#contact-name");
    const campoEmail = document.querySelector("#contact-email");
    const campoTelefone = document.querySelector("#contact-phone");
    const campoAssunto = document.querySelector("#contact-subject");
    const campoMensagem = document.querySelector("#contact-message");

    // Formata o telefone enquanto o usuário digita.
    if (campoTelefone) {
        campoTelefone.addEventListener("input", () => {
            let telefone = campoTelefone.value.replace(/\D/g, "");

            telefone = telefone.substring(0, 11);

            if (telefone.length > 10) {
                telefone = telefone.replace(
                    /^(\d{2})(\d{5})(\d{4})$/,
                    "($1) $2-$3"
                );
            } else if (telefone.length > 6) {
                telefone = telefone.replace(
                    /^(\d{2})(\d{4})(\d{0,4})$/,
                    "($1) $2-$3"
                );
            } else if (telefone.length > 2) {
                telefone = telefone.replace(
                    /^(\d{2})(\d{0,5})$/,
                    "($1) $2"
                );
            }

            campoTelefone.value = telefone;
        });
    }

    // Envio do formulário.
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim();
        const telefone = campoTelefone.value.trim();
        const assunto = campoAssunto.value;
        const mensagem = campoMensagem.value.trim();

        if (!nome || !email || !mensagem) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (!campoEmail.checkValidity()) {
            alert("Informe um endereço de e-mail válido.");
            campoEmail.focus();
            return;
        }

        if (telefone) {
            const numerosTelefone = telefone.replace(/\D/g, "");

            if (
                numerosTelefone.length !== 10 &&
                numerosTelefone.length !== 11
            ) {
                alert("Informe um telefone válido com DDD.");
                campoTelefone.focus();
                return;
            }
        }

        const mensagemEnviada = {
            nome: nome,
            email: email,
            telefone: telefone,
            assunto: assunto,
            mensagem: mensagem,
            data: new Date().toLocaleString("pt-BR")
        };

        console.log("Mensagem recebida - Pixel Burguer:");
        console.log(mensagemEnviada);

        alert(
            "Mensagem enviada com sucesso!\n\n" +
            "Obrigado pelo contato, " + nome + "!\n" +
            "A equipe Pixel Burguer agradece sua mensagem."
        );

        formulario.reset();
    });

});
