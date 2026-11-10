// Aguarda carregamento completo do HTML.
document.addEventListener("DOMContentLoaded", () => {
  // Localiza link para cardápio.
  const botaoCardapio = document.querySelector(
    // Seleciona link da seção Sobre.
    ".sobre-cta-card a[href='cardapio.html']",
  );

  // Seleciona todos os diferenciais.
  const cardsDiferenciais = document.querySelectorAll(".pillar-card");
  // Seleciona cards da história.
  const cardsSobre = document.querySelectorAll(".sobre-card");

  // Percorre cards de diferenciais.
  cardsDiferenciais.forEach((card) => {
    // Mostra cursor de clique.
    card.style.cursor = "pointer";
    // Permite foco pelo teclado.
    card.setAttribute("tabindex", "0");
    // Informa função de botão.
    card.setAttribute("role", "button");
    // Indica estado inicial desmarcado.
    card.setAttribute("aria-pressed", "false");

    // Define alternância do destaque.
    function alternarDestaque() {
      // Alterna classe visual selecionada.
      const selecionado = card.classList.toggle("diferencial-selecionado");

      // Atualiza estado para acessibilidade.
      card.setAttribute("aria-pressed", String(selecionado));
    }

    // Responde ao clique recebido.
    card.addEventListener("click", alternarDestaque);

    // Permite ativação pelo teclado.
    card.addEventListener("keydown", (evento) => {
      // Aceita Enter ou espaço.
      if (evento.key === "Enter" || evento.key === " ") {
        // Evita comportamento padrão da tecla.
        evento.preventDefault();
        // Altera destaque do card.
        alternarDestaque();
      }
    });
  });

  // Percorre cards da história.
  cardsSobre.forEach((card) => {
    // Localiza parágrafos desse card.
    const paragrafos = card.querySelectorAll("p");

    // Ignora cards com poucos parágrafos.
    if (paragrafos.length < 2) {
      // Encerra processamento deste card.
      return;
    }

    // Seleciona o segundo parágrafo.
    const segundoParagrafo = paragrafos[1];

    // Oculta texto inicialmente expandível.
    segundoParagrafo.hidden = true;

    // Cria botão de expansão.
    const botao = document.createElement("button");

    // Evita envio de formulários.
    botao.type = "button";
    // Define texto inicial do botão.
    botao.textContent = "Ler mais";
    // Aplica classes visuais existentes.
    botao.className = "btn btn-primary";
    // Adiciona espaçamento acima do botão.
    botao.style.marginTop = "10px";
    // Indica conteúdo inicialmente recolhido.
    botao.setAttribute("aria-expanded", "false");

    // Insere botão após parágrafo.
    segundoParagrafo.insertAdjacentElement("afterend", botao);

    // Alterna texto ao clicar.
    botao.addEventListener("click", () => {
      // Verifica se texto está visível.
      const expandido = !segundoParagrafo.hidden;

      // Inverte visibilidade do parágrafo.
      segundoParagrafo.hidden = expandido;
      // Atualiza mensagem do botão.
      botao.textContent = expandido ? "Ler mais" : "Ler menos";
      // Informa novo estado expandido.
      botao.setAttribute("aria-expanded", String(!expandido));
    });
  });

  // Confere existência do link.
  if (botaoCardapio) {
    // Registra clique no cardápio.
    botaoCardapio.addEventListener("click", () => {
      // Exibe informação no console.
      console.log("O usuário escolheu acessar o cardápio.");
    });
  }

  // Confirma inicialização no console.
  console.log("Página Sobre carregada com sucesso.");
});
