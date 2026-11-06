
const CHAVE_CARRINHO = "pixelBurguer_pedido";

document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTOS DA PÁGINA
    const produtos = document.querySelectorAll(".product-card");
    const campoPesquisa = document.querySelector(
        '.top-header .search-bar input[type="search"]'
    );
    const contadorCarrinho = document.querySelector(".badge-count");

    // LÊ O CARRINHO
    function obterCarrinho() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_CARRINHO) || "[]"
            );

            if (!Array.isArray(dados)) return [];

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

    // ATUALIZA O CONTADOR DO CARRINHO
    function atualizarContadorCarrinho() {
        if (!contadorCarrinho) return;

        const carrinho = obterCarrinho();

        const total = carrinho.reduce((soma, item) => {
            return soma + Number(item.quantidade);
        }, 0);

        contadorCarrinho.textContent = total;

        const botaoCarrinho = contadorCarrinho.closest("a");

        if (botaoCarrinho) {
            botaoCarrinho.setAttribute(
                "aria-label",
                `Carrinho com ${total} ${total === 1 ? "item" : "itens"}`
            );
        }
    }

    // CONTROLE DE QUANTIDADE
    produtos.forEach((produto) => {
        const quantidade = produto.querySelector(".qty-number");
        const botoes = produto.querySelectorAll(".qty-btn");

        if (!quantidade || botoes.length < 2) return;

        botoes[0].addEventListener("click", () => {
            const atual = Number(quantidade.textContent) || 1;

            quantidade.textContent = String(
                Math.max(1, atual - 1)
            );
        });

        botoes[1].addEventListener("click", () => {
            const atual = Number(quantidade.textContent) || 1;

            quantidade.textContent = String(atual + 1);
        });
    });

    // ADICIONAR PRODUTOS AO CARRINHO
    produtos.forEach((produto) => {
        const botao = produto.querySelector(".btn-add-product");

        if (!botao) return;

        botao.addEventListener("click", () => {
            const nomeElemento = produto.querySelector(".product-title");
            const precoElemento = produto.querySelector(".product-price");
            const quantidadeElemento = produto.querySelector(".qty-number");

            if (!nomeElemento || !precoElemento || !quantidadeElemento) {
                alert("Não foi possível identificar os dados do produto.");
                return;
            }

            const nome = nomeElemento.textContent.trim();

            const textoPreco = precoElemento.textContent
                .replace(/[^\d,.-]/g, "")
                .replace(/\./g, "")
                .replace(",", ".");

            const preco = Number(textoPreco);
            const quantidade = Number(quantidadeElemento.textContent);

            if (
                !nome ||
                !Number.isFinite(preco) ||
                preco < 0 ||
                !Number.isInteger(quantidade) ||
                quantidade < 1
            ) {
                alert("Confira o preço e a quantidade do produto.");
                return;
            }

            const carrinho = obterCarrinho();

            const existente = carrinho.find((item) => {
                return item.nome === nome;
            });

            if (existente) {
                existente.quantidade =
                    Number(existente.quantidade) + quantidade;
            } else {
                carrinho.push({
                    nome: nome,
                    preco: preco,
                    quantidade: quantidade
                });
            }

            try {
                localStorage.setItem(
                    CHAVE_CARRINHO,
                    JSON.stringify(carrinho)
                );

                alert(`${quantidade}x ${nome} adicionado(s) ao carrinho!`);

                quantidadeElemento.textContent = "1";

                atualizarContadorCarrinho();

            } catch (erro) {
                console.error("Erro ao salvar o carrinho:", erro);
                alert("Não foi possível adicionar o produto ao carrinho.");
            }
        });
    });

    // PESQUISA DOS PRODUTOS
    if (campoPesquisa) {
        campoPesquisa.addEventListener("input", () => {
            const pesquisa = campoPesquisa.value
                .trim()
                .toLocaleLowerCase("pt-BR");

            produtos.forEach((produto) => {
                const nome = produto.querySelector(".product-title")?.textContent || "";
                const descricao = produto.querySelector(".product-desc")?.textContent || "";

                const texto = `${nome} ${descricao}`
                    .toLocaleLowerCase("pt-BR");

                produto.style.display = texto.includes(pesquisa)
                    ? ""
                    : "none";
            });
        });
    }

    // ATUALIZA O CONTADOR AO ABRIR A PÁGINA
    atualizarContadorCarrinho();

});
