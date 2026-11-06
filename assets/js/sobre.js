
document.addEventListener("DOMContentLoaded", () => {
    // Identifica os elementos principais da página Sobre.
    const botaoCardapio = document.querySelector(
        ".sobre-cta-card a[href='cardapio.html']"
    );

    const cardsDiferenciais = document.querySelectorAll(".pillar-card");
    const cardsSobre = document.querySelectorAll(".sobre-card");

    // Destaca um diferencial quando o usuário clica nele.
    cardsDiferenciais.forEach((card) => {
        card.style.cursor = "pointer";
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-pressed", "false");

        function alternarDestaque() {
            const selecionado = card.classList.toggle("diferencial-selecionado");

            card.setAttribute("aria-pressed", String(selecionado));
        }

        card.addEventListener("click", alternarDestaque);

        // Permite usar os diferenciais pelo teclado.
        card.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                alternarDestaque();
            }
        });
    });

    // Permite expandir ou recolher os textos dos cards da história.
    cardsSobre.forEach((card) => {
        const paragrafos = card.querySelectorAll("p");

        if (paragrafos.length < 2) {
            return;
        }

        const segundoParagrafo = paragrafos[1];

        segundoParagrafo.hidden = true;

        const botao = document.createElement("button");

        botao.type = "button";
        botao.textContent = "Ler mais";
        botao.className = "btn btn-primary";
        botao.style.marginTop = "10px";
        botao.setAttribute("aria-expanded", "false");

        segundoParagrafo.insertAdjacentElement("afterend", botao);

        botao.addEventListener("click", () => {
            const expandido = !segundoParagrafo.hidden;

            segundoParagrafo.hidden = expandido;
            botao.textContent = expandido ? "Ler mais" : "Ler menos";
            botao.setAttribute("aria-expanded", String(!expandido));
        });
    });

    // Confirma a navegação para o cardápio.
    if (botaoCardapio) {
        botaoCardapio.addEventListener("click", () => {
            console.log("O usuário escolheu acessar o cardápio.");
        });
    }

    console.log("Página Sobre carregada com sucesso.");
});
