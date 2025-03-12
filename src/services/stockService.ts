const SHEET_ID = "183-0fe8XPxEaWZ6j7mPc8aoNCknempGt66VBa0CVK-s"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 
const RANGE = "Validação!A8:W1500"; 
const HISTORY_RANGE = "spik!A4:AV70"; // Updated range to include all columns up to AV

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

export interface StockHistoricalData {
  ticker: string;
  dates: string[];
  prices: number[];
}

// Track the last update time for each data type
const lastUpdate = {
  stockData: 0,  // Regular data (5-min refresh)
  historicalData: 0  // Historical data (daily refresh)
};

// Time thresholds in milliseconds
const STOCK_DATA_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const HISTORICAL_DATA_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Cached data
let cachedStockData: StockData[] | null = null;
let cachedHistoricalData: StockHistoricalData[] | null = null;

export async function fetchStockData(): Promise<StockData[]> {
  const now = Date.now();
  
  // Return cached data if it's fresh (less than 5 minutes old)
  if (cachedStockData && (now - lastUpdate.stockData) < STOCK_DATA_REFRESH_INTERVAL) {
    console.log("Using cached stock data (less than 5 minutes old)");
    return cachedStockData;
  }
  
  console.log("Fetching fresh stock data from Google Sheets...");
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
    
    // Update cache and last update time
    cachedStockData = stocks.filter(stock => stock.ticker && stock.ticker !== "N/A");
    lastUpdate.stockData = now;
    
    return cachedStockData;
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    return getMockData(); // Fallback para dados de exemplo
  }
}

export async function fetchHistoricalStockData(): Promise<StockHistoricalData[]> {
  const now = Date.now();
  
  // Return cached data if it's fresh (less than 24 hours old)
  if (cachedHistoricalData && (now - lastUpdate.historicalData) < HISTORICAL_DATA_REFRESH_INTERVAL) {
    console.log("Using cached historical data (less than 24 hours old)");
    return cachedHistoricalData;
  }
  
  console.log("Fetching fresh historical data from Google Sheets...");
  console.log("Using sheet ID:", SHEET_ID);
  console.log("Using range:", HISTORY_RANGE);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${HISTORY_RANGE}?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values || data.values.length < 1) {
      console.error("No historical data found in response:", data);
      return getMockHistoricalData(); // Use mock data when real data is missing
    }
    
    console.log("Raw historical data sample (first 3 rows):", data.values.slice(0, 3));
    console.log("Number of rows in historical data:", data.values.length);
    
    // Extract dates from the first column
    const dates = data.values.map(row => row[0]).filter(Boolean);
    console.log("Extracted dates (first 5):", dates.slice(0, 5));
    console.log("Extracted dates (last 5):", dates.slice(-5));
    
    // Correct mapping of column indices for different stocks
    const stockColumns = {
      "ABEV3": 1,  // Column B
      "B3SA3": 3,  // Column D
      "BBDC4": 7,  // Column H
      "BBAS3": 10, // Column K
      "ITSA4": 13, // Column N
      "ITUB4": 16, // Column Q
      "PETR3": 19, // Column T
      "PETR4": 22, // Column W
      "VALE3": 25, // Column Z
      "AAPL": 28,  // Column AC
      "AMZN": 31,  // Column AF
      "GOOGL": 34, // Column AI
      "META": 37,  // Column AL
      "NVDA": 40,  // Column AO
      "MSFT": 43,  // Column AR
      "TSLA": 46,  // Column AU
    };
    
    // Detailed logging of raw data
    console.log("Checking raw data for a few stocks:");
    for (const [ticker, colIndex] of Object.entries(stockColumns)) {
      const sample = data.values.slice(0, 3).map(row => {
        return {date: row[0], price: row[colIndex]};
      });
      console.log(`${ticker} sample data (first 3 rows):`, sample);
    }
    
    // Process data for each stock
    const historicalData: StockHistoricalData[] = [];
    
    for (const [ticker, colIndex] of Object.entries(stockColumns)) {
      // Extract all raw price values for debugging
      const rawPrices = data.values.map(row => row[colIndex]?.toString().replace(',', '.'));
      console.log(`${ticker} raw prices (sample):`, rawPrices.slice(0, 5));
      
      const prices = data.values
        .map(row => {
          const rawValue = row[colIndex]?.toString().replace(',', '.');
          const parsedValue = parseFloat(rawValue || '0');
          return parsedValue;
        })
        .filter(val => !isNaN(val) && val > 0);
      
      console.log(`Stock ${ticker} has ${prices.length} valid price points`);
      if (prices.length > 0) {
        console.log(`${ticker} price sample (first 5):`, prices.slice(0, 5));
        console.log(`${ticker} price sample (last 5):`, prices.slice(-5));
        
        // Create a new array of dates trimmed to match the number of prices
        const stockDates = dates.slice(0, prices.length);
        
        historicalData.push({
          ticker,
          dates: stockDates,
          // The data from the sheet is already in chronological order (oldest first)
          prices: prices
        });
      }
    }
    
    console.log("Processed historical data count:", historicalData.length);
    if (historicalData.length > 0) {
      // Log full data for a few sample stocks to verify everything is correct
      ["AAPL", "MSFT", "PETR4", "VALE3"].forEach(ticker => {
        const stockData = historicalData.find(item => item.ticker === ticker);
        if (stockData) {
          console.log(`Complete data for ${ticker}:`, {
            dates: stockData.dates,
            prices: stockData.prices,
            startDate: stockData.dates[0],
            endDate: stockData.dates[stockData.dates.length - 1],
            startPrice: stockData.prices[0],
            endPrice: stockData.prices[stockData.prices.length - 1]
          });
        }
      });
    }
    
    // Add mock data for stocks not in the sheet
    const mockHistorical = getMockHistoricalData();
    const existingTickers = historicalData.map(item => item.ticker);
    
    for (const mockItem of mockHistorical) {
      if (!existingTickers.includes(mockItem.ticker)) {
        historicalData.push(mockItem);
        console.log(`Added mock data for missing stock: ${mockItem.ticker}`);
      }
    }
    
    // Update cache and last update time
    cachedHistoricalData = historicalData;
    lastUpdate.historicalData = now;
    
    return historicalData;
    
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return getMockHistoricalData();
  }
}

function getMockData(): StockData[] {
  return [
    { ticker: "PETR4", name: "Petrobras PN", exchange: "BVMF", movingAvg5: 36.5, movingAvg20: 35.8, max10Days: 38.2, min10Days: 35.1, openPrice: 37.2, prevCloseD1: 36.9, avgVolume10Days: 45000000, lastPrice: 38.42, changePrice: 1.52, changePercent: 2.15, updateTime: "16:30" },
    { ticker: "VALE3", name: "Vale ON", exchange: "BVMF", movingAvg5: 64.2, movingAvg20: 65.5, max10Days: 66.8, min10Days: 62.3, openPrice: 62.9, prevCloseD1: 64.1, avgVolume10Days: 42000000, lastPrice: 63.18, changePrice: -0.92, changePercent: -1.32, updateTime: "16:30" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", exchange: "BVMF", movingAvg5: 55.8, movingAvg20: 54.9, max10Days: 56.2, min10Days: 53.8, openPrice: 54.9, prevCloseD1: 55.9, avgVolume10Days: 25000000, lastPrice: 52.94, changePrice: -2.96, changePercent: -5.31, updateTime: "16:30" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", exchange: "BVMF", movingAvg5: 32.1, movingAvg20: 31.8, max10Days: 33.2, min10Days: 31.1, openPrice: 32.3, prevCloseD1: 32.3, avgVolume10Days: 30000000, lastPrice: 32.56, changePrice: 0.26, changePercent: 0.75, updateTime: "16:30" },
    { ticker: "BBDC4", name: "Bradesco PN", exchange: "BVMF", movingAvg5: 15.2, movingAvg20: 15.8, max10Days: 16.4, min10Days: 14.9, openPrice: 15.3, prevCloseD1: 15.1, avgVolume10Days: 38000000, lastPrice: 15.47, changePrice: 0.37, changePercent: 2.45, updateTime: "16:30" },
    { ticker: "ABEV3", name: "Ambev ON", exchange: "BVMF", movingAvg5: 14.1, movingAvg20: 14.3, max10Days: 14.6, min10Days: 13.9, openPrice: 14.2, prevCloseD1: 14.1, avgVolume10Days: 20000000, lastPrice: 14.35, changePrice: 0.25, changePercent: 1.77, updateTime: "16:30" },
    { ticker: "ITSA4", name: "Itaúsa PN", exchange: "BVMF", movingAvg5: 10.8, movingAvg20: 10.9, max10Days: 11.2, min10Days: 10.5, openPrice: 10.9, prevCloseD1: 10.8, avgVolume10Days: 22000000, lastPrice: 11.05, changePrice: 0.25, changePercent: 2.31, updateTime: "16:30" },
    { ticker: "B3SA3", name: "B3 ON", exchange: "BVMF", movingAvg5: 12.4, movingAvg20: 12.1, max10Days: 12.8, min10Days: 11.9, openPrice: 12.2, prevCloseD1: 12.3, avgVolume10Days: 18000000, lastPrice: 12.14, changePrice: -0.16, changePercent: -1.30, updateTime: "16:30" },
    { ticker: "PETR3", name: "Petrobras ON", exchange: "BVMF", movingAvg5: 35.9, movingAvg20: 35.2, max10Days: 37.5, min10Days: 34.8, openPrice: 36.5, prevCloseD1: 36.2, avgVolume10Days: 30000000, lastPrice: 37.18, changePrice: 0.98, changePercent: 2.71, updateTime: "16:30" },
    // US Stocks (Magnificent 7)
    { ticker: "AAPL", name: "Apple Inc", exchange: "NASDAQ", movingAvg5: 185.5, movingAvg20: 180.8, max10Days: 188.2, min10Days: 177.1, openPrice: 184.2, prevCloseD1: 182.9, avgVolume10Days: 75000000, lastPrice: 187.42, changePrice: 4.52, changePercent: 2.47, updateTime: "16:00" },
    { ticker: "MSFT", name: "Microsoft Corp", exchange: "NASDAQ", movingAvg5: 352.2, movingAvg20: 345.5, max10Days: 358.8, min10Days: 340.3, openPrice: 350.9, prevCloseD1: 348.1, avgVolume10Days: 25000000, lastPrice: 355.18, changePrice: 7.08, changePercent: 2.03, updateTime: "16:00" },
    { ticker: "GOOGL", name: "Alphabet Inc", exchange: "NASDAQ", movingAvg5: 142.2, movingAvg20: 138.5, max10Days: 145.8, min10Days: 136.3, openPrice: 140.9, prevCloseD1: 141.1, avgVolume10Days: 30000000, lastPrice: 143.58, changePrice: 2.48, changePercent: 1.76, updateTime: "16:00" },
    { ticker: "AMZN", name: "Amazon.com Inc", exchange: "NASDAQ", movingAvg5: 172.2, movingAvg20: 169.5, max10Days: 175.8, min10Days: 167.3, openPrice: 171.9, prevCloseD1: 170.1, avgVolume10Days: 45000000, lastPrice: 175.35, changePrice: 5.25, changePercent: 3.09, updateTime: "16:00" },
    { ticker: "TSLA", name: "Tesla Inc", exchange: "NASDAQ", movingAvg5: 220.2, movingAvg20: 225.5, max10Days: 230.8, min10Days: 210.3, openPrice: 215.9, prevCloseD1: 218.1, avgVolume10Days: 120000000, lastPrice: 209.18, changePrice: -8.92, changePercent: -4.09, updateTime: "16:00" },
    { ticker: "NVDA", name: "NVIDIA Corp", exchange: "NASDAQ", movingAvg5: 842.2, movingAvg20: 825.5, max10Days: 855.8, min10Days: 805.3, openPrice: 840.9, prevCloseD1: 835.1, avgVolume10Days: 50000000, lastPrice: 875.35, changePrice: 40.25, changePercent: 4.82, updateTime: "16:00" },
    { ticker: "META", name: "Meta Platforms Inc", exchange: "NASDAQ", movingAvg5: 472.2, movingAvg20: 465.5, max10Days: 480.8, min10Days: 458.3, openPrice: 470.9, prevCloseD1: 468.1, avgVolume10Days: 20000000, lastPrice: 483.58, changePrice: 15.48, changePercent: 3.31, updateTime: "16:00" },
    // Index
    { ticker: "IBOV", name: "Ibovespa", exchange: "B3", movingAvg5: 125000, movingAvg20: 124000, max10Days: 127000, min10Days: 122000, openPrice: 124500, prevCloseD1: 125100, avgVolume10Days: 0, lastPrice: 126500, changePrice: 1400, changePercent: 1.12, updateTime: "16:30" },
  ];
}

function getMockHistoricalData(): StockHistoricalData[] {
  const tickers = [
    "PETR4", "VALE3", "BBAS3", "ITUB4", "BBDC4", "ABEV3", "ITSA4", "B3SA3", "PETR3",
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "IBM", "IBOV"
  ];
  
  const mockHistoricalData: StockHistoricalData[] = [];
  
  // Generate 30 days of mock data for each ticker - in chronological order (oldest first)
  tickers.forEach(ticker => {
    const dates = [];
    const prices = [];
    
    // Start price based on ticker (just to get different scales)
    const basePrice = ticker.charCodeAt(0) + ticker.charCodeAt(ticker.length - 1);
    let currentPrice = basePrice;
    
    // Generate 30 days of data - in chronological order (oldest first)
    for (let i = 0; i < 30; i++) {
      // Create a date string
      const date = new Date();
      date.setDate(date.getDate() - (29 - i)); // Start with oldest date
      dates.push(date.toISOString().split('T')[0]);
      
      // Generate a price with some random variation
      const change = (Math.random() - 0.48) * basePrice * 0.02; // Slight upward bias
      currentPrice += change;
      prices.push(Math.max(currentPrice, basePrice * 0.5)); // Ensure we don't go too low
    }
    
    mockHistoricalData.push({
      ticker,
      dates,
      prices
    });
  });
  
  return mockHistoricalData;
}
