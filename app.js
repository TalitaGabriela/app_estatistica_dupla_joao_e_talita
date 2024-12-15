// Carregamento do arquivo Excel usando SheetJS
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
    // Extrair frequências dos dados carregados
    const frequencias = dados.map(aluno => aluno.Frequencia);

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
    document.getElementById("media").innerText = `Média: ${media}%`;
    document.getElementById("mediana").innerText = `Mediana: ${mediana}%`;
    document.getElementById("desvioPadrao").innerText = `Desvio Padrão: ±${desvioPadrao}%`;
}

// Renderização do gráfico boxplot
function renderizarBoxplot(frequencias) {
    const ctx = document.getElementById("boxplot").getContext("2d");

    new Chart(ctx, {
        type: 'boxplot',
        data: {
            datasets: [{
                label: 'Dispersão das Frequências',
                data: frequencias,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
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
