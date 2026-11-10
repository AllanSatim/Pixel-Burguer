"use strict"; // Ativa regras mais rígidas.

// Aguarda carregamento do HTML.
document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // PARTE 1: LOGIN DO CLIENTE
  // ==========================================

  // Localiza formulário do cliente.
  const formularioCliente = document.querySelector(
    "#section-client-login form", // Formulário dentro desta seção.
  );

  // Localiza campo do nome.
  const campoNome = document.getElementById("client-name");
  // Localiza campo da mesa.
  const campoMesa = document.getElementById("client-table");

  // Verifica elementos necessários existentes.
  if (formularioCliente && campoNome && campoMesa) {
    // Monitora envio do formulário.
    formularioCliente.addEventListener("submit", function (event) {
      // Lê nome, removendo espaços.
      const nome = campoNome.value.trim();
      // Lê mesa, removendo espaços.
      const mesa = campoMesa.value.trim();

      // Verifica se nome está vazio.
      if (nome === "") {
        event.preventDefault(); // Impede envio do formulário.
        alert("Digite seu nome ou Gamer Tag."); // Informa campo obrigatório.
        campoNome.focus(); // Seleciona campo do nome.
        return; // Encerra esta validação.
      }

      // Verifica se mesa está vazia.
      if (mesa === "") {
        event.preventDefault(); // Impede envio do formulário.
        alert("Digite o número da sua mesa ou balcão."); // Solicita número da mesa.
        campoMesa.focus(); // Seleciona campo da mesa.
        return; // Interrompe execução desta função.
      }

      // Agrupa informações do cliente.
      const cliente = {
        nome: nome, // Registra nome informado.
        mesa: mesa, // Registra mesa informada.
        identificador: `PB-${Date.now().toString(36).toUpperCase()}`,
        dataEntrada: new Date().toISOString(), // Registra data em ISO.
      };

      // Tenta guardar dados localmente.
      try {
        // Salva durante sessão da aba.
        sessionStorage.setItem(
          "pixelBurguer_cliente", // Identifica chave do armazenamento.
          JSON.stringify(cliente), // Converte objeto em texto.
        );
      } catch (erro) {
        // Impede o acesso sem guardar a sessão.
        event.preventDefault();
        // Trata falhas no armazenamento.
        console.error(
          "Erro ao guardar os dados do cliente:", // Descreve problema encontrado.
          erro, // Exibe detalhes do erro.
        );
        alert("Não foi possível iniciar sua sessão. Tente novamente.");
        return;
      }

      campoNome.value = nome; // Mantém nome sem espaços.
      campoMesa.value = mesa; // Mantém mesa sem espaços.

      console.log("Cliente validado:", cliente); // Exibe dados no console.

      // Permite envio padrão do formulário.
      // O destino depende do HTML (action).
    });
  } else {
    // Avisa sobre formulário ausente.
    console.warn("Formulário de cliente não encontrado.");
  }

  // ==========================================
  // PARTE 2: LOGIN DO ADMINISTRADOR
  // ==========================================

  // Localiza formulário do administrador.
  const formularioAdmin = document.querySelector(
    "#section-admin-login form", // Formulário dentro desta seção.
  );

  // Localiza campo de usuário.
  const campoUsuario = document.getElementById("admin-user-input");
  // Localiza campo de senha.
  const campoSenha = document.getElementById("admin-pass-input");

  // Confirma existência dos elementos.
  if (formularioAdmin && campoUsuario && campoSenha) {
    // Monitora envio do administrador.
    formularioAdmin.addEventListener("submit", function (event) {
      // Lê usuário sem espaços externos.
      const usuario = campoUsuario.value.trim();
      // Lê senha sem modificar.
      const senha = campoSenha.value;

      // Verifica usuário não preenchido.
      if (usuario === "") {
        event.preventDefault(); // Bloqueia envio do formulário.
        alert("Digite o usuário ou e-mail do administrador."); // Solicita identificação do administrador.
        campoUsuario.focus(); // Direciona foco ao usuário.
        return; // Interrompe processamento do login.
      }

      // Verifica senha não preenchida.
      if (senha.trim() === "") {
        event.preventDefault(); // Bloqueia envio do formulário.
        alert("Digite a senha do administrador."); // Solicita senha do administrador.
        campoSenha.focus(); // Direciona foco à senha.
        return; // Interrompe processamento do login.
      }

      // Login apenas demonstrativo, sem servidor.
      // Evita transmitir senha pela URL.
      event.preventDefault(); // Impede envio real dos dados.

      console.log("Campos do administrador preenchidos."); // Registra validação sem senha.

      // Informa ausência de autenticação.
      alert(
        "Dados preenchidos! Este login ainda não possui " +
          "autenticação real. O acesso é apenas demonstrativo.",
      );
    }); // Encerra evento do administrador.
  } else {
    // Avisa sobre formulário ausente.
    console.warn("Formulário de administrador não encontrado.");
  }
}); // Encerra evento de carregamento.
