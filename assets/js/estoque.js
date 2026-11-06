
const CHAVE_ESTOQUE = "pixelBurguer_estoque";

document.addEventListener("DOMContentLoaded", () => {
    const produtos = document.querySelectorAll(".stock-product-row");
    const resumos = document.querySelectorAll(".stock-summary-card strong");

    // Carrega os dados salvos no navegador
    function carregarEstoque() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_ESTOQUE) || "{}"
            );

            if (
                dados &&
                typeof dados === "object" &&
                !Array.isArray(dados)
            ) {
                return dados;
            }

            return {};
        } catch (erro) {
            console.error("Erro ao carregar estoque:", erro);
            return {};
        }
    }

    let estoque = carregarEstoque();

    // Salva as alterações no navegador
    function salvarEstoque() {
        try {
            localStorage.setItem(
                CHAVE_ESTOQUE,
                JSON.stringify(estoque)
            );

            return true;
        } catch (erro) {
            console.error("Erro ao salvar estoque:", erro);
            alert("Não foi possível salvar as alterações do estoque.");
            return false;
        }
    }

    // Atualiza a aparência do produto
    function atualizarProduto(linha, disponivel) {
        const status = linha.querySelector(".stock-current-status");
        const botoes = linha.querySelectorAll(".stock-action");

        if (!status || botoes.length < 2) {
            return;
        }

        if (disponivel) {
            status.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Disponível';
        } else {
            status.innerHTML =
                '<i class="fa-solid fa-circle-xmark"></i> Esgotado';
        }

        botoes.forEach((botao, indice) => {
            const selecionado =
                (indice === 0 && disponivel) ||
                (indice === 1 && !disponivel);

            botao.classList.toggle("is-selected", selecionado);
            botao.setAttribute("aria-pressed", String(selecionado));
        });
    }

    // Atualiza os números do resumo
    function atualizarResumo() {
        let disponiveis = 0;
        let esgotados = 0;

        produtos.forEach((linha) => {
            const nome = linha.querySelector(".stock-product-name");

            if (!nome) {
                return;
            }

            const nomeProduto = nome.textContent.trim();

            if (estoque[nomeProduto] === false) {
                esgotados++;
            } else {
                disponiveis++;
            }
        });

        if (resumos[0]) {
            resumos[0].textContent = produtos.length;
        }

        if (resumos[1]) {
            resumos[1].textContent = disponiveis;
        }

        if (resumos[2]) {
            resumos[2].textContent = esgotados;
        }
    }

    // Inicializa os produtos com os estados do HTML ou do armazenamento
    produtos.forEach((linha) => {
        const nome = linha.querySelector(".stock-product-name");

        if (!nome) {
            return;
        }

        const nomeProduto = nome.textContent.trim();

        if (typeof estoque[nomeProduto] !== "boolean") {
            const botaoDisponivel = linha.querySelector(
                '.stock-action[aria-pressed="true"]'
            );

            estoque[nomeProduto] = Boolean(botaoDisponivel);
        }

        atualizarProduto(linha, estoque[nomeProduto]);
    });

    atualizarResumo();
    salvarEstoque();

    // Configura os botões Disponível e Esgotado
    produtos.forEach((linha) => {
        const botoes = linha.querySelectorAll(".stock-action");

        botoes.forEach((botao, indice) => {
            botao.addEventListener("click", () => {
                const nome = linha.querySelector(".stock-product-name");

                if (!nome) {
                    return;
                }

                const nomeProduto = nome.textContent.trim();
                const disponivel = indice === 0;

                estoque[nomeProduto] = disponivel;

                atualizarProduto(linha, disponivel);
                atualizarResumo();
                salvarEstoque();
            });
        });
    });
});
