
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector(".auth-form");
    const campoEmail = document.getElementById("recovery-email");
    const areaFeedback = document.getElementById("recovery-feedback");

    if (!formulario || !campoEmail || !areaFeedback) {
        console.error("Elementos da recuperação de senha não encontrados.");
        return;
    }

    // Exibe mensagens na tela
    function mostrarMensagem(mensagem, tipo) {
        const icone = tipo === "success"
            ? "fa-circle-check"
            : "fa-circle-exclamation";

        areaFeedback.innerHTML = `
            <div class="alert-box alert-${tipo}" role="status">
                <i class="fa-solid ${icone}" aria-hidden="true"></i>
                <span>${mensagem}</span>
            </div>
        `;
    }

    // Remove a mensagem inicial de exemplo
    areaFeedback.innerHTML = "";

    // Processa o formulário
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const email = campoEmail.value.trim();

        if (!email) {
            mostrarMensagem("Informe seu e-mail cadastrado.", "error");
            campoEmail.focus();
            return;
        }

        if (!campoEmail.validity.valid) {
            mostrarMensagem("Digite um endereço de e-mail válido.", "error");
            campoEmail.focus();
            return;
        }

        mostrarMensagem(
            "Solicitação recebida! Em um sistema real, as instruções seriam enviadas ao e-mail informado.",
            "success"
        );

        formulario.reset();
    });
});
