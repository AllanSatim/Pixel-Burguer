// Define chave do armazenamento.
const CHAVE_ESTOQUE = "pixelBurguer_estoque";

// Aguarda carregamento da página.
document.addEventListener("DOMContentLoaded", () => {
  // Seleciona linhas dos produtos.
  const produtos = document.querySelectorAll(".stock-product-row");
  // Seleciona números do resumo.
  const resumos = document.querySelectorAll(".stock-summary-card strong");

  // Recupera estoque salvo localmente.
  function carregarEstoque() {
    // Tenta recuperar informações armazenadas.
    try {
      // Converte JSON em objeto.
      const dados = JSON.parse(
        // Busca estoque no navegador.
        localStorage.getItem(CHAVE_ESTOQUE) || "{}",
      );

      // Confirma objeto não nulo.
      if (
        dados &&
        // Verifica tipo dos dados.
        typeof dados === "object" &&
        // Impede receber uma lista.
        !Array.isArray(dados)
      ) {
        // Devolve estoque recuperado.
        return dados;
      }

      // Retorna objeto vazio.
      return {};
    } catch (erro) {
      // Exibe erro no console.
      console.error("Erro ao carregar estoque:", erro);
      // Usa estoque vazio.
      return {};
    }
  }

  // Guarda estoque em memória.
  let estoque = carregarEstoque();

  // Persiste alterações no navegador.
  function salvarEstoque() {
    // Tenta salvar os dados.
    try {
      // Grava estoque no localStorage.
      localStorage.setItem(
        // Identifica chave de armazenamento.
        CHAVE_ESTOQUE,
        // Converte objeto em JSON.
        JSON.stringify(estoque),
      );

      // Indica salvamento bem-sucedido.
      return true;
    } catch (erro) {
      // Registra falha no console.
      console.error("Erro ao salvar estoque:", erro);
      // Avisa falha ao usuário.
      alert("Não foi possível salvar as alterações do estoque.");
      // Indica falha no salvamento.
      return false;
    }
  }

  // Atualiza aparência do produto.
  function atualizarProduto(linha, disponivel) {
    // Localiza indicador de status.
    const status = linha.querySelector(".stock-current-status");
    // Encontra botões da linha.
    const botoes = linha.querySelectorAll(".stock-action");

    // Verifica elementos obrigatórios existentes.
    if (!status || botoes.length < 2) {
      // Interrompe atualização incompleta.
      return;
    }

    // Verifica disponibilidade do produto.
    if (disponivel) {
      // Exibe ícone de disponível.
      status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Disponível';
    } else {
      // Exibe ícone de esgotado.
      status.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Esgotado';
    }

    // Percorre botões de status.
    botoes.forEach((botao, indice) => {
      // Identifica opção atualmente selecionada.
      const selecionado =
        // Primeiro botão representa disponível.
        (indice === 0 && disponivel) ||
        // Segundo botão representa esgotado.
        (indice === 1 && !disponivel);

      // Altera destaque visual do botão.
      botao.classList.toggle("is-selected", selecionado);
      // Atualiza atributo de acessibilidade.
      botao.setAttribute("aria-pressed", String(selecionado));
    });
  }

  // Recalcula indicadores do estoque.
  function atualizarResumo() {
    // Inicia contador de disponíveis.
    let disponiveis = 0;
    // Inicia contador de esgotados.
    let esgotados = 0;

    // Percorre todos os produtos.
    produtos.forEach((linha) => {
      // Busca nome do produto.
      const nome = linha.querySelector(".stock-product-name");

      // Ignora produto sem nome.
      if (!nome) {
        // Passa ao próximo produto.
        return;
      }

      // Extrai nome sem espaços.
      const nomeProduto = nome.textContent.trim();

      // Confere indisponibilidade explicitamente marcada.
      if (estoque[nomeProduto] === false) {
        // Soma um produto esgotado.
        esgotados++;
      } else {
        // Soma um produto disponível.
        disponiveis++;
      }
    });

    // Confere indicador total existente.
    if (resumos[0]) {
      // Mostra quantidade de produtos.
      resumos[0].textContent = produtos.length;
    }

    // Confere indicador disponível existente.
    if (resumos[1]) {
      // Mostra produtos disponíveis atualmente.
      resumos[1].textContent = disponiveis;
    }

    // Confere indicador esgotado existente.
    if (resumos[2]) {
      // Mostra produtos esgotados atualmente.
      resumos[2].textContent = esgotados;
    }
  }

  // Inicializa cada produto listado.
  produtos.forEach((linha) => {
    // Localiza nome do produto.
    const nome = linha.querySelector(".stock-product-name");

    // Ignora linhas sem nome.
    if (!nome) {
      // Encerra esta iteração.
      return;
    }

    // Obtém nome do produto.
    const nomeProduto = nome.textContent.trim();

    // Verifica ausência de status salvo.
    if (typeof estoque[nomeProduto] !== "boolean") {
      // Busca botão inicialmente pressionado.
      const botaoDisponivel = linha.querySelector(
        '.stock-action[aria-pressed="true"]',
      );

      // Define disponibilidade pelo HTML.
      estoque[nomeProduto] = Boolean(botaoDisponivel);
    }

    // Atualiza aparência conforme estoque.
    atualizarProduto(linha, estoque[nomeProduto]);
  });

  // Atualiza totais iniciais exibidos.
  atualizarResumo();
  // Salva situação inicial recuperada.
  salvarEstoque();

  // Configura eventos dos produtos.
  produtos.forEach((linha) => {
    // Seleciona botões desta linha.
    const botoes = linha.querySelectorAll(".stock-action");

    // Percorre botões de disponibilidade.
    botoes.forEach((botao, indice) => {
      // Escuta clique no botão.
      botao.addEventListener("click", () => {
        // Obtém elemento do nome.
        const nome = linha.querySelector(".stock-product-name");

        // Ignora produto sem nome.
        if (!nome) {
          // Interrompe ação do clique.
          return;
        }

        // Extrai nome do produto.
        const nomeProduto = nome.textContent.trim();
        // Primeiro botão indica disponível.
        const disponivel = indice === 0;

        // Atualiza estado em memória.
        estoque[nomeProduto] = disponivel;

        // Atualiza visual do produto.
        atualizarProduto(linha, disponivel);
        // Recalcula contadores do painel.
        atualizarResumo();
        // Persiste alteração no navegador.
        salvarEstoque();
      });
    });
  });
});
