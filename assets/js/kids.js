// Define a chave de armazenamento.
const CHAVE_CARRINHO = "pixelBurguer_pedido";

// Percorre seletores de quantidade.
document.querySelectorAll(".kids-product .qty-selector").forEach((selector) => {
  // Localiza número exibido.
  const quantidade = selector.querySelector(".qty-number");
  // Localiza botões de ajuste.
  const botoes = selector.querySelectorAll(".qty-btn");

  // Ignora controles incompletos.
  if (!quantidade || botoes.length < 2) return;

  // Configura botão de diminuir.
  botoes[0].addEventListener("click", () => {
    // Lê quantidade atual.
    const atual = Number(quantidade.textContent) || 0;
    // Diminui, mantendo mínimo um.
    quantidade.textContent = String(Math.max(0, atual - 1));
  });

  // Configura botão de aumentar.
  botoes[1].addEventListener("click", () => {
    // Lê quantidade atual.
    const atual = Number(quantidade.textContent) || 0;
    // Acrescenta uma unidade.
    quantidade.textContent = String(atual + 1);
  });
});

// Recupera carrinho do navegador.
function obterCarrinhoKids() {
  // Trata falhas de leitura.
  try {
    // Lê texto e converte JSON.
    const dados = JSON.parse(
      // Usa lista vazia inicialmente.
      localStorage.getItem(CHAVE_CARRINHO) || "[]",
    );

    // Rejeita dados não listados.
    if (!Array.isArray(dados)) {
      // Retorna lista vazia.
      return [];
    }

    // Mantém apenas itens válidos.
    return dados.filter((item) => {
      // Confere campos obrigatórios.
      return (
        // Exige item existente.
        item &&
        // Exige nome em texto.
        typeof item.nome === "string" &&
        // Rejeita nomes vazios.
        item.nome.trim() !== "" &&
        // Exige preço numérico finito.
        Number.isFinite(Number(item.preco)) &&
        // Rejeita preço negativo.
        Number(item.preco) >= 0 &&
        // Exige quantidade inteira.
        Number.isInteger(Number(item.quantidade)) &&
        // Exige quantidade positiva.
        Number(item.quantidade) >= 1
      );
    });
  } catch (erro) {
    // Registra falha no console.
    console.error("Erro ao ler o carrinho:", erro);
    // Retorna carrinho vazio.
    return [];
  }
}

// Percorre botões de adicionar.
document.querySelectorAll(".kids-product .btn-add-product").forEach((botao) => {
  // Reage ao clique do usuário.
  botao.addEventListener("click", () => {
    // Localiza cartão do produto.
    const produto = botao.closest(".kids-product");

    // Ignora produto inexistente.
    if (!produto) return;

    // Localiza nome do produto.
    const nomeElemento = produto.querySelector("h3");
    // Localiza preço do produto.
    const precoElemento = produto.querySelector(".product-price");
    // Localiza quantidade selecionada.
    const quantidadeElemento = produto.querySelector(".qty-number");

    // Verifica elementos necessários.
    if (!nomeElemento || !precoElemento || !quantidadeElemento) {
      // Avisa sobre dados ausentes.
      alert("Não foi possível identificar os dados deste produto.");
      // Interrompe inclusão no carrinho.
      return;
    }

    // Obtém nome sem espaços.
    const nome = nomeElemento.textContent.trim();

    // Prepara preço para conversão.
    const textoPreco = precoElemento.textContent
      // Remove símbolos não numéricos.
      .replace(/[^\d,.-]/g, "")
      // Remove separadores de milhar.
      .replace(/\./g, "")
      // Troca vírgula por ponto.
      .replace(",", ".");

    // Converte preço para número.
    const preco = Number(textoPreco);
    // Converte quantidade para inteiro.
    const quantidade = Math.floor(Number(quantidadeElemento.textContent));

    // Confere valores do produto.
    if (
      !nome ||
      !Number.isFinite(preco) ||
      preco < 0 ||
      !Number.isInteger(quantidade) ||
      quantidade < 1
    ) {
      // Solicita correção dos dados.
      alert("Confira o preço e a quantidade do produto.");
      // Impede inclusão inválida.
      return;
    }

    // Carrega os itens existentes.
    const carrinho = obterCarrinhoKids();

    // Procura produto pelo nome.
    const existente = carrinho.find((item) => item.nome === nome);

    // Verifica produto já incluído.
    if (existente) {
      // Soma as quantidades selecionadas.
      existente.quantidade = (Number(existente.quantidade) || 0) + quantidade;
    } else {
      // Adiciona um novo item.
      carrinho.push({
        // Guarda nome do produto.
        nome: nome,
        // Guarda preço do produto.
        preco: preco,
        // Guarda quantidade escolhida.
        quantidade: quantidade,
      });
    }

    // Trata erros ao salvar.
    try {
      // Salva carrinho como JSON.
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));

      // Confirma inclusão uma vez.
      alert(`${quantidade}x ${nome} adicionado(s) ao carrinho!`);

      // Reinicia quantidade selecionada.
      quantidadeElemento.textContent = "0";
    } catch (erro) {
      // Registra erro no console.
      console.error("Erro ao salvar o carrinho:", erro);
      // Informa falha ao usuário.
      alert("Não foi possível salvar o produto. Tente novamente.");
    }
  });
});

// PESQUISA DOS PRODUTOS DA ÁREA KIDS

// Localiza campo de pesquisa.
const campoPesquisaKids = document.querySelector(
  '.top-header .search-bar input[type="search"]',
);

// Verifica existência do campo.
if (campoPesquisaKids) {
  // Reage ao texto digitado.
  campoPesquisaKids.addEventListener("input", () => {
    // Normaliza expressão pesquisada.
    const pesquisa = campoPesquisaKids.value
      // Remove espaços excedentes.
      .trim()
      // Ignora letras maiúsculas.
      .toLocaleLowerCase("pt-BR");

    // Localiza produtos da seção.
    const produtosKids = document.querySelectorAll(".kids-product");

    // Examina cada produto listado.
    produtosKids.forEach((produto) => {
      // Obtém nome ou vazio.
      const nome = produto.querySelector("h3")?.textContent || "";
      // Obtém descrição ou vazio.
      const descricao = produto.querySelector("p")?.textContent || "";
      // Obtém categoria ou vazio.
      const categoria =
        produto.querySelector(".kids-product-category")?.textContent || "";

      // Reúne informações pesquisáveis.
      const textoProduto =
        `${nome} ${descricao} ${categoria}`.toLocaleLowerCase("pt-BR");

      // Exibe apenas resultados correspondentes.
      produto.style.display = textoProduto.includes(pesquisa)
        ? "" // Mantém produto visível.
        : "none"; // Esconde produto divergente.
    });

    // Atualiza contagem por seção.
    document.querySelectorAll(".kids-catalog").forEach((secao) => {
      // Seleciona produtos ainda visíveis.
      const produtosVisiveis = secao.querySelectorAll(
        '.kids-product:not([style*="display: none"])',
      );

      // Localiza texto do contador.
      const contador = secao.querySelector(".kids-heading > p");

      // Confere existência do contador.
      if (contador) {
        // Conta produtos visíveis.
        const total = produtosVisiveis.length;
        // Mostra resultados ou padrão.
        contador.textContent = pesquisa
          ? // Usa singular ou plural.
            `${total} ${total === 1 ? "produto encontrado" : "produtos encontrados"}`
          : // Restaura rótulo original fixo.
            secao.id === "kids-produtos"
            ? "8 lanches"
            : "8 sobremesas";
      }
    });
  });
}
