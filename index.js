// Responsividade navbar
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

const radarCanvas = document.getElementById("radarChart").getContext("2d");
let radarChart;

// Carregar automaticamente o arquivo Excel
document.addEventListener("DOMContentLoaded", function () {
  fetchDataFromExcel();
});

function fetchDataFromExcel() {
  // Carrega o arquivo Excel localizado na pasta 'data'
  fetch("data/dados.xlsx")
    .then((response) => response.arrayBuffer()) 
    .then((data) => {
      const workbook = XLSX.read(data, { type: "array" });

      // Lê a primeira aba do Excel
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Converte a aba em JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      console.log("Dados importados do Excel:", jsonData);

      processarDados(jsonData); // Processa os dados
    })
    .catch((error) => {
      console.error("Erro ao carregar o arquivo Excel:", error);
    });
}

function processarDados(data) {
  // Remove espaços extras nos cabeçalhos
  const sanitizedData = data.map((row) => {
    let sanitizedRow = {};
    for (const key in row) {
      const sanitizedKey = key.trim(); // Remove espaços extras nos cabeçalhos
      sanitizedRow[sanitizedKey] = row[key];
    }
    return sanitizedRow;
  });

  // Filtra os dados para garantir que as frequências são números válidos
  const frequencias = sanitizedData
    .map((row) => {
      const freq = parseFloat(row["Frequencia (%)"]);

      // Verifica se o valor é um número válido
      if (isNaN(freq)) {
        console.log("Valor inválido na Frequência:", row["Frequencia (%)"]); // Log para identificar valores inválidos
        return null; // Se não for número válido, retorna null
      }

      return freq; // Retorna a frequência válida
    })
    .filter((freq) => freq !== null); // Remove valores null

  console.log("Frequências válidas:", frequencias); // Log para verificar os valores válidos

  // Verifica se temos dados suficientes para calcular
  if (frequencias.length === 0) {
    alert("Não há dados válidos de frequência para processar.");
    return;
  }

  // Coleta os nomes das turmas
  const turmas = sanitizedData.map((row) => row["Turma(Fundamental)"]);

  // Calcula estatísticas
  const media = calcularMedia(frequencias);
  const mediana = calcularMediana(frequencias);
  const desvioPadrao = calcularDesvioPadrao(frequencias, media);

  exibirEstatisticas(media, mediana, desvioPadrao);

  // Gera o gráfico de radar
  gerarGraficoRadar(turmas, frequencias);
}

function calcularMedia(arr) {
  const soma = arr.reduce((a, b) => a + b, 0);
  return soma / arr.length;
}

function calcularMediana(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcularDesvioPadrao(arr, media) {
  const somaQuadrados = arr
    .map((x) => Math.pow(x - media, 2))
    .reduce((a, b) => a + b, 0);
  return Math.sqrt(somaQuadrados / arr.length);
}

function exibirEstatisticas(media, mediana, desvioPadrao) {
  if (
    media !== undefined &&
    mediana !== undefined &&
    desvioPadrao !== undefined
  ) {
    document.getElementById("resultadoEstatistico").innerHTML = `
            <p class="graficoP"><strong>Média de Frequência:</strong> ${media.toFixed(2)}</p>
            <p class="graficoP"><strong>Mediana:</strong> ${mediana.toFixed(2)}</p>
            <p class="graficoP"><strong>Desvio Padrão:</strong> ${desvioPadrao.toFixed(2)}</p>
        `;
  } else {
    document.getElementById("resultadoEstatistico").innerHTML =
      "<p>Erro ao calcular as estatísticas. Verifique os dados.</p>";
  }
}

function gerarGraficoRadar(labels, data) {
  if (radarChart) radarChart.destroy();

  radarChart = new Chart(radarCanvas, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Frequência (%)",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
    },
  });
}
