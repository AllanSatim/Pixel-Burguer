// Aguarda carregamento da página.
document.addEventListener("DOMContentLoaded", () => {
  // Localiza formulário de recuperação.
  const formulario = document.querySelector(".auth-form");

  // Localiza campo de e-mail.
  const campoEmail = document.getElementById("recovery-email");

  // Localiza área de mensagens.
  const areaFeedback = document.getElementById("recovery-feedback");

  // Confere elementos necessários.
  if (!formulario || !campoEmail || !areaFeedback) {
    // Registra problema no console.
    console.error("Elementos da recuperação de senha não encontrados.");

    // Interrompe execução deste bloco.
    return;
  }

  // Mostra mensagem com ícone.
  function mostrarMensagem(mensagem, tipo) {
    // Seleciona ícone pelo tipo.
    const icone =
      tipo === "success"
        ? // Ícone para mensagem positiva.
          "fa-circle-check"
        : // Ícone para mensagem negativa.
          "fa-circle-exclamation";

    // Monta aviso na página.
    areaFeedback.innerHTML = `
            <div class="alert-box alert-${tipo}" role="status">
                <i class="fa-solid ${icone}" aria-hidden="true"></i>
                <span>${mensagem}</span>
            </div>
        `;
  }

  // Limpa aviso inicial ilustrativo.
  areaFeedback.innerHTML = "";

  // Detecta envio do formulário.
  formulario.addEventListener("submit", (evento) => {
    // Impede recarregamento da página.
    evento.preventDefault();

    // Remove espaços do e-mail.
    const email = campoEmail.value.trim();

    // Verifica e-mail não preenchido.
    if (!email) {
      // Exibe aviso de preenchimento.
      mostrarMensagem("Informe seu e-mail cadastrado.", "error");

      // Foca campo de e-mail.
      campoEmail.focus();

      // Interrompe processamento do formulário.
      return;
    }

    // Consulta validação nativa HTML.
    if (!campoEmail.validity.valid) {
      // Exibe aviso de formato.
      mostrarMensagem("Digite um endereço de e-mail válido.", "error");

      // Foca campo de e-mail.
      campoEmail.focus();

      // Interrompe processamento do formulário.
      return;
    }

    // Exibe confirmação apenas demonstrativa.
    mostrarMensagem(
      "Solicitação recebida! Em um sistema real, as instruções seriam enviadas ao e-mail informado.",
      "success",
    );

    // Limpa campos do formulário.
    formulario.reset();
  });
});
