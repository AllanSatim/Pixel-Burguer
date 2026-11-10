// Aguarda o HTML carregar completamente.
document.addEventListener("DOMContentLoaded", () => {
  const CHAVE_PEDIDOS = "pixelBurguer_atendimentos"; // Nome da chave no armazenamento.

  // Relaciona status às colunas HTML.
  const colunas = {
    Recebido: document.querySelector("#kanban-col-recebidos-cards"),

    "Em Preparo": document.querySelector("#kanban-col-preparo-cards"),

    Pronto: document.querySelector("#kanban-col-prontos-cards"),

    Finalizado: document.querySelector("#kanban-col-finalizados-cards"),
  };

  // Relaciona filtros a seus status.
  const filtros = {
    "filter-all": null,

    "filter-recebidos": "Recebido",

    "filter-preparo": "Em Preparo",

    "filter-prontos": "Pronto",

    "filter-finalizados": "Finalizado",
  };

  const campoBusca = document.querySelector("#admin-search-field"); // Encontra o campo de pesquisa.

  // Evita injeção HTML nos textos exibidos.
  function escaparHTML(valor) {
    return String(valor ?? "").replace(
      /[&<>"']/g,
      (caractere) =>
        ({
          "&": "&amp;",

          "<": "&lt;",

          ">": "&gt;",

          '"': "&quot;",

          "'": "&#39;",
        })[caractere],
    );
  }

  // Recupera pedidos salvos no navegador.
  function carregarPedidos() {
    try {
      // Converte texto JSON em dados.
      const dados = JSON.parse(
        localStorage.getItem(CHAVE_PEDIDOS) || "[]", // Busca dados salvos localmente.
      );

      // Garante retorno de uma lista.
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error("Erro ao carregar os pedidos:", erro); // Registra o erro no console.

      return [];
    }
  }

  // Grava lista de pedidos localmente.
  function salvarPedidos(pedidos) {
    try {
      localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos)); // Salva dados no navegador.

      return true;
    } catch (erro) {
      console.error("Erro ao salvar os pedidos:", erro); // Registra o erro no console.

      alert("Não foi possível salvar a alteração do pedido.");

      return false;
    }
  }

  // Padroniza nomes dos estados possíveis.
  function normalizarStatus(status) {
    const texto = String(status || "")
      .trim()
      .toLowerCase(); // Padroniza espaços e letras.

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

  // Formata valores em reais brasileiros.
  function formatarMoeda(valor) {
    // Converte número para moeda local.
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",

      currency: "BRL",
    });
  }

  // Converte datas em horários legíveis.
  function formatarHorario(data) {
    if (!data) return "Horário não informado";

    const dataPedido = new Date(data); // Cria um objeto de data.

    // Detecta uma data inválida.
    if (Number.isNaN(dataPedido.getTime())) {
      return "Horário não informado";
    }

    // Formata somente hora e minuto.
    return dataPedido.toLocaleTimeString("pt-BR", {
      hour: "2-digit",

      minute: "2-digit",
    });
  }

  // Traduz códigos dos meios de pagamento.
  function nomePagamento(pagamento) {
    // Tabela de nomes de pagamentos.
    const formas = {
      cash: "Dinheiro",

      credit: "Cartão de Crédito",

      debit: "Cartão de Débito",

      pix: "PIX",
    };

    return formas[pagamento] || pagamento || "Não informado";
  }

  // Define o próximo botão do pedido.
  function obterAcao(status) {
    // Configura botões por estado.
    const acoes = {
      Recebido: {
        texto: "Iniciar preparo",

        classe: "btn-action-primary",

        proximo: "Em Preparo",

        icone: "fa-fire-burner",
      },

      "Em Preparo": {
        texto: "Marcar como pronto",

        classe: "btn-action-blue",

        proximo: "Pronto",

        icone: "fa-bell-concierge",
      },

      Pronto: {
        texto: "Servido (Conta paga)",

        classe: "btn-action-green",

        proximo: "Finalizado",

        icone: "fa-circle-check",
      },

      Finalizado: {
        texto: "Ver Comanda Encerrada",

        classe: "btn-action-details",

        proximo: null,

        icone: "fa-eye",
      },
    };

    return acoes[status] || acoes["Recebido"];
  }

  // Monta visualmente um cartão de pedido.
  function criarCard(pedido) {
    const status = normalizarStatus(pedido.status); // Padroniza status recebido.

    const acao = obterAcao(status); // Consulta ação referente ao status.

    const produtos = Array.isArray(pedido.produtos) // Confere lista de produtos.
      ? pedido.produtos
      : [];

    const numero = String(pedido.id ?? "").slice(-4) || "Novo"; // Obtém últimos dígitos do identificador.

    // Gera HTML de cada produto.
    const linhasProdutos = produtos
      .map((produto) => {
        const quantidade = Number(produto.quantidade) || 0; // Converte quantidade para número.

        const preco = Number(produto.preco) || 0; // Converte preço para número.

        return `

                <div class="order-item-line">

                    <span>

                        <strong class="order-item-qty">${quantidade}x</strong>

                        ${escaparHTML(produto.nome || "Produto")}

                    </span>

                    <span>${formatarMoeda(preco * quantidade)}</span>

                </div>

            `;
      })
      .join(""); // Junta elementos em texto único.

    const card = document.createElement("article"); // Cria elemento HTML dinamicamente.

    card.className = "order-card"; // Aplica classe CSS ao cartão.

    card.dataset.pedidoId = String(pedido.id); // Guarda ID no elemento HTML.

    card.dataset.status = status; // Guarda status no elemento HTML.

    let botoes = ""; // Começa sem botões de ação.

    // Trata pedidos já cancelados.
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

    // Insere o conteúdo HTML gerado.
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

    // Entrega o cartão pronto.
    return card;
  }

  // Desenha pedidos nas colunas corretas.
  function renderizarPedidosSalvos() {
    const pedidos = carregarPedidos(); // Lê pedidos do armazenamento.

    // Verifica ausência de pedidos salvos.
    if (pedidos.length === 0) {
      // Procura elementos existentes no documento.
      document.querySelectorAll(".order-card").forEach((card) => {
        const coluna = card.closest(".kanban-column"); // Localiza a coluna do cartão.

        if (!coluna) return; // Ignora cartão fora das colunas.

        if (coluna.classList.contains("col-recebidos")) {
          card.dataset.status = "Recebido"; // Guarda status no elemento HTML.
        } else if (coluna.classList.contains("col-preparo")) {
          card.dataset.status = "Em Preparo"; // Guarda status no elemento HTML.
        } else if (coluna.classList.contains("col-prontos")) {
          card.dataset.status = "Pronto"; // Guarda status no elemento HTML.
        } else if (coluna.classList.contains("col-finalizados")) {
          card.dataset.status = "Finalizado"; // Guarda status no elemento HTML.
        }
      });

      atualizarPainel();

      return;
    }

    Object.values(colunas).forEach((coluna) => {
      if (coluna) coluna.replaceChildren();
    });

    pedidos.forEach((pedido) => {
      const status = normalizarStatus(pedido.status); // Padroniza status recebido.

      // Sem uma coluna própria no HTML, os cancelados ficam

      // na coluna Recebidos, identificados como cancelados.

      const destino =
        status === "Cancelado" // Decide onde colocar o cartão.
          ? colunas["Recebido"]
          : colunas[status];

      if (!destino) return; // Evita inserir em coluna inexistente.

      pedido.status = status;

      destino.appendChild(criarCard(pedido)); // Adiciona cartão na coluna correta.
    });

    atualizarPainel();
  }

  // Recalcula indicadores e contagens da tela.
  function atualizarPainel() {
    // Inicia totais de cada status.
    const contagens = {
      Recebido: 0,

      "Em Preparo": 0,

      Pronto: 0,

      Finalizado: 0,
    };

    // Procura elementos existentes no documento.
    document.querySelectorAll(".order-card").forEach((card) => {
      const coluna = card.closest(".kanban-column"); // Localiza a coluna do cartão.

      if (!coluna) return; // Ignora cartão fora das colunas.

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

        card.dataset.status = status; // Guarda status no elemento HTML.
      }

      if (Object.prototype.hasOwnProperty.call(contagens, status)) {
        contagens[status]++;
      }
    });

    // Mapeia os números do painel.
    const indicadores = {
      Recebido: "#kpi-val-recebidos",

      "Em Preparo": "#kpi-val-preparo",

      Pronto: "#kpi-val-prontos",

      Finalizado: "#kpi-val-finalizados",
    };

    Object.entries(indicadores).forEach(([status, seletor]) => {
      const elemento = document.querySelector(seletor); // Procura elemento correspondente na tela.

      if (elemento) {
        elemento.textContent = contagens[status]; // Atualiza texto sem interpretar HTML.
      }
    });

    // Mapeia os rótulos das colunas.
    const badges = {
      Recebido: "#badge-col-recebidos",

      "Em Preparo": "#badge-col-preparo",

      Pronto: "#badge-col-prontos",

      Finalizado: "#badge-col-finalizados",
    };

    // Define legendas das quantidades.
    const textos = {
      Recebido: "na fila",

      "Em Preparo": "na chapa",

      Pronto: "para servir",

      Finalizado: "encerrados",
    };

    Object.entries(badges).forEach(([status, seletor]) => {
      const elemento = document.querySelector(seletor); // Procura elemento correspondente na tela.

      if (elemento) {
        // Atualiza texto sem interpretar HTML.
        elemento.textContent = `${contagens[status]} ${textos[status]}`;
      }
    });

    aplicarFiltros();
  }

  // Filtra os cartões por status e texto.
  function aplicarFiltros() {
    // Localiza filtro de status marcado.
    const filtroSelecionado = document.querySelector(
      'input[name="order-status-filter"]:checked',
    );

    const statusFiltro = filtroSelecionado // Descobre status escolhido pelo usuário.
      ? filtros[filtroSelecionado.id]
      : null;

    const busca = campoBusca // Lê e padroniza termo buscado.
      ? campoBusca.value.trim().toLocaleLowerCase("pt-BR")
      : "";

    // Procura elementos existentes no documento.
    document.querySelectorAll(".order-card").forEach((card) => {
      const status = card.dataset.status || "Recebido";

      // Verifica correspondência do status.
      const correspondeStatus =
        !statusFiltro ||
        status === statusFiltro ||
        (status === "Cancelado" && !statusFiltro);

      const correspondeBusca = card.textContent // Verifica presença do texto pesquisado.

        .toLocaleLowerCase("pt-BR")

        .includes(busca);

      card.hidden = !(correspondeStatus && correspondeBusca); // Oculta cartões que não correspondem.
    });
  }

  // Cancela pedido depois de confirmar.
  function cancelarPedido(card) {
    const idPedido = card.dataset.pedidoId; // Recupera identificador do cartão.

    // Bloqueia alteração de cartão demonstrativo.
    if (!idPedido) {
      alert("Esse pedido de demonstração não pode ser cancelado.");

      return;
    }

    const pedidos = carregarPedidos(); // Lê pedidos do armazenamento.

    // Busca pedido pelo identificador.
    const pedido = pedidos.find((item) => String(item.id) === idPedido);

    // Confere se pedido foi encontrado.
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

    // Solicita confirmação antes da mudança.
    const confirmar = confirm(
      `Deseja realmente cancelar o pedido de ${pedido.cliente}, da mesa ${pedido.mesa}?`,
    );

    if (!confirmar) return; // Interrompe se usuário desistir.

    pedido.status = "Cancelado"; // Marca o pedido como cancelado.

    if (!salvarPedidos(pedidos)) return; // Interrompe se gravação falhar.

    alert("Pedido cancelado com sucesso!");

    renderizarPedidosSalvos(); // Carrega e exibe pedidos atualizados.
  }

  // Remove definitivamente um pedido cancelado.
  function excluirPedido(card) {
    const idPedido = card.dataset.pedidoId; // Recupera identificador do cartão.

    // Bloqueia alteração de cartão demonstrativo.
    if (!idPedido) {
      alert("Esse pedido de demonstração não pode ser excluído.");

      return;
    }

    const pedidos = carregarPedidos(); // Lê pedidos do armazenamento.

    // Busca pedido pelo identificador.
    const pedido = pedidos.find((item) => String(item.id) === idPedido);

    // Confere se pedido foi encontrado.
    if (!pedido) {
      alert("Pedido não encontrado.");

      return;
    }

    if (normalizarStatus(pedido.status) !== "Cancelado") {
      alert("Só é possível excluir pedidos cancelados.");

      return;
    }

    // Solicita confirmação antes da mudança.
    const confirmar = confirm(
      `Deseja excluir definitivamente o pedido de ${pedido.cliente}, da mesa ${pedido.mesa}?`,
    );

    if (!confirmar) return; // Interrompe se usuário desistir.

    // Remove pedido da lista em memória.
    const pedidosAtualizados = pedidos.filter(
      (item) => String(item.id) !== idPedido,
    );

    if (!salvarPedidos(pedidosAtualizados)) return; // Interrompe se gravação falhar.

    alert("Pedido excluído com sucesso!");

    renderizarPedidosSalvos(); // Carrega e exibe pedidos atualizados.
  }

  // Avança o estado ou mostra detalhes.
  function atualizarStatusCard(card) {
    const statusAtual = card.dataset.status || "Recebido"; // Lê status atual do cartão.

    const acao = obterAcao(statusAtual); // Consulta ação referente ao status.

    // Trata cartão de demonstração.
    if (!card.dataset.pedidoId) {
      if (!acao.proximo) {
        alert(card.textContent.trim());

        return;
      }

      const destino = colunas[acao.proximo]; // Decide onde colocar o cartão.

      if (!destino) return; // Evita inserir em coluna inexistente.

      card.dataset.status = acao.proximo; // Guarda status no elemento HTML.

      destino.appendChild(card); // Adiciona cartão na coluna correta.

      const novaAcao = obterAcao(acao.proximo); // Obtém configuração do próximo botão.

      const botao = card.querySelector("[data-acao-pedido]"); // Localiza botão dentro do cartão.

      if (botao) {
        // Atualiza visual do botão.
        botao.className = `btn-card-action ${novaAcao.classe}`;

        // Atualiza ícone e texto.
        botao.innerHTML = `

                    <i class="fa-solid ${novaAcao.icone}" aria-hidden="true"></i>

                    <span>${novaAcao.texto}</span>

                `;
      }

      atualizarPainel();

      return;
    }

    const pedidos = carregarPedidos(); // Lê pedidos do armazenamento.

    // Busca pedido pelo identificador.
    const pedido = pedidos.find(
      (item) => String(item.id) === card.dataset.pedidoId,
    );

    // Confere se pedido foi encontrado.
    if (!pedido) {
      alert("Não foi possível encontrar esse pedido salvo.");

      return;
    }

    if (!acao.proximo) {
      const produtos = Array.isArray(pedido.produtos) // Confere lista de produtos.
        ? pedido.produtos

            .map((item) => `${item.quantidade}x ${item.nome}`)

            .join("\n")
        : "Nenhum produto";

      alert(
        `Comanda #${String(pedido.id).slice(-4)}\n\n` +
          `Cliente: ${pedido.cliente}\n` +
          `Mesa: ${pedido.mesa}\n` +
          `Produtos:\n${produtos}\n\n` +
          `Total: ${formatarMoeda(pedido.total)}\n` +
          `Pagamento: ${nomePagamento(pedido.pagamento)}\n` +
          `Status: ${pedido.status}`,
      );

      return;
    }

    pedido.status = acao.proximo;

    if (!salvarPedidos(pedidos)) return; // Interrompe se gravação falhar.

    renderizarPedidosSalvos(); // Carrega e exibe pedidos atualizados.
  }

  // Trata cliques nos cartões de pedidos.
  document.addEventListener("click", (evento) => {
    const botaoExcluir = evento.target.closest("[data-excluir-pedido]"); // Identifica clique no botão excluir.

    if (botaoExcluir) {
      const card = botaoExcluir.closest(".order-card"); // Encontra o cartão clicado.

      if (card) excluirPedido(card); // Exclui se cartão existe.

      return;
    }

    const botaoCancelar = evento.target.closest("[data-cancelar-pedido]"); // Identifica clique no botão cancelar.

    if (botaoCancelar) {
      const card = botaoCancelar.closest(".order-card"); // Encontra o cartão clicado.

      if (card) cancelarPedido(card); // Cancela se cartão existe.

      return;
    }

    const botao = evento.target.closest("[data-acao-pedido]"); // Identifica clique na ação principal.

    if (!botao) return; // Ignora cliques fora do botão.

    const card = botao.closest(".order-card"); // Encontra o cartão clicado.

    if (card) atualizarStatusCard(card); // Altera se cartão existe.
  });

  // Procura elementos existentes no documento.
  document
    .querySelectorAll('input[name="order-status-filter"]')
    .forEach((filtro) => {
      filtro.addEventListener("change", aplicarFiltros); // Atualiza filtros quando selecionados.
    });

  if (campoBusca) {
    campoBusca.addEventListener("input", aplicarFiltros); // Filtra enquanto usuário digita.
  }

  renderizarPedidosSalvos(); // Carrega e exibe pedidos atualizados.
});
