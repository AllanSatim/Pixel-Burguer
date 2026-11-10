// Espera o HTML carregar completamente.
document.addEventListener("DOMContentLoaded", () => {
  // Localiza o formulário de contato.
  const formulario = document.querySelector(".contato-form-card form");

  // Verifica se formulário existe.
  if (!formulario) {
    // Informa erro no console.
    console.error("Formulário de contato não encontrado.");
    // Interrompe execução desta função.
    return;
  }

  // Localiza campo de nome.
  const campoNome = document.querySelector("#contact-name");
  // Localiza campo de e-mail.
  const campoEmail = document.querySelector("#contact-email");
  // Localiza campo de telefone.
  const campoTelefone = document.querySelector("#contact-phone");
  // Localiza campo de assunto.
  const campoAssunto = document.querySelector("#contact-subject");
  // Localiza campo de mensagem.
  const campoMensagem = document.querySelector("#contact-message");

  // Confere existência do telefone.
  if (campoTelefone) {
    // Detecta digitação no telefone.
    campoTelefone.addEventListener("input", () => {
      // Remove caracteres não numéricos.
      let telefone = campoTelefone.value.replace(/\D/g, "");

      // Limita a onze dígitos.
      telefone = telefone.substring(0, 11);

      // Formata celulares com onze dígitos.
      if (telefone.length > 10) {
        // Insere DDD, espaço e hífen.
        telefone = telefone.replace(
          // Agrupa DDD, número e final.
          /^(\d{2})(\d{5})(\d{4})$/,
          // Define máscara de celular.
          "($1) $2-$3",
        );
        // Formata telefones parcialmente digitados.
      } else if (telefone.length > 6) {
        // Insere máscara para telefone.
        telefone = telefone.replace(
          // Separa grupos de dígitos.
          /^(\d{2})(\d{4})(\d{0,4})$/,
          // Aplica padrão com DDD.
          "($1) $2-$3",
        );
        // Formata números após DDD.
      } else if (telefone.length > 2) {
        // Adiciona parênteses ao DDD.
        telefone = telefone.replace(
          // Agrupa DDD e restante.
          /^(\d{2})(\d{0,5})$/,
          // Aplica máscara parcial inicial.
          "($1) $2",
        );
      }

      // Exibe telefone já formatado.
      campoTelefone.value = telefone;
    });
  }

  // Escuta envio do formulário.
  formulario.addEventListener("submit", (evento) => {
    // Impede recarregamento automático da página.
    evento.preventDefault();

    // Lê nome sem espaços extras.
    const nome = campoNome.value.trim();
    // Lê e-mail sem espaços extras.
    const email = campoEmail.value.trim();
    // Lê telefone sem espaços extras.
    const telefone = campoTelefone.value.trim();
    // Obtém assunto selecionado ou digitado.
    const assunto = campoAssunto.value;
    // Lê mensagem sem espaços extras.
    const mensagem = campoMensagem.value.trim();

    // Confere campos obrigatórios preenchidos.
    if (!nome || !email || !mensagem) {
      // Solicita preencher os campos.
      alert("Preencha todos os campos obrigatórios.");
      // Interrompe envio do formulário.
      return;
    }

    // Verifica validação nativa do e-mail.
    if (!campoEmail.checkValidity()) {
      // Exibe aviso de e-mail.
      alert("Informe um endereço de e-mail válido.");
      // Leva cursor ao e-mail.
      campoEmail.focus();
      // Interrompe envio inválido.
      return;
    }

    // Valida telefone quando informado.
    if (telefone) {
      // Remove símbolos do telefone.
      const numerosTelefone = telefone.replace(/\D/g, "");

      // Exige dez ou onze dígitos.
      if (numerosTelefone.length !== 10 && numerosTelefone.length !== 11) {
        // Exibe aviso sobre DDD.
        alert("Informe um telefone válido com DDD.");
        // Retorna cursor ao telefone.
        campoTelefone.focus();
        // Interrompe envio inválido.
        return;
      }
    }

    // Agrupa informações do contato.
    const mensagemEnviada = {
      // Guarda nome informado.
      nome: nome,
      // Guarda e-mail informado.
      email: email,
      // Guarda telefone informado.
      telefone: telefone,
      // Guarda assunto informado.
      assunto: assunto,
      // Guarda mensagem digitada.
      mensagem: mensagem,
      // Registra data e horário locais.
      data: new Date().toLocaleString("pt-BR"),
    };

    // Identifica registro no console.
    console.log("Mensagem recebida - Pixel Burguer:");
    // Mostra dados no console.
    console.log(mensagemEnviada);

    // Exibe confirmação visual simulada.
    alert(
      "Mensagem enviada com sucesso!\n\n" +
        "Obrigado pelo contato, " +
        nome +
        "!\n" +
        "A equipe Pixel Burguer agradece sua mensagem.",
    );

    // Limpa todos os campos.
    formulario.reset();
  });
}); // Finaliza evento de carregamento.
