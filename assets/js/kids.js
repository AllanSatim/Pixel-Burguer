
const CHAVE_CARRINHO = "pixelBurguer_pedido";

// Controla os botões de quantidade dos produtos
document.querySelectorAll(".kids-product .qty-selector").forEach((selector) => {
    const quantidade = selector.querySelector(".qty-number");
    const botoes = selector.querySelectorAll(".qty-btn");

    if (!quantidade || botoes.length < 2) return;

    botoes[0].addEventListener("click", () => {
      if (botao.disabled) return;

      botao.disabled = true;
        const atual = Number(quantidade.textContent) || 1;
        quantidade.textContent = String(Math.max(1, atual - 1));
    });

    botoes[1].addEventListener("click", () => {
        const atual = Number(quantidade.textContent) || 1;
        quantidade.textContent = String(atual + 1);
    });
});

function obterCarrinhoKids() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_CARRINHO) || "[]"
        );

        if (!Array.isArray(dados)) {
            return [];
        }

        // Mantém apenas os itens com dados válidos
        return dados.filter((item) => {
            return (
                item &&
                typeof item.nome === "string" &&
                item.nome.trim() !== "" &&
                Number.isFinite(Number(item.preco)) &&
                Number(item.preco) >= 0 &&
                Number.isInteger(Number(item.quantidade)) &&
                Number(item.quantidade) >= 1
            );
        });
    } catch (erro) {
        console.error("Erro ao ler o carrinho:", erro);
        return [];
    }
}

// Adiciona os produtos da Área Kids ao carrinho
document.querySelectorAll(".kids-product .btn-add-product").forEach((botao) => {
    botao.addEventListener("click", () => {
        const produto = botao.closest(".kids-product");

        if (!produto) return;

        const nomeElemento = produto.querySelector("h3");
        const precoElemento = produto.querySelector(".product-price");
        const quantidadeElemento = produto.querySelector(".qty-number");

        if (!nomeElemento || !precoElemento || !quantidadeElemento) {
            alert("Não foi possível identificar os dados deste produto.");
            return;
        }

        const nome = nomeElemento.textContent.trim();

        const textoPreco = precoElemento.textContent
            .replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

        const preco = Number(textoPreco);
        const quantidade = Math.floor(Number(quantidadeElemento.textContent));

        if (!nome || !Number.isFinite(preco) || preco < 0 ||
            !Number.isInteger(quantidade) || quantidade < 1) {
            alert("Confira o preço e a quantidade do produto.");
            return;
        }

        const carrinho = obterCarrinhoKids();

        // Se o produto já estiver no carrinho, aumenta a quantidade
        const existente = carrinho.find((item) => item.nome === nome);

        if (existente) {
            existente.quantidade = (Number(existente.quantidade) || 0) + quantidade;
        } else {
            carrinho.push({
                nome: nome,
                preco: preco,
                quantidade: quantidade
            });
        }

        try {
            localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));

            alert(`${quantidade}x ${nome} adicionado(s) ao carrinho!`);

            // Volta a quantidade exibida para 1
            alert(`${quantidade}x ${nome} adicionado(s) ao carrinho!`);
botao.disabled = false;
// Volta a quantidade exibida para 1
quantidadeElemento.textContent = "1";

botao.disabled = false;
        } catch (erro) {
            console.error("Erro ao salvar o carrinho:", erro);
            alert("Não foi possível salvar o produto. Tente novamente.");
        }
    });
});

/* PESQUISA DOS PRODUTOS DA ÁREA KIDS */

const campoPesquisaKids = document.querySelector(
    '.top-header .search-bar input[type="search"]'
);

if (campoPesquisaKids) {
    campoPesquisaKids.addEventListener("input", () => {
        const pesquisa = campoPesquisaKids.value
            .trim()
            .toLocaleLowerCase("pt-BR");

        const produtosKids = document.querySelectorAll(".kids-product");

        produtosKids.forEach((produto) => {
            const nome = produto.querySelector("h3")?.textContent || "";
            const descricao = produto.querySelector("p")?.textContent || "";
            const categoria =
                produto.querySelector(".kids-product-category")?.textContent || "";

            const textoProduto =
                `${nome} ${descricao} ${categoria}`.toLocaleLowerCase("pt-BR");

            produto.style.display = textoProduto.includes(pesquisa)
                ? ""
                : "none";
        });

        // Atualiza o título das seções conforme a pesquisa
        document.querySelectorAll(".kids-catalog").forEach((secao) => {
            const produtosVisiveis = secao.querySelectorAll(
                ".kids-product:not([style*='display: none'])"
            );

            const contador = secao.querySelector(".kids-heading > p");

            if (contador) {
                const total = produtosVisiveis.length;
                contador.textContent = pesquisa
                    ? `${total} ${total === 1 ? "produto encontrado" : "produtos encontrados"}`
                    : (secao.id === "kids-produtos" ? "8 lanches" : "8 sobremesas");
            }
        });
    });
}

