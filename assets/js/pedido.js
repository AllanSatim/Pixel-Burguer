const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
const cashChangeOptions = document.querySelector("#cash-change-options");
const cashChangeChoiceInputs = document.querySelectorAll('input[name="needs-change"]');
const cashChangeAmountGroup = document.querySelector("#cash-change-amount-group");
const cashChangeAmountInput = document.querySelector("#cash-change-amount");

function updateCashChangeVisibility() {
  const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
  const cashSelected = selectedPaymentMethod && selectedPaymentMethod.value === "cash";
  cashChangeOptions.hidden = !cashSelected;

  if (!cashSelected) {
    cashChangeChoiceInputs.forEach((input) => {
      input.checked = false;
      input.required = false;
    });
    cashChangeAmountGroup.hidden = true;
    cashChangeAmountInput.required = false;
    cashChangeAmountInput.value = "";
    return;
  }

  cashChangeChoiceInputs.forEach((input) => {
    input.required = true;
  });

  const changeNeeded = document.querySelector('input[name="needs-change"]:checked');
  const showAmount = changeNeeded && changeNeeded.value === "yes";
  cashChangeAmountGroup.hidden = !showAmount;
  cashChangeAmountInput.required = Boolean(showAmount);

  if (!showAmount) {
    cashChangeAmountInput.value = "";
  }
}

paymentMethodInputs.forEach((input) => {
  input.addEventListener("change", updateCashChangeVisibility);
});

cashChangeChoiceInputs.forEach((input) => {
  input.addEventListener("change", updateCashChangeVisibility);
});

updateCashChangeVisibility();

/* ========================================
   CARRINHO E FINALIZAÇÃO DO PEDIDO
======================================== */

const CHAVE_PEDIDO = "pixelBurguer_pedido";

function carregarPedido() {
    const pedidoSalvo = localStorage.getItem(CHAVE_PEDIDO);

    if (!pedidoSalvo) {
        return [];
    }

    try {
        return JSON.parse(pedidoSalvo);
    } catch (erro) {
        console.error("Erro ao carregar o pedido:", erro);
        return [];
    }
}

function calcularTotalPedido() {
    const produtos = carregarPedido();

    return produtos.reduce((total, produto) => {
        const preco = Number(produto.preco) || 0;
        const quantidade = Number(produto.quantidade) || 0;

        return total + preco * quantidade;
    }, 0);
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function atualizarResumoPedido() {
    const total = calcularTotalPedido();

    const elementoTotal = document.querySelector(
        ".summary-total-val"
    );

    if (elementoTotal) {
        elementoTotal.textContent = formatarMoeda(total);
    }
}


function finalizarPedido() {
  
    const produtos = carregarPedido();

        for (const produto of produtos) {
        const preco = Number(produto.preco);
        const quantidade = Number(produto.quantidade);

        if (
            !produto.nome ||
            !Number.isFinite(preco) ||
            preco < 0 ||
            !Number.isInteger(quantidade) ||
            quantidade < 1
        ) {
            alert("Existe um produto inválido no carrinho. Verifique os itens antes de continuar.");
            return;
        }
    }

    if (!Array.isArray(produtos) || produtos.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const nomeCliente = document.querySelector("#client-name");
    const numeroMesa = document.querySelector("#table-number");

    const formaPagamento = document.querySelector(
        'input[name="payment-method"]:checked'
    );

    console.log("Forma de pagamento encontrada:", formaPagamento);

    if (!nomeCliente || !nomeCliente.value.trim()) {
        alert("Informe o nome do cliente.");
        nomeCliente?.focus();
        return;
    }

    if (!numeroMesa || !numeroMesa.value.trim()) {
        alert("Informe o número da mesa.");
        numeroMesa?.focus();
        return;
    }

    if (!formaPagamento) {
        alert("Selecione uma forma de pagamento.");
        return;
    }

    let precisaTroco = false;
    let valorParaTroco = null;

    if (formaPagamento.value === "cash") {
        const escolhaTroco = document.querySelector(
            'input[name="needs-change"]:checked'
        );

        if (!escolhaTroco) {
            alert("Informe se precisa de troco.");
            return;
        }

        precisaTroco = escolhaTroco.value === "yes";

        if (precisaTroco) {
            const campoTroco = document.querySelector(
                "#cash-change-amount"
            );

            valorParaTroco = Number(campoTroco?.value);

            if (
                !campoTroco ||
                campoTroco.value.trim() === "" ||
                !Number.isFinite(valorParaTroco) ||
                valorParaTroco < calcularTotalPedido()
            ) {
                alert(
                    "Informe um valor para troco igual ou superior ao total do pedido."
                );
                campoTroco?.focus();
                return;
            }
        }
    }

    const total = calcularTotalPedido();

    const novoPedido = {
        id: Date.now(),
        cliente: nomeCliente.value.trim(),
        mesa: numeroMesa.value.trim(),
        produtos: produtos.map((produto) => ({
            nome: produto.nome,
            preco: Number(produto.preco) || 0,
            quantidade: Number(produto.quantidade) || 0
        })),
        total: total,
        pagamento: formaPagamento.value,
        precisaTroco: precisaTroco,
        valorParaTroco: valorParaTroco,
        status: "Recebido",
        data: new Date().toISOString()
    };

    const chaveHistorico = "pixelBurguer_atendimentos";

    try {
        const historicoSalvo = JSON.parse(
            localStorage.getItem(chaveHistorico) || "[]"
        );

        if (!Array.isArray(historicoSalvo)) {
            throw new Error("O histórico salvo não é uma lista válida.");
        }

        historicoSalvo.push(novoPedido);

        localStorage.setItem(
            chaveHistorico,
            JSON.stringify(historicoSalvo)
        );

        // Limpa somente o carrinho atual após salvar o pedido.
        localStorage.removeItem("pixelBurguer_pedido");

        alert(
            "Pedido registrado com sucesso!\n\n" +
            "Número: " + novoPedido.id + "\n" +
            "Cliente: " + novoPedido.cliente + "\n" +
            "Mesa: " + novoPedido.mesa + "\n" +
            "Total: " + formatarMoeda(total) + "\n" +
            "Status: " + novoPedido.status
        );

        renderizarCarrinhoPixel();
        atualizarResumoPedido();

    } catch (erro) {
        console.error("Erro ao salvar o pedido:", erro);
        alert(
            "Não foi possível salvar o pedido. " +
            "Seus produtos continuam no carrinho."
        );
    }
}



document.addEventListener("DOMContentLoaded", () => {
    atualizarResumoPedido();
    renderizarCarrinhoPixel();
    updateCashChangeVisibility();

    const formulario = document.querySelector("form.checkout-grid");

    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            finalizarPedido();
        });
    } else {
        console.error("Formulário do pedido não encontrado.");
    }
});


/* ========================================
   EXIBIR PRODUTOS NO CARRINHO
======================================== */
function renderizarCarrinhoPixel() {
    const chave = "pixelBurguer_pedido";

    const container = document.querySelector("#cart-items-container");
    const carrinhoVazio = document.querySelector(".empty-cart-box");

    const tituloItens = document.querySelector(
        '[aria-label="Itens do Pedido"] .checkout-card-title'
    );

    if (!container) {
        console.error("Não foi encontrado o espaço do carrinho.");
        return;
    }

    let produtos = [];

    try {
        produtos = JSON.parse(localStorage.getItem(chave)) || [];
    } catch (erro) {
        console.error("Erro ao ler os produtos:", erro);
    }

    if (!Array.isArray(produtos)) {
        produtos = [];
    }

    container.innerHTML = "";

    const quantidadeTotal = produtos.reduce((total, produto) => {
        return total + (Number(produto.quantidade) || 0);
    }, 0);

    const totalPedido = produtos.reduce((total, produto) => {
        return total +
            (Number(produto.preco) || 0) *
            (Number(produto.quantidade) || 0);
    }, 0);

    if (tituloItens) {
        tituloItens.textContent =
            `Itens da Comanda (${quantidadeTotal} itens)`;
    }

    if (carrinhoVazio) {
        carrinhoVazio.style.display =
            produtos.length === 0 ? "" : "none";
    }

    container.style.display =
        produtos.length === 0 ? "none" : "block";

    produtos.forEach((produto, indice) => {

        const quantidade = Number(produto.quantidade) || 0;
        const preco = Number(produto.preco) || 0;

        const item = document.createElement("div");

        item.className = "cart-item";

        item.style.cssText =
            "display:flex;" +
            "justify-content:space-between;" +
            "align-items:center;" +
            "gap:12px;" +
            "padding:14px;" +
            "margin-bottom:10px;" +
            "border:1px solid #ddd;" +
            "border-radius:10px;";

        // =========================
        // INFORMAÇÕES DO PRODUTO
        // =========================

        const informacoes = document.createElement("div");

        const nome = document.createElement("strong");

        nome.textContent = produto.nome || "Produto";

        const detalhes = document.createElement("p");

        detalhes.textContent =
            `${quantidade} x ${formatarMoeda(preco)}`;

        informacoes.append(nome, detalhes);


        // =========================
        // CONTROLES DE QUANTIDADE
        // =========================

        const controlesQuantidade = document.createElement("div");

        controlesQuantidade.style.cssText =
            "display:flex;" +
            "align-items:center;" +
            "gap:8px;";


        // BOTÃO MENOS

        const botaoMenos = document.createElement("button");

botaoMenos.type = "button";
botaoMenos.textContent = "\u2212";

botaoMenos.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #eeeeee;
    color: #222222;
    font-family: Arial, sans-serif;
    font-size: 22px;
    font-weight: bold;
    line-height: 1;
    cursor: pointer;
`;


        // QUANTIDADE

        const quantidadeElemento = document.createElement("span");

        quantidadeElemento.textContent = quantidade;

        quantidadeElemento.style.cssText =
            "min-width:25px;" +
            "text-align:center;" +
            "font-weight:bold;";


        // BOTÃO MAIS

       const botaoMais = document.createElement("button");

botaoMais.type = "button";
botaoMais.textContent = "+";

botaoMais.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #eeeeee;
    color: #222222;
    font-family: Arial, sans-serif;
    font-size: 22px;
    font-weight: bold;
    line-height: 1;
    cursor: pointer;
`;


        // =========================
        // BOTÃO MENOS
        // =========================

        botaoMenos.addEventListener("click", () => {

            const carrinhoAtual =
                JSON.parse(localStorage.getItem(chave)) || [];

            if (carrinhoAtual[indice].quantidade > 1) {

                carrinhoAtual[indice].quantidade--;

            } else {

                carrinhoAtual.splice(indice, 1);
            }

            localStorage.setItem(
                chave,
                JSON.stringify(carrinhoAtual)
            );

            renderizarCarrinhoPixel();
        });


        // =========================
        // BOTÃO MAIS
        // =========================

        botaoMais.addEventListener("click", () => {

            const carrinhoAtual =
                JSON.parse(localStorage.getItem(chave)) || [];

            carrinhoAtual[indice].quantidade++;

            localStorage.setItem(
                chave,
                JSON.stringify(carrinhoAtual)
            );

            renderizarCarrinhoPixel();
        });


        controlesQuantidade.append(
            botaoMenos,
            quantidadeElemento,
            botaoMais
        );


        // =========================
        // SUBTOTAL
        // =========================

        const subtotal = document.createElement("strong");

        subtotal.textContent =
            formatarMoeda(preco * quantidade);


        // =========================
        // BOTÃO REMOVER
        // =========================

        const botaoRemover = document.createElement("button");

        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";

        botaoRemover.className = "btn btn-secondary btn-sm";

        botaoRemover.setAttribute(
            "aria-label",
            `Remover ${produto.nome || "produto"}`
        );

        botaoRemover.addEventListener("click", () => {

            const carrinhoAtual =
                JSON.parse(localStorage.getItem(chave)) || [];

            carrinhoAtual.splice(indice, 1);

            localStorage.setItem(
                chave,
                JSON.stringify(carrinhoAtual)
            );

            renderizarCarrinhoPixel();
        });


        // =========================
        // MONTA O ITEM
        // =========================

        item.append(
            informacoes,
            controlesQuantidade,
            subtotal,
            botaoRemover
        );

        container.appendChild(item);
    });


    // =========================
    // ATUALIZA RESUMO
    // =========================

    const linhasResumo = document.querySelectorAll(
        ".summary-rows .summary-row"
    );

    if (linhasResumo.length >= 2) {

        linhasResumo[0].lastElementChild.textContent =
            `${quantidadeTotal} produtos`;

        linhasResumo[1].lastElementChild.textContent =
            formatarMoeda(totalPedido);
    }


    const elementoTotal = document.querySelector(
        ".summary-total-val"
    );

    if (elementoTotal) {

        elementoTotal.textContent =
            formatarMoeda(totalPedido);
    }


    // =========================
    // ATUALIZA BADGE DO CARRINHO
    // =========================

    document.querySelectorAll(".badge-count").forEach((badge) => {

        badge.textContent = quantidadeTotal;

    });
}
// Executa quando a página estiver carregada
document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrinhoPixel();

    document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    input.checked = false;
    input.removeAttribute("checked");
});

document.querySelectorAll('input[name="needs-change"]').forEach((input) => {
    input.checked = false;
    input.removeAttribute("checked");
});
});