// Importa o Chart.js e o plugin de Boxplot
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@3.7.0";
import { BoxPlotController, BoxPlot } from "https://cdn.jsdelivr.net/npm/chartjs-chart-box-and-violin-plot";

// Registrar o plugin no Chart.js
Chart.register(BoxPlotController, BoxPlot);

if (typeof Chart === "undefined") {
    console.error("Chart.js não foi carregado corretamente.");
} else {
    // Registrar o plugin Boxplot no Chart.js
    if (typeof window["chartjs-chart-box-and-violin-plot"] !== "undefined") {
        Chart.register(window["chartjs-chart-box-and-violin-plot"].BoxAndWhiskerController);
    } else {
        console.error("Plugin Boxplot não carregado corretamente.");
    }
}

// Carregar o arquivo Excel usando SheetJS
async function carregarArquivoExcel(evento) {
    const arquivo = evento.target.files[0];
    const leitor = new FileReader();

    leitor.onload = async (e) => {
        const dados = new Uint8Array(e.target.result);
        const workbook = XLSX.read(dados, { type: "array" });
        const planilha = workbook.Sheets[workbook.SheetNames[0]]; // Lê a primeira planilha
        const json = XLSX.utils.sheet_to_json(planilha); // Converte a planilha para JSON

        processarDados(json);
    };

    leitor.readAsArrayBuffer(arquivo);
}

// Processamento de dados para cálculos estatísticos
function processarDados(dados) {
    // Ajuste para acessar a coluna de frequência corretamente
    const frequencias = dados.map(aluno => Number(aluno["Frequência (%)"])).filter(f => !isNaN(f));

    // Calcular média, mediana e desvio padrão
    const media = calcularMedia(frequencias);
    const mediana = calcularMediana(frequencias);
    const desvioPadrao = calcularDesvioPadrao(frequencias);

    // Atualizar interface com os resultados
    exibirResultados(media, mediana, desvioPadrao);

    // Renderizar gráfico boxplot
    renderizarBoxplot(frequencias);
}

// Função para calcular a média
function calcularMedia(valores) {
    const soma = valores.reduce((acumulado, valor) => acumulado + valor, 0);
    return (soma / valores.length).toFixed(2);
}

// Função para calcular a mediana
function calcularMediana(valores) {
    const ordenados = [...valores].sort((a, b) => a - b);
    const meio = Math.floor(ordenados.length / 2);

    if (ordenados.length % 2 === 0) {
        return ((ordenados[meio - 1] + ordenados[meio]) / 2).toFixed(2);
    } else {
        return ordenados[meio].toFixed(2);
    }
}

// Função para calcular o desvio padrão
function calcularDesvioPadrao(valores) {
    const media = calcularMedia(valores);
    const variancia = valores.reduce((acumulado, valor) => acumulado + Math.pow(valor - media, 2), 0) / valores.length;
    return Math.sqrt(variancia).toFixed(2);
}

// Exibição dos resultados na interface
function exibirResultados(media, mediana, desvioPadrao) {
    document.getElementById("media").innerText = `Média de presença dos alunos: ${media}%`;
    document.getElementById("mediana").innerText = `Mediana (nível de frequência mais comum): ${mediana}%`;
    document.getElementById("desvioPadrao").innerText = `Desvio Padrão (mede a consistência nas presenças): ±${desvioPadrao}%`;
}

// Renderização do gráfico boxplot
function renderizarBoxplot(frequencias) {
    const ctx = document.getElementById("boxplot").getContext("2d");

    // Dados do gráfico em formato de array de objetos (para boxplot)
    const dataBoxplot = [{ 
        min: Math.min(...frequencias), 
        max: Math.max(...frequencias), 
        q1: calcularQ1(frequencias), 
        q3: calcularQ3(frequencias), 
        median: calcularMediana(frequencias) 
    }];

    // Criação do gráfico Boxplot
    new Chart(ctx, {
        type: 'boxplot',
        data: {
            datasets: [{
                label: 'Dispersão das Frequências',
                data: dataBoxplot,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Funções auxiliares para Q1 e Q3
function calcularQ1(valores) {
    const ordenados = [...valores].sort((a, b) => a - b);
    return calcularMediana(ordenados.slice(0, Math.floor(ordenados.length / 2)));
}

function calcularQ3(valores) {
    const ordenados = [...valores].sort((a, b) => a - b);
    return calcularMediana(ordenados.slice(Math.ceil(ordenados.length / 2)));
}
