
document.addEventListener("DOMContentLoaded", () => {
    const CHAVE_PEDIDOS = "pixelBurguer_atendimentos";

    const colunas = {
        "Recebido": document.querySelector("#kanban-col-recebidos-cards"),
        "Em Preparo": document.querySelector("#kanban-col-preparo-cards"),
        "Pronto": document.querySelector("#kanban-col-prontos-cards"),
        "Finalizado": document.querySelector("#kanban-col-finalizados-cards")
    };

    const filtros = {
        "filter-all": null,
        "filter-recebidos": "Recebido",
        "filter-preparo": "Em Preparo",
        "filter-prontos": "Pronto",
        "filter-finalizados": "Finalizado"
    };

    const campoBusca = document.querySelector("#admin-search-field");

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]);
    }

    function carregarPedidos() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_PEDIDOS) || "[]"
            );

            return Array.isArray(dados) ? dados : [];
        } catch (erro) {
            console.error("Erro ao carregar os pedidos:", erro);
            return [];
        }
    }

    function salvarPedidos(pedidos) {
        try {
            localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
            return true;
        } catch (erro) {
            console.error("Erro ao salvar os pedidos:", erro);
            alert("Não foi possível salvar a alteração do pedido.");
            return false;
        }
    }

    function normalizarStatus(status) {
        const texto = String(status || "").trim().toLowerCase();

        if (texto === "cancelado" || texto === "cancelados") {
            return "Cancelado";
        }

        if (texto === "recebido" || texto === "recebidos") {
            return "Recebido";
        }

        if (
            texto === "em preparo" ||
            texto === "preparo" ||
            texto === "em preparo na chapa"
        ) {
            return "Em Preparo";
        }

        if (
            texto === "pronto" ||
            texto === "prontos" ||
            texto === "pronto para servir"
        ) {
            return "Pronto";
        }

        if (
            texto === "finalizado" ||
            texto === "finalizados" ||
            texto === "encerrado" ||
            texto === "encerrados"
        ) {
            return "Finalizado";
        }

        return "Recebido";
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarHorario(data) {
        if (!data) return "Horário não informado";

        const dataPedido = new Date(data);

        if (Number.isNaN(dataPedido.getTime())) {
            return "Horário não informado";
        }

        return dataPedido.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function nomePagamento(pagamento) {
        const formas = {
            cash: "Dinheiro",
            credit: "Cartão de Crédito",
            debit: "Cartão de Débito",
            pix: "PIX"
        };

        return formas[pagamento] || pagamento || "Não informado";
    }

    function obterAcao(status) {
        const acoes = {
            "Recebido": {
                texto: "Iniciar preparo",
                classe: "btn-action-primary",
                proximo: "Em Preparo",
                icone: "fa-fire-burner"
            },
            "Em Preparo": {
                texto: "Marcar como pronto",
                classe: "btn-action-blue",
                proximo: "Pronto",
                icone: "fa-bell-concierge"
            },
            "Pronto": {
                texto: "Servido (Conta paga)",
                classe: "btn-action-green",
                proximo: "Finalizado",
                icone: "fa-circle-check"
            },
            "Finalizado": {
                texto: "Ver Comanda Encerrada",
                classe: "btn-action-details",
                proximo: null,
                icone: "fa-eye"
            }
        };

        return acoes[status] || acoes["Recebido"];
    }

    function criarCard(pedido) {
        const status = normalizarStatus(pedido.status);
        const acao = obterAcao(status);

        const produtos = Array.isArray(pedido.produtos)
            ? pedido.produtos
            : [];

        const numero = String(pedido.id ?? "").slice(-4) || "Novo";

        const linhasProdutos = produtos.map(produto => {
            const quantidade = Number(produto.quantidade) || 0;
            const preco = Number(produto.preco) || 0;

            return `
                <div class="order-item-line">
                    <span>
                        <strong class="order-item-qty">${quantidade}x</strong>
                        ${escaparHTML(produto.nome || "Produto")}
                    </span>
                    <span>${formatarMoeda(preco * quantidade)}</span>
                </div>
            `;
        }).join("");

        const card = document.createElement("article");
        card.className = "order-card";
        card.dataset.pedidoId = String(pedido.id);
        card.dataset.status = status;

        let botoes = "";

        if (status === "Cancelado") {
            botoes = `
                <div style="color:#c62828;font-weight:bold;margin-bottom:10px;">
                    PEDIDO CANCELADO
                </div>

                <button
                    type="button"
                    class="btn-card-action btn-action-details"
                    data-excluir-pedido
                >
                    <i class="fa-solid fa-trash" aria-hidden="true"></i>
                    <span>Excluir pedido</span>
                </button>
            `;
        } else {
            botoes = `
                <button
                    type="button"
                    class="btn-card-action ${acao.classe}"
                    data-acao-pedido
                >
                    <i class="fa-solid ${acao.icone}" aria-hidden="true"></i>
                    <span>${acao.texto}</span>
                </button>

                ${
                    status !== "Finalizado"
                        ? `
                            <button
                                type="button"
                                class="btn-card-action btn-action-details"
                                data-cancelar-pedido
                            >
                                <i class="fa-solid fa-ban" aria-hidden="true"></i>
                                <span>Cancelar pedido</span>
                            </button>
                        `
                        : ""
                }
            `;
        }

        card.innerHTML = `
            <div class="order-header-row">
                <span class="order-id">#${escaparHTML(numero)}</span>

                <span class="order-time">
                    <i class="fa-regular fa-clock" aria-hidden="true"></i>
                    ${escaparHTML(formatarHorario(pedido.data))}
                </span>
            </div>

            <div class="order-customer-row">
                <div class="order-customer">
                    <i class="fa-regular fa-user" aria-hidden="true"></i>
                    <span>${escaparHTML(pedido.cliente || "Cliente")}</span>
                </div>
            </div>

            <div class="order-modality-block">
                <span class="status-tag tag-table">
                    <i class="fa-solid fa-chair" aria-hidden="true"></i>
                    Mesa ${escaparHTML(pedido.mesa || "Não informada")}
                </span>
            </div>

            <div class="order-items-list">
                ${linhasProdutos || "<p>Nenhum produto informado.</p>"}
            </div>

            <div class="order-footer-info">
                <span class="order-total-price">
                    ${formatarMoeda(pedido.total)}
                </span>

                <span class="order-payment-method">
                    <i class="fa-solid fa-wallet" aria-hidden="true"></i>
                    ${escaparHTML(nomePagamento(pedido.pagamento))}
                </span>
            </div>

            <div class="order-card-actions">
                ${botoes}
            </div>
        `;

        return card;
    }

    function renderizarPedidosSalvos() {
        const pedidos = carregarPedidos();

        if (pedidos.length === 0) {
            document.querySelectorAll(".order-card").forEach(card => {
                const coluna = card.closest(".kanban-column");

                if (!coluna) return;

                if (coluna.classList.contains("col-recebidos")) {
                    card.dataset.status = "Recebido";
                } else if (coluna.classList.contains("col-preparo")) {
                    card.dataset.status = "Em Preparo";
                } else if (coluna.classList.contains("col-prontos")) {
                    card.dataset.status = "Pronto";
                } else if (coluna.classList.contains("col-finalizados")) {
                    card.dataset.status = "Finalizado";
                }
            });

            atualizarPainel();
            return;
        }

        Object.values(colunas).forEach(coluna => {
            if (coluna) coluna.replaceChildren();
        });

        pedidos.forEach(pedido => {
            const status = normalizarStatus(pedido.status);

            // Sem uma coluna própria no HTML, os cancelados ficam
            // na coluna Recebidos, identificados como cancelados.
            const destino = status === "Cancelado"
                ? colunas["Recebido"]
                : colunas[status];

            if (!destino) return;

            pedido.status = status;
            destino.appendChild(criarCard(pedido));
        });

        atualizarPainel();
    }

    function atualizarPainel() {
        const contagens = {
            "Recebido": 0,
            "Em Preparo": 0,
            "Pronto": 0,
            "Finalizado": 0
        };

        document.querySelectorAll(".order-card").forEach(card => {
            const coluna = card.closest(".kanban-column");
            if (!coluna) return;

            let status = card.dataset.status;

            if (!status) {
                if (coluna.classList.contains("col-recebidos")) {
                    status = "Recebido";
                } else if (coluna.classList.contains("col-preparo")) {
                    status = "Em Preparo";
                } else if (coluna.classList.contains("col-prontos")) {
                    status = "Pronto";
                } else {
                    status = "Finalizado";
                }

                card.dataset.status = status;
            }

            if (Object.prototype.hasOwnProperty.call(contagens, status)) {
                contagens[status]++;
            }
        });

        const indicadores = {
            "Recebido": "#kpi-val-recebidos",
            "Em Preparo": "#kpi-val-preparo",
            "Pronto": "#kpi-val-prontos",
            "Finalizado": "#kpi-val-finalizados"
        };

        Object.entries(indicadores).forEach(([status, seletor]) => {
            const elemento = document.querySelector(seletor);

            if (elemento) {
                elemento.textContent = contagens[status];
            }
        });

        const badges = {
            "Recebido": "#badge-col-recebidos",
            "Em Preparo": "#badge-col-preparo",
            "Pronto": "#badge-col-prontos",
            "Finalizado": "#badge-col-finalizados"
        };

        const textos = {
            "Recebido": "na fila",
            "Em Preparo": "na chapa",
            "Pronto": "para servir",
            "Finalizado": "encerrados"
        };

        Object.entries(badges).forEach(([status, seletor]) => {
            const elemento = document.querySelector(seletor);

            if (elemento) {
                elemento.textContent =
                    `${contagens[status]} ${textos[status]}`;
            }
        });

        aplicarFiltros();
    }

    function aplicarFiltros() {
        const filtroSelecionado = document.querySelector(
            'input[name="order-status-filter"]:checked'
        );

        const statusFiltro = filtroSelecionado
            ? filtros[filtroSelecionado.id]
            : null;

        const busca = campoBusca
            ? campoBusca.value.trim().toLocaleLowerCase("pt-BR")
            : "";

        document.querySelectorAll(".order-card").forEach(card => {
            const status = card.dataset.status || "Recebido";

            const correspondeStatus =
                !statusFiltro ||
                status === statusFiltro ||
                (status === "Cancelado" && !statusFiltro);

            const correspondeBusca = card.textContent
                .toLocaleLowerCase("pt-BR")
                .includes(busca);

            card.hidden = !(correspondeStatus && correspondeBusca);
        });
    }

    function cancelarPedido(card) {
        const idPedido = card.dataset.pedidoId;

        if (!idPedido) {
            alert("Esse pedido de demonstração não pode ser cancelado.");
            return;
        }

        const pedidos = carregarPedidos();

        const pedido = pedidos.find(
            item => String(item.id) === idPedido
        );

        if (!pedido) {
            alert("Não foi possível encontrar esse pedido.");
            return;
        }

        if (pedido.status === "Finalizado") {
            alert("Não é possível cancelar um pedido finalizado.");
            return;
        }

        if (pedido.status === "Cancelado") {
            alert("Esse pedido já está cancelado.");
            return;
        }

        const confirmar = confirm(
            `Deseja realmente cancelar o pedido de ${pedido.cliente}, da mesa ${pedido.mesa}?`
        );

        if (!confirmar) return;

        pedido.status = "Cancelado";

        if (!salvarPedidos(pedidos)) return;

        alert("Pedido cancelado com sucesso!");
        renderizarPedidosSalvos();
    }

    function excluirPedido(card) {
        const idPedido = card.dataset.pedidoId;

        if (!idPedido) {
            alert("Esse pedido de demonstração não pode ser excluído.");
            return;
        }

        const pedidos = carregarPedidos();

        const pedido = pedidos.find(
            item => String(item.id) === idPedido
        );

        if (!pedido) {
            alert("Pedido não encontrado.");
            return;
        }

        if (normalizarStatus(pedido.status) !== "Cancelado") {
            alert("Só é possível excluir pedidos cancelados.");
            return;
        }

        const confirmar = confirm(
            `Deseja excluir definitivamente o pedido de ${pedido.cliente}, da mesa ${pedido.mesa}?`
        );

        if (!confirmar) return;

        const pedidosAtualizados = pedidos.filter(
            item => String(item.id) !== idPedido
        );

        if (!salvarPedidos(pedidosAtualizados)) return;

        alert("Pedido excluído com sucesso!");
        renderizarPedidosSalvos();
    }

    function atualizarStatusCard(card) {
        const statusAtual = card.dataset.status || "Recebido";
        const acao = obterAcao(statusAtual);

        if (!card.dataset.pedidoId) {
            if (!acao.proximo) {
                alert(card.textContent.trim());
                return;
            }

            const destino = colunas[acao.proximo];
            if (!destino) return;

            card.dataset.status = acao.proximo;
            destino.appendChild(card);

            const novaAcao = obterAcao(acao.proximo);
            const botao = card.querySelector("[data-acao-pedido]");

            if (botao) {
                botao.className = `btn-card-action ${novaAcao.classe}`;
                botao.innerHTML = `
                    <i class="fa-solid ${novaAcao.icone}" aria-hidden="true"></i>
                    <span>${novaAcao.texto}</span>
                `;
            }

            atualizarPainel();
            return;
        }

        const pedidos = carregarPedidos();

        const pedido = pedidos.find(
            item => String(item.id) === card.dataset.pedidoId
        );

        if (!pedido) {
            alert("Não foi possível encontrar esse pedido salvo.");
            return;
        }

        if (!acao.proximo) {
            const produtos = Array.isArray(pedido.produtos)
                ? pedido.produtos
                    .map(item => `${item.quantidade}x ${item.nome}`)
                    .join("\n")
                : "Nenhum produto";

            alert(
                `Comanda #${String(pedido.id).slice(-4)}\n\n` +
                `Cliente: ${pedido.cliente}\n` +
                `Mesa: ${pedido.mesa}\n` +
                `Produtos:\n${produtos}\n\n` +
                `Total: ${formatarMoeda(pedido.total)}\n` +
                `Pagamento: ${nomePagamento(pedido.pagamento)}\n` +
                `Status: ${pedido.status}`
            );

            return;
        }

        pedido.status = acao.proximo;

        if (!salvarPedidos(pedidos)) return;

        renderizarPedidosSalvos();
    }

    document.addEventListener("click", evento => {
        const botaoExcluir = evento.target.closest("[data-excluir-pedido]");

        if (botaoExcluir) {
            const card = botaoExcluir.closest(".order-card");

            if (card) excluirPedido(card);
            return;
        }

        const botaoCancelar = evento.target.closest("[data-cancelar-pedido]");

        if (botaoCancelar) {
            const card = botaoCancelar.closest(".order-card");

            if (card) cancelarPedido(card);
            return;
        }

        const botao = evento.target.closest("[data-acao-pedido]");

        if (!botao) return;

        const card = botao.closest(".order-card");

        if (card) atualizarStatusCard(card);
    });

    document.querySelectorAll(
        'input[name="order-status-filter"]'
    ).forEach(filtro => {
        filtro.addEventListener("change", aplicarFiltros);
    });

    if (campoBusca) {
        campoBusca.addEventListener("input", aplicarFiltros);
    }

    renderizarPedidosSalvos();
});
