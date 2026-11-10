// Identifica os dados temporários e os pedidos salvos.
const CHAVE_CLIENTE_PERFIL = "pixelBurguer_cliente";
const CHAVE_CARRINHO_PERFIL = "pixelBurguer_pedido";
const CHAVE_HISTORICO_PERFIL = "pixelBurguer_atendimentos";

// Aguarda carregar a página.
document.addEventListener("DOMContentLoaded", () => {
  // Localiza informações do perfil.
  const nomePerfil = document.querySelector("#profile-name");
  const mesaPerfil = document.querySelector("#profile-table");
  const identificadorPerfil = document.querySelector("#profile-id");
  const conteudoPerfil = document.querySelector("#profile-content");
  const avisoConvidado = document.querySelector("#profile-guest");
  const botaoSair = document.querySelector("#profile-logout");
  const itensAtuais = document.querySelector("#profile-current-order");
  const historicoPedidos = document.querySelector("#profile-order-history");

  // Formata valores de pedidos.
  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Cria um elemento de texto para as informações.
  function criarTexto(tag, classe, texto) {
    const elemento = document.createElement(tag);
    elemento.className = classe;
    elemento.textContent = texto;
    return elemento;
  }

  // Lê uma lista salva no navegador.
  function carregarLista(chave) {
    try {
      const dados = JSON.parse(localStorage.getItem(chave) || "[]");
      if (!Array.isArray(dados)) {
        throw new Error(`Os dados de ${chave} não são uma lista.`);
      }
      return dados;
    } catch (erro) {
      console.error(`Erro ao carregar ${chave}:`, erro);
      return [];
    }
  }

  // Lê a sessão temporária do cliente.
  function carregarCliente() {
    try {
      const dados = sessionStorage.getItem(CHAVE_CLIENTE_PERFIL);
      if (!dados) return null;

      const cliente = JSON.parse(dados);
      if (
        !cliente ||
        typeof cliente.nome !== "string" ||
        !cliente.nome.trim() ||
        typeof cliente.mesa !== "string" ||
        !cliente.mesa.trim()
      ) {
        throw new Error("Os dados da conta temporária são inválidos.");
      }
      return cliente;
    } catch (erro) {
      console.error("Erro ao carregar a conta temporária:", erro);
      return null;
    }
  }

  // Desenha os produtos do carrinho atual.
  function renderizarPedidoAtual() {
    const carrinho = carregarLista(CHAVE_CARRINHO_PERFIL);
    itensAtuais.replaceChildren();

    if (carrinho.length === 0) {
      itensAtuais.appendChild(
        criarTexto("p", "profile-empty", "Seu carrinho está vazio."),
      );
      return;
    }

    carrinho.forEach((produto) => {
      if (!produto || typeof produto.nome !== "string") return;
      const quantidade = Number(produto.quantidade) || 0;
      const linha = document.createElement("article");
      linha.className = "profile-order-item";
      linha.append(
        criarTexto(
          "span",
          "profile-order-item-name",
          `${quantidade}× ${produto.nome}`,
        ),
        criarTexto(
          "strong",
          "profile-order-item-price",
          formatarMoeda((Number(produto.preco) || 0) * quantidade),
        ),
      );
      itensAtuais.appendChild(linha);
    });
  }

  // Encontra os pedidos da sessão atual.
  function obterHistorico(cliente) {
    return carregarLista(CHAVE_HISTORICO_PERFIL)
      .filter((pedido) => {
        return (
          pedido &&
          typeof pedido.cliente === "string" &&
          typeof pedido.mesa === "string" &&
          pedido.cliente.trim().toLocaleLowerCase("pt-BR") ===
            cliente.nome.trim().toLocaleLowerCase("pt-BR") &&
          pedido.mesa.trim().toLocaleLowerCase("pt-BR") ===
            cliente.mesa.trim().toLocaleLowerCase("pt-BR")
        );
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 3);
  }

  // Desenha o histórico recente desta mesa.
  function renderizarHistorico(cliente) {
    const pedidos = obterHistorico(cliente);
    historicoPedidos.replaceChildren();

    if (pedidos.length === 0) {
      historicoPedidos.appendChild(
        criarTexto(
          "p",
          "profile-empty",
          "Seus pedidos finalizados aparecerão aqui.",
        ),
      );
      return;
    }

    pedidos.forEach((pedido) => {
      const cartaoPedido = document.createElement("article");
      cartaoPedido.className = "profile-history-card";

      const dataPedido = new Date(pedido.data);
      const dataFormatada = Number.isNaN(dataPedido.getTime())
        ? "Data não disponível"
        : dataPedido.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
      const cabecalho = document.createElement("div");
      cabecalho.className = "profile-history-header";
      cabecalho.append(
        criarTexto("span", "profile-order-date", dataFormatada),
        criarTexto(
          "strong",
          "profile-order-total",
          formatarMoeda(pedido.total),
        ),
      );
      cartaoPedido.appendChild(cabecalho);

      const produtos = Array.isArray(pedido.produtos) ? pedido.produtos : [];
      const resumo = produtos
        .filter((produto) => produto && typeof produto.nome === "string")
        .map(
          (produto) =>
            `${Number(produto.quantidade) || 0}× ${produto.nome}`,
        );
      cartaoPedido.appendChild(
        criarTexto(
          "p",
          "profile-history-products",
          resumo.join(", ") || "Itens não disponíveis",
        ),
      );

      if (pedido.status) {
        cartaoPedido.appendChild(
          criarTexto("span", "profile-order-status", pedido.status),
        );
      }
      historicoPedidos.appendChild(cartaoPedido);
    });
  }

  // Atualiza a tela com os dados da sessão.
  function atualizarPerfil() {
    const cliente = carregarCliente();
    const conectado = Boolean(cliente);

    conteudoPerfil.hidden = !conectado;
    avisoConvidado.hidden = conectado;
    botaoSair.hidden = !conectado;

    if (!cliente) {
      nomePerfil.textContent = "Visitante";
      mesaPerfil.textContent = "Nenhuma mesa conectada";
      identificadorPerfil.textContent = "";
      return;
    }

    nomePerfil.textContent = cliente.nome;
    mesaPerfil.textContent = cliente.mesa;
    identificadorPerfil.textContent = cliente.identificador
      ? `ID da sessão · ${cliente.identificador}`
      : "Sessão temporária";
    renderizarPedidoAtual();
    renderizarHistorico(cliente);
  }

  // Encerra a sessão sem remover o carrinho.
  botaoSair.addEventListener("click", () => {
    try {
      sessionStorage.removeItem(CHAVE_CLIENTE_PERFIL);
      atualizarPerfil();
    } catch (erro) {
      console.error("Erro ao sair da conta:", erro);
      alert("Não foi possível encerrar a sessão. Tente novamente.");
    }
  });

  atualizarPerfil();
});
