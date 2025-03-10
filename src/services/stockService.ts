
const SHEET_ID = "183-0fe8XPxEaWZ6j7mPc8aoNCknempGt66VBa0CVK-s"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 
const RANGE = "Validação!A8:W1500"; 

export interface StockData {
  ticker: string;
  exchange: string;
  movingAvg5: number;
  movingAvg20: number;
  max10Days: number;
  min10Days: number;
  openPrice: number;
  prevCloseD1: number;
  avgVolume10Days: number;
  lastPrice: number;
  changePrice: number;
  changePercent: number;
  updateTime: string;
  name: string;
}

export async function fetchStockData(): Promise<StockData[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Dados brutos do Google Sheets:", data);

    if (!data.values || data.values.length < 1) {
      console.error("Nenhum dado encontrado ou formato inesperado.");
      return getMockData(); // Use mock data when real data fails
    }

    // Mapeamos os dados corretamente
    const stocks = data.values.map((row: any[]) => ({
      ticker: row[0] || "N/A", // Coluna A - Código do ativo
      exchange: row[1] || "N/A", // Coluna B - Bolsa
      movingAvg5: parseFloat(row[2]?.replace(',', '.')) || 0, // Coluna C - Média Móvel 5 Dias
      movingAvg20: parseFloat(row[3]?.replace(',', '.')) || 0, // Coluna D - Média Móvel 20 Dias
      max10Days: parseFloat(row[4]?.replace(',', '.')) || 0, // Coluna E - Máxima dos Últimos 10 Dias
      min10Days: parseFloat(row[5]?.replace(',', '.')) || 0, // Coluna F - Mínima dos Últimos 10 Dias
      openPrice: parseFloat(row[6]?.replace(',', '.')) || 0, // Coluna G - Preço de Abertura do Dia
      prevCloseD1: parseFloat(row[10]?.replace(',', '.')) || 0, // Coluna K - Preço Fechamento D-1
      avgVolume10Days: parseInt(row[8]?.replace(/\./g, '')) || 0, // Coluna I - Volume Médio 10 Dias
      lastPrice: parseFloat(row[9]?.replace(',', '.')) || 0, // Coluna J - Preço Atual
      changePrice: parseFloat(row[15]?.replace(',', '.')) || 0, // Coluna P - Variação de Preço
      changePercent: parseFloat(row[16]?.replace("%", "")?.replace(',', '.')) || 0, // Coluna Q - % Variação
      updateTime: row[18] || "Sem horário", // Coluna S - Hora cotação BRA
      name: row[22]?.trim() || "Nome Indefinido", // Coluna W - Nome do Ativo
    }));

    console.log("Dados processados:", stocks);
    return stocks.filter(stock => stock.ticker && stock.ticker !== "N/A");
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    return getMockData(); // Fallback para dados de exemplo
  }
}

// Dados de exemplo para quando a API falhar
function getMockData(): StockData[] {
  return [
    { ticker: "PETR4", name: "Petrobras PN", exchange: "BVMF", movingAvg5: 36.5, movingAvg20: 35.8, max10Days: 38.2, min10Days: 35.1, openPrice: 37.2, prevCloseD1: 36.9, avgVolume10Days: 45000000, lastPrice: 38.42, changePrice: 1.52, changePercent: 2.15, updateTime: "16:30" },
    { ticker: "VALE3", name: "Vale ON", exchange: "BVMF", movingAvg5: 64.2, movingAvg20: 65.5, max10Days: 66.8, min10Days: 62.3, openPrice: 62.9, prevCloseD1: 64.1, avgVolume10Days: 42000000, lastPrice: 63.18, changePrice: -0.92, changePercent: -1.32, updateTime: "16:30" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", exchange: "BVMF", movingAvg5: 32.1, movingAvg20: 31.8, max10Days: 33.2, min10Days: 31.1, openPrice: 32.3, prevCloseD1: 32.3, avgVolume10Days: 30000000, lastPrice: 32.56, changePrice: 0.26, changePercent: 0.75, updateTime: "16:30" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", exchange: "BVMF", movingAvg5: 55.8, movingAvg20: 54.9, max10Days: 56.2, min10Days: 53.8, openPrice: 54.9, prevCloseD1: 55.9, avgVolume10Days: 25000000, lastPrice: 52.94, changePrice: -2.96, changePercent: -5.31, updateTime: "16:30" },
    { ticker: "WEGE3", name: "WEG ON", exchange: "BVMF", movingAvg5: 34.2, movingAvg20: 36.1, max10Days: 36.8, min10Days: 33.9, openPrice: 34.3, prevCloseD1: 34.3, avgVolume10Days: 12000000, lastPrice: 36.45, changePrice: 2.15, changePercent: 6.27, updateTime: "16:30" },
  ];
}
