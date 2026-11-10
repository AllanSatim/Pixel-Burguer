// Identifica os dados temporários do cliente.
const CHAVE_CLIENTE = "pixelBurguer_cliente";

// Aguarda carregar a página.
document.addEventListener("DOMContentLoaded", () => {
  // Preenche os dados da sessão no checkout.
  try {
    const dadosCliente = sessionStorage.getItem(CHAVE_CLIENTE);
    if (!dadosCliente) return;

    const cliente = JSON.parse(dadosCliente);
    if (
      !cliente ||
      typeof cliente.nome !== "string" ||
      !cliente.nome.trim() ||
      typeof cliente.mesa !== "string" ||
      !cliente.mesa.trim()
    ) {
      console.error("Os dados da conta temporária são inválidos.");
      return;
    }

    const campoNome = document.querySelector("#client-name");
    const campoMesa = document.querySelector("#table-number");
    if (campoNome) campoNome.value = cliente.nome;
    if (campoMesa) campoMesa.value = cliente.mesa;
  } catch (erro) {
    console.error("Erro ao carregar a conta temporária:", erro);
  }
});
