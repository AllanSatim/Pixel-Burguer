// Localiza opções de pagamento.
const paymentMethodInputs = document.querySelectorAll(
  'input[name="payment-method"]',
);
// Localiza opções de troco.
const cashChangeOptions = document.querySelector("#cash-change-options");
// Localiza escolhas de troco.
const cashChangeChoiceInputs = document.querySelectorAll(
  'input[name="needs-change"]',
);
// Localiza campo de valor.
const cashChangeAmountGroup = document.querySelector(
  "#cash-change-amount-group",
);
// Localiza entrada de troco.
const cashChangeAmountInput = document.querySelector("#cash-change-amount");
// Controla exibição do troco.
function updateCashChangeVisibility() {
  // Atualiza o destaque da forma de pagamento selecionada.
  paymentMethodInputs.forEach((input) => {
    const cartaoPagamento = input.closest(".payment-method-card");
    if (cartaoPagamento) {
      cartaoPagamento.classList.toggle("active", input.checked);
    }
  });

  // Identifica pagamento selecionado.
  const selectedPaymentMethod = document.querySelector(
    'input[name="payment-method"]:checked',
  );
  // Verifica pagamento em dinheiro.
  const cashSelected =
    selectedPaymentMethod && selectedPaymentMethod.value === "cash";
  // Mostra ou oculta opções.
  cashChangeOptions.hidden = !cashSelected;
  // Trata outros métodos de pagamento.
  if (!cashSelected) {
    // Percorre opções de troco.
    cashChangeChoiceInputs.forEach((input) => {
      // Desmarca a opção.
      input.checked = false;
      // Define obrigatoriedade do campo.
      input.required = false;
    });
    // Mostra ou oculta valor.
    cashChangeAmountGroup.hidden = true;
    // Define exigência do valor.
    cashChangeAmountInput.required = false;
    // Limpa valor digitado.
    cashChangeAmountInput.value = "";
    // Interrompe esta execução.
    return;
  }
  // Percorre opções de troco.
  cashChangeChoiceInputs.forEach((input) => {
    // Define obrigatoriedade do campo.
    input.required = true;
  });
  // Consulta necessidade de troco.
  const changeNeeded = document.querySelector(
    'input[name="needs-change"]:checked',
  );
  // Confere resposta afirmativa.
  const showAmount = changeNeeded && changeNeeded.value === "yes";
  // Mostra ou oculta valor.
  cashChangeAmountGroup.hidden = !showAmount;
  // Define exigência do valor.
  cashChangeAmountInput.required = Boolean(showAmount);
  // Limpa campo quando oculto.
  if (!showAmount) {
    // Limpa valor digitado.
    cashChangeAmountInput.value = "";
  }
}
// Observa formas de pagamento.
paymentMethodInputs.forEach((input) => {
  // Reage à mudança realizada.
  input.addEventListener("change", updateCashChangeVisibility);
});
// Percorre opções de troco.
cashChangeChoiceInputs.forEach((input) => {
  // Reage à mudança realizada.
  input.addEventListener("change", updateCashChangeVisibility);
});
// Atualiza a interface de troco.
updateCashChangeVisibility();
/* ========================================
   CARRINHO E FINALIZAÇÃO DO PEDIDO
======================================== */
// Define chave do carrinho.
const CHAVE_PEDIDO = "pixelBurguer_pedido";
// Recupera carrinho do navegador.
function carregarPedido() {
  // Lê carrinho armazenado.
  const pedidoSalvo = localStorage.getItem(CHAVE_PEDIDO);
  // Verifica ausência de dados.
  if (!pedidoSalvo) {
    // Devolve resultado calculado.
    return [];
  }
  // Inicia tratamento de erros.
  try {
    // Converte JSON em dados.
    return JSON.parse(pedidoSalvo);
    // Trata falhas da operação.
  } catch (erro) {
    // Registra erro no console.
    console.error("Erro ao carregar o pedido:", erro);
    // Devolve resultado calculado.
    return [];
  }
}
// Calcula valor total.
function calcularTotalPedido() {
  // Carrega produtos do carrinho.
  const produtos = carregarPedido();
  // Soma valores dos produtos.
  return produtos.reduce((total, produto) => {
    // Converte preço em número.
    const preco = Number(produto.preco) || 0;
    // Converte quantidade em número.
    const quantidade = Number(produto.quantidade) || 0;
    // Soma subtotais dos produtos.
    return total + preco * quantidade;
  }, 0);
}
// Formata valor em reais.
function formatarMoeda(valor) {
  // Aplica formato monetário brasileiro.
  return valor.toLocaleString("pt-BR", {
    // Define formato da moeda.
    style: "currency",
    // Define formato da moeda.
    currency: "BRL",
  });
}
// Atualiza total apresentado.
function atualizarResumoPedido() {
  // Obtém total calculado.
  const total = calcularTotalPedido();
  // Localiza valor exibido.
  const elementoTotal = document.querySelector(".summary-total-val");
  // Verifica existência do elemento.
  if (elementoTotal) {
    // Exibe total atualizado.
    elementoTotal.textContent = formatarMoeda(total);
  }
}
// Processa finalização do pedido.
function finalizarPedido() {
  // Carrega produtos do carrinho.
  const produtos = carregarPedido();
  // Valida cada produto.
  for (const produto of produtos) {
    // Converte preço em número.
    const preco = Number(produto.preco);
    // Converte quantidade em número.
    const quantidade = Number(produto.quantidade);
    // Confere condições de validação.
    if (
      !produto.nome ||
      !Number.isFinite(preco) ||
      preco < 0 ||
      !Number.isInteger(quantidade) ||
      quantidade < 1
    ) {
      // Exibe mensagem ao usuário.
      alert(
        "Existe um produto inválido no carrinho. Verifique os itens antes de continuar.",
      );
      // Interrompe esta execução.
      return;
    }
  }
  // Confere condições de validação.
  if (!Array.isArray(produtos) || produtos.length === 0) {
    // Exibe mensagem ao usuário.
    alert("Seu carrinho está vazio!");
    // Interrompe esta execução.
    return;
  }
  // Localiza nome do cliente.
  const nomeCliente = document.querySelector("#client-name");
  // Localiza número da mesa.
  const numeroMesa = document.querySelector("#table-number");
  // Encontra pagamento selecionado.
  const formaPagamento = document.querySelector(
    'input[name="payment-method"]:checked',
  );
  // Registra informação no console.
  console.log("Forma de pagamento encontrada:", formaPagamento);
  // Confere condições de validação.
  if (!nomeCliente || !nomeCliente.value.trim()) {
    // Exibe mensagem ao usuário.
    alert("Informe o nome do cliente.");
    nomeCliente?.focus();
    // Interrompe esta execução.
    return;
  }
  // Confere condições de validação.
  if (!numeroMesa || !numeroMesa.value.trim()) {
    // Exibe mensagem ao usuário.
    alert("Informe o número da mesa.");
    numeroMesa?.focus();
    // Interrompe esta execução.
    return;
  }
  // Confere condições de validação.
  if (!formaPagamento) {
    // Exibe mensagem ao usuário.
    alert("Selecione uma forma de pagamento.");
    // Interrompe esta execução.
    return;
  }
  // Inicializa necessidade de troco.
  let precisaTroco = false;
  // Inicializa valor para troco.
  let valorParaTroco = null;
  // Confere condições de validação.
  if (formaPagamento.value === "cash") {
    // Obtém resposta sobre troco.
    const escolhaTroco = document.querySelector(
      'input[name="needs-change"]:checked',
    );
    // Confere condições de validação.
    if (!escolhaTroco) {
      // Exibe mensagem ao usuário.
      alert("Informe se precisa de troco.");
      // Interrompe esta execução.
      return;
    }
    // Guarda escolha do cliente.
    precisaTroco = escolhaTroco.value === "yes";
    // Confere condições de validação.
    if (precisaTroco) {
      // Localiza campo de troco.
      const campoTroco = document.querySelector("#cash-change-amount");
      // Converte valor informado.
      valorParaTroco = Number(campoTroco?.value);
      // Confere condições de validação.
      if (
        !campoTroco ||
        campoTroco.value.trim() === "" ||
        !Number.isFinite(valorParaTroco) ||
        valorParaTroco < calcularTotalPedido()
      ) {
        // Exibe mensagem ao usuário.
        alert(
          "Informe um valor para troco igual ou superior ao total do pedido.",
        );
        campoTroco?.focus();
        // Interrompe esta execução.
        return;
      }
    }
  }
  // Obtém total calculado.
  const total = calcularTotalPedido();
  // Monta registro do pedido.
  const novoPedido = {
    // Gera identificador temporal.
    id: Date.now(),
    // Registra nome do cliente.
    cliente: nomeCliente.value.trim(),
    // Registra mesa do cliente.
    mesa: numeroMesa.value.trim(),
    // Copia itens do pedido.
    produtos: produtos.map((produto) => ({
      // Copia nome do produto.
      nome: produto.nome,
      // Copia preço numérico.
      preco: Number(produto.preco) || 0,
      // Copia quantidade numérica.
      quantidade: Number(produto.quantidade) || 0,
    })),
    // Armazena valor total.
    total: total,
    // Armazena forma de pagamento.
    pagamento: formaPagamento.value,
    // Guarda necessidade de troco.
    precisaTroco: precisaTroco,
    // Guarda valor para troco.
    valorParaTroco: valorParaTroco,
    // Define status inicial.
    status: "Recebido",
    // Registra data do pedido.
    data: new Date().toISOString(),
  };
  // Define chave do histórico.
  const chaveHistorico = "pixelBurguer_atendimentos";
  // Inicia tratamento de erros.
  try {
    // Recupera histórico armazenado.
    const historicoSalvo = JSON.parse(
      localStorage.getItem(chaveHistorico) || "[]",
    );
    // Confere condições de validação.
    if (!Array.isArray(historicoSalvo)) {
      // Indica dados inconsistentes.
      throw new Error("O histórico salvo não é uma lista válida.");
    }
    // Acrescenta pedido ao histórico.
    historicoSalvo.push(novoPedido);
    // Salva dados no navegador.
    localStorage.setItem(chaveHistorico, JSON.stringify(historicoSalvo));
    // Limpa somente o carrinho atual após salvar o pedido.
    // Limpa carrinho já finalizado.
    localStorage.removeItem("pixelBurguer_pedido");
    // Exibe mensagem ao usuário.
    alert(
      "Pedido registrado com sucesso!\n\n" +
        "Número: " +
        novoPedido.id +
        "\n" +
        "Cliente: " +
        novoPedido.cliente +
        "\n" +
        "Mesa: " +
        novoPedido.mesa +
        "\n" +
        "Total: " +
        formatarMoeda(total) +
        "\n" +
        "Status: " +
        novoPedido.status,
    );
    // Atualiza lista do carrinho.
    renderizarCarrinhoPixel();
    // Atualiza resumo financeiro.
    atualizarResumoPedido();
    // Trata falhas da operação.
  } catch (erro) {
    // Registra erro no console.
    console.error("Erro ao salvar o pedido:", erro);
    // Exibe mensagem ao usuário.
    alert(
      "Não foi possível salvar o pedido. " +
        "Seus produtos continuam no carrinho.",
    );
  }
}
// Aguarda carregamento da página.
document.addEventListener("DOMContentLoaded", () => {
  // Atualiza resumo financeiro.
  atualizarResumoPedido();
  // Atualiza lista do carrinho.
  renderizarCarrinhoPixel();
  // Atualiza a interface de troco.
  updateCashChangeVisibility();
  // Localiza formulário de checkout.
  const formulario = document.querySelector("form.checkout-grid");
  // Confere condições de validação.
  if (formulario) {
    // Interceta envio do formulário.
    formulario.addEventListener("submit", (evento) => {
      // Impede recarregamento automático.
      evento.preventDefault();
      // Executa finalização do pedido.
      finalizarPedido();
    });
    // Trata caso alternativo.
  } else {
    // Registra erro no console.
    console.error("Formulário do pedido não encontrado.");
  }
});
/* ========================================
   EXIBIR PRODUTOS NO CARRINHO
======================================== */
// Desenha produtos na tela.
function renderizarCarrinhoPixel() {
  // Define chave local.
  const chave = "pixelBurguer_pedido";
  // Localiza área dos produtos.
  const container = document.querySelector("#cart-items-container");
  // Localiza aviso de vazio.
  const carrinhoVazio = document.querySelector(".empty-cart-box");
  // Localiza título da comanda.
  const tituloItens = document.querySelector(
    '[aria-label="Itens do Pedido"] .checkout-card-title',
  );
  // Confere condições de validação.
  if (!container) {
    // Registra erro no console.
    console.error("Não foi encontrado o espaço do carrinho.");
    // Interrompe esta execução.
    return;
  }
  // Inicia lista de produtos.
  let produtos = [];
  // Inicia tratamento de erros.
  try {
    // Recupera itens armazenados.
    produtos = JSON.parse(localStorage.getItem(chave)) || [];
    // Trata falhas da operação.
  } catch (erro) {
    // Registra erro no console.
    console.error("Erro ao ler os produtos:", erro);
  }
  // Confere condições de validação.
  if (!Array.isArray(produtos)) {
    // Reinicia lista inválida.
    produtos = [];
  }
  // Remove itens exibidos.
  container.innerHTML = "";
  // Converte quantidade em número.
  const quantidadeTotal = produtos.reduce((total, produto) => {
    // Soma subtotais dos produtos.
    return total + (Number(produto.quantidade) || 0);
  }, 0);
  // Calcula valor de tudo.
  const totalPedido = produtos.reduce((total, produto) => {
    // Soma subtotais dos produtos.
    return (
      total + (Number(produto.preco) || 0) * (Number(produto.quantidade) || 0)
    );
  }, 0);
  // Confere condições de validação.
  if (tituloItens) {
    // Atualiza quantidade no título.
    tituloItens.textContent = `Itens da Comanda (${quantidadeTotal} itens)`;
  }
  // Confere condições de validação.
  if (carrinhoVazio) {
    // Alterna aviso de vazio.
    carrinhoVazio.hidden = produtos.length > 0;
  }
  // Mostra ou oculta carrinho.
  container.hidden = produtos.length === 0;
  // Percorre produtos do carrinho.
  produtos.forEach((produto, indice) => {
    // Converte quantidade em número.
    const quantidade = Number(produto.quantidade) || 0;
    // Converte preço em número.
    const preco = Number(produto.preco) || 0;
    // Cria elemento do produto.
    const item = document.createElement("div");
    // Define classe visual.
    item.className = "cart-item";
    // =========================
    // INFORMAÇÕES DO PRODUTO
    // =========================
    // Cria bloco de informações.
    const informacoes = document.createElement("div");
    informacoes.className = "cart-item-info";
    // Cria nome do produto.
    const nome = document.createElement("strong");
    nome.className = "cart-item-name";
    // Preenche nome do produto.
    nome.textContent = produto.nome || "Produto";
    // Cria linha de detalhes.
    const detalhes = document.createElement("p");
    detalhes.className = "cart-item-details";
    // Exibe quantidade e preço.
    detalhes.textContent = `${quantidade} x ${formatarMoeda(preco)}`;
    // Agrupa informações do produto.
    informacoes.append(nome, detalhes);
    // =========================
    // CONTROLES DE QUANTIDADE
    // =========================
    // Cria área de controles.
    const controlesQuantidade = document.createElement("div");
    controlesQuantidade.className = "cart-item-controls";
    // BOTÃO MENOS
    // Cria botão de diminuir.
    const botaoMenos = document.createElement("button");
    // Evita envio do formulário.
    botaoMenos.type = "button";
    // Mostra símbolo de menos.
    botaoMenos.textContent = "\u2212";
    botaoMenos.className = "cart-item-quantity-btn";
    // QUANTIDADE
    // Converte quantidade em número.
    const quantidadeElemento = document.createElement("span");
    quantidadeElemento.className = "cart-item-quantity";
    // Mostra quantidade atual.
    quantidadeElemento.textContent = quantidade;
    // BOTÃO MAIS
    // Cria botão de aumentar.
    const botaoMais = document.createElement("button");
    // Evita envio do formulário.
    botaoMais.type = "button";
    // Mostra símbolo de mais.
    botaoMais.textContent = "+";
    botaoMais.className = "cart-item-quantity-btn";
    // =========================
    // BOTÃO MENOS
    // =========================
    // Configura clique para diminuir.
    botaoMenos.addEventListener("click", () => {
      // Lê carrinho mais recente.
      const carrinhoAtual = JSON.parse(localStorage.getItem(chave)) || [];
      // Confere condições de validação.
      if (carrinhoAtual[indice].quantidade > 1) {
        // Diminui uma unidade.
        carrinhoAtual[indice].quantidade--;
        // Trata caso alternativo.
      } else {
        // Remove produto da lista.
        carrinhoAtual.splice(indice, 1);
      }
      // Salva dados no navegador.
      localStorage.setItem(chave, JSON.stringify(carrinhoAtual));
      // Atualiza lista do carrinho.
      renderizarCarrinhoPixel();
    });
    // =========================
    // BOTÃO MAIS
    // =========================
    // Configura clique para aumentar.
    botaoMais.addEventListener("click", () => {
      // Lê carrinho mais recente.
      const carrinhoAtual = JSON.parse(localStorage.getItem(chave)) || [];
      // Aumenta uma unidade.
      carrinhoAtual[indice].quantidade++;
      // Salva dados no navegador.
      localStorage.setItem(chave, JSON.stringify(carrinhoAtual));
      // Atualiza lista do carrinho.
      renderizarCarrinhoPixel();
    });
    // Agrupa botões e quantidade.
    controlesQuantidade.append(botaoMenos, quantidadeElemento, botaoMais);
    // =========================
    // SUBTOTAL
    // =========================
    // Cria campo do subtotal.
    const subtotal = document.createElement("strong");
    subtotal.className = "cart-item-subtotal";
    // Exibe subtotal calculado.
    subtotal.textContent = formatarMoeda(preco * quantidade);
    // =========================
    // BOTÃO REMOVER
    // =========================
    // Cria botão de remover.
    const botaoRemover = document.createElement("button");
    // Evita envio do formulário.
    botaoRemover.type = "button";
    // Define texto do botão.
    botaoRemover.textContent = "Remover";
    // Aplica classes de estilo.
    botaoRemover.className = "btn btn-secondary btn-sm";
    // Adiciona descrição acessível.
    botaoRemover.setAttribute(
      "aria-label",
      `Remover ${produto.nome || "produto"}`,
    );
    // Configura remoção por clique.
    botaoRemover.addEventListener("click", () => {
      // Lê carrinho mais recente.
      const carrinhoAtual = JSON.parse(localStorage.getItem(chave)) || [];
      // Remove produto da lista.
      carrinhoAtual.splice(indice, 1);
      // Salva dados no navegador.
      localStorage.setItem(chave, JSON.stringify(carrinhoAtual));
      // Atualiza lista do carrinho.
      renderizarCarrinhoPixel();
    });
    // =========================
    // MONTA O ITEM
    // =========================
    // Monta componentes do item.
    item.append(informacoes, controlesQuantidade, subtotal, botaoRemover);
    // Insere produto na página.
    container.appendChild(item);
  });
  // =========================
  // ATUALIZA RESUMO
  // =========================
  // Localiza linhas do resumo.
  const linhasResumo = document.querySelectorAll(".summary-rows .summary-row");
  // Confere condições de validação.
  if (linhasResumo.length >= 2) {
    // Atualiza indicador do resumo.
    linhasResumo[0].lastElementChild.textContent = `${quantidadeTotal} produtos`;
    // Atualiza indicador do resumo.
    linhasResumo[1].lastElementChild.textContent = formatarMoeda(totalPedido);
  }
  // Localiza valor exibido.
  const elementoTotal = document.querySelector(".summary-total-val");
  // Verifica existência do elemento.
  if (elementoTotal) {
    // Exibe total atualizado.
    elementoTotal.textContent = formatarMoeda(totalPedido);
  }
  // =========================
  // ATUALIZA BADGE DO CARRINHO
  // =========================
  // Localiza elementos na página.
  document.querySelectorAll(".badge-count").forEach((badge) => {
    // Atualiza texto apresentado.
    badge.textContent = quantidadeTotal;
  });
}
// Executa quando a página estiver carregada
// Aguarda carregamento da página.
document.addEventListener("DOMContentLoaded", () => {
  // Atualiza lista do carrinho.
  renderizarCarrinhoPixel();
  // Localiza elementos na página.
  document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    // Desmarca a opção.
    input.checked = false;
    // Remove seleção do HTML.
    input.removeAttribute("checked");
  });
  // Localiza elementos na página.
  document.querySelectorAll('input[name="needs-change"]').forEach((input) => {
    // Desmarca a opção.
    input.checked = false;
    // Remove seleção do HTML.
    input.removeAttribute("checked");
  });
  // Sincroniza o destaque com as opções desmarcadas.
  updateCashChangeVisibility();
});
