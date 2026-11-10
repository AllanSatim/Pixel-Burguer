// Define chave do armazenamento.
const CHAVE_CARRINHO = "pixelBurguer_pedido";

// Aguarda carregar a página.
document.addEventListener("DOMContentLoaded", () => {
  // Localiza elementos de produtos.
  const produtos = document.querySelectorAll(".product-card");
  // Localiza campo de pesquisa.
  const campoPesquisa = document.querySelector(
    '.top-header .search-bar input[type="search"]',
  );
  // Localiza contador do carrinho.
  const contadorCarrinho = document.querySelector(".badge-count");

  // Lê itens do carrinho.
  function obterCarrinho() {
    // Tenta acessar dados salvos.
    try {
      // Converte JSON em lista.
      const dados = JSON.parse(
        // Retorna lista vazia por padrão.
        localStorage.getItem(CHAVE_CARRINHO) || "[]",
      );

      // Descarta valores que não sejam listas.
      if (!Array.isArray(dados)) return [];

      // Mantém apenas itens válidos.
      return dados.filter((item) => {
        return (
          // Exige item existente.
          item &&
          // Exige nome em texto.
          typeof item.nome === "string" &&
          // Rejeita nome em branco.
          item.nome.trim() !== "" &&
          // Exige preço numérico válido.
          Number.isFinite(Number(item.preco)) &&
          // Rejeita preços negativos.
          Number(item.preco) >= 0 &&
          // Exige quantidade inteira.
          Number.isInteger(Number(item.quantidade)) &&
          // Exige quantidade positiva.
          Number(item.quantidade) >= 1
        );
      });
      // Trata falhas na leitura.
    } catch (erro) {
      // Exibe erro no console.
      console.error("Erro ao ler o carrinho:", erro);
      // Retorna carrinho vazio.
      return [];
    }
  }

  // Atualiza quantidade no ícone.
  function atualizarContadorCarrinho() {
    // Interrompe se contador faltar.
    if (!contadorCarrinho) return;

    // Recupera itens armazenados.
    const carrinho = obterCarrinho();

    // Soma quantidades dos itens.
    const total = carrinho.reduce((soma, item) => {
      // Acrescenta quantidade à soma.
      return soma + Number(item.quantidade);
    }, 0); // Começa somando do zero.

    // Exibe total no contador.
    contadorCarrinho.textContent = total;

    // Procura link do carrinho.
    const botaoCarrinho = contadorCarrinho.closest("a");

    // Atualiza descrição acessível.
    if (botaoCarrinho) {
      botaoCarrinho.setAttribute(
        "aria-label", // Nome para leitores de tela.
        // Ajusta singular ou plural.
        `Carrinho com ${total} ${total === 1 ? "item" : "itens"}`,
      );
    }
  }

  // Configura quantidade dos produtos.
  produtos.forEach((produto) => {
    // Localiza número exibido.
    const quantidade = produto.querySelector(".qty-number");
    // Localiza botões de quantidade.
    const botoes = produto.querySelectorAll(".qty-btn");

    // Ignora cartão incompleto.
    if (!quantidade || botoes.length < 2) return;

    // Configura botão de diminuir.
    botoes[0].addEventListener("click", () => {
      // Lê quantidade atual.
      const atual = Number(quantidade.textContent) || 0;

      // Diminui sem ficar abaixo de um.
      quantidade.textContent = String(Math.max(0, atual - 1));
    });

    // Configura botão de aumentar.
    botoes[1].addEventListener("click", () => {
      // Lê quantidade atual.
      const atual = Number(quantidade.textContent) || 0;

      // Incrementa quantidade em um.
      quantidade.textContent = String(atual + 1);
    });
  });

  // Configura adição ao carrinho.
  produtos.forEach((produto) => {
    // Encontra botão de adicionar.
    const botao = produto.querySelector(".btn-add-product");

    // Ignora produto sem botão.
    if (!botao) return;

    // Escuta clique para adicionar.
    botao.addEventListener("click", () => {
      // Encontra título do produto.
      const nomeElemento = produto.querySelector(".product-title");
      // Encontra preço do produto.
      const precoElemento = produto.querySelector(".product-price");
      // Encontra quantidade selecionada.
      const quantidadeElemento = produto.querySelector(".qty-number");

      // Confere campos obrigatórios.
      if (!nomeElemento || !precoElemento || !quantidadeElemento) {
        // Avisa sobre campos ausentes.
        alert("Não foi possível identificar os dados do produto.");
        // Cancela operação atual.
        return;
      }

      // Remove espaços do nome.
      const nome = nomeElemento.textContent.trim();

      // Prepara preço para cálculo.
      const textoPreco = precoElemento.textContent
        // Remove símbolos monetários e espaços.
        .replace(/[^\d,.-]/g, "")
        // Remove separadores de milhar.
        .replace(/\./g, "")
        // Troca vírgula por ponto.
        .replace(",", ".");

      // Converte preço em número.
      const preco = Number(textoPreco);
      // Converte quantidade em número.
      const quantidade = Number(quantidadeElemento.textContent);

      // Valida valores do produto.
      if (
        !nome || // Exige nome preenchido.
        !Number.isFinite(preco) || // Exige preço numérico válido.
        preco < 0 || // Impede preço negativo.
        !Number.isInteger(quantidade) || // Exige quantidade inteira.
        quantidade < 1 // Impede quantidade zero.
      ) {
        // Avisa sobre dados inválidos.
        alert("Confira o preço e a quantidade do produto.");
        // Impede inclusão incorreta.
        return;
      }

      // Carrega itens já adicionados.
      const carrinho = obterCarrinho();

      // Procura mesmo produto existente.
      const existente = carrinho.find((item) => {
        // Compara nomes dos produtos.
        return item.nome === nome;
      });

      // Atualiza item ou adiciona.
      if (existente) {
        // Soma nova quantidade à existente.
        existente.quantidade = Number(existente.quantidade) + quantidade;
      } else {
        // Insere novo objeto no carrinho.
        carrinho.push({
          nome: nome, // Identifica produto selecionado.
          preco: preco, // Guarda preço unitário.
          quantidade: quantidade, // Guarda unidades escolhidas.
        });
      }

      // Tenta gravar carrinho atualizado.
      try {
        // Salva dados no navegador.
        localStorage.setItem(
          CHAVE_CARRINHO, // Identifica espaço de armazenamento.
          JSON.stringify(carrinho), // Transforma lista em JSON.
        );

        // Confirma inclusão ao usuário.
        alert(`${quantidade}x ${nome} adicionado(s) ao carrinho!`);

        // Reinicia seletor de quantidade.
        quantidadeElemento.textContent = "0";

        // Atualiza total exibido.
        atualizarContadorCarrinho();

        // Trata falhas ao gravar.
      } catch (erro) {
        // Registra detalhes no console.
        console.error("Erro ao salvar o carrinho:", erro);
        // Informa falha ao usuário.
        alert("Não foi possível adicionar o produto ao carrinho.");
      }
    });
  });

  // Configura busca por produtos.
  if (campoPesquisa) {
    // Detecta digitação no campo.
    campoPesquisa.addEventListener("input", () => {
      // Padroniza texto pesquisado.
      const pesquisa = campoPesquisa.value
        // Remove espaços das extremidades.
        .trim()
        // Ignora diferenças de maiúsculas.
        .toLocaleLowerCase("pt-BR");

      // Examina todos os produtos.
      produtos.forEach((produto) => {
        // Lê nome, se existir.
        const nome = produto.querySelector(".product-title")?.textContent || "";
        // Lê descrição, se existir.
        const descricao =
          produto.querySelector(".product-desc")?.textContent || "";

        // Junta nome e descrição.
        const texto = `${nome} ${descricao}`
          // Padroniza letras para comparação.
          .toLocaleLowerCase("pt-BR");

        // Mostra produtos que correspondem.
        produto.style.display = texto.includes(pesquisa)
          ? "" // Mantém estilo padrão.
          : "none"; // Oculta produto sem correspondência.
      });
    });
  }

  // Exibe contagem inicial.
  atualizarContadorCarrinho();
}); // Encerra carregamento da página.
