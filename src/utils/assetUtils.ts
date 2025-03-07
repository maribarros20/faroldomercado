
// Type for assets
export type Asset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
};

// List of available assets
export const availableAssets = [
  { symbol: "IBOVESPA", name: "IBOVESPA" },
  { symbol: "NASDAQ", name: "NASDAQ" },
  { symbol: "S&P500", name: "S&P 500" },
  { symbol: "DJIA", name: "DOW JONES" },
  { symbol: "EURUSD", name: "EUR/USD" },
  { symbol: "BTCUSD", name: "BTC/USD" },
  { symbol: "PETR4.SA", name: "PETROBRAS" },
  { symbol: "VALE3.SA", name: "VALE" },
  { symbol: "ITUB4.SA", name: "ITAÚ" },
  { symbol: "BBDC4.SA", name: "BRADESCO" },
  { symbol: "MGLU3.SA", name: "MAGAZINE LUIZA" },
  { symbol: "WEGE3.SA", name: "WEG" },
];

// Function to fetch asset data (simulated)
export const fetchAssetData = (symbol: string): Promise<Asset> => {
  return new Promise((resolve) => {
    // Dados simulados - em produção, usaria a API do Google Finance ou similar
    const randomPrice = Math.random() * 1000;
    const randomChange = (Math.random() * 20) - 10;
    const randomChangePercent = (randomChange / randomPrice) * 100;
    
    // Simulando uma chamada de API
    setTimeout(() => {
      resolve({
        symbol,
        name: availableAssets.find(a => a.symbol === symbol)?.name || symbol,
        price: parseFloat(randomPrice.toFixed(2)),
        change: parseFloat(randomChange.toFixed(2)),
        changePercent: parseFloat(randomChangePercent.toFixed(2)),
        lastUpdated: new Date().toLocaleTimeString()
      });
    }, 500);
  });
};
