const SHEET_ID = "1fPLwFZmfhfjc2muHkr58WySldsj_AmsM_TXhykMPj8I"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 
const SHEET_NAME = "V.10";
const GRAPH_SHEET = "spik";
const VIX_SHEET = "VIX";

// New approach: fetch tabular data from A2 onwards
const DATA_RANGE = "'V.10'!A2:H100";  // Fetching all rows from A2 to H100
const VIX_CHART_RANGE = "'VIX'!C2:C400";  // Keep VIX chart data range

export interface MarketDataResponse {
  adrsCurrent: {
    value: string;
    parameter: string;
    time: string;
    isNegative: boolean;
  };
  adrsClosing: {
    value: string;
    parameter: string;
    time: string;
    isPositive: boolean;
  };
  adrsAfterMarket: {
    value: string;
    parameter: string;
    time: string;
    isPositive: boolean;
  };
  commodities: {
    value: string;
    parameter: string;
    time: string;
    isNegative: boolean;
  };
  vix: {
    currentValue: string;
    currentChange: string;
    currentTime: string;
    currentValueParameter: string;
    currentChangeParameter: string;
    closingValue: string;
    closingChange: string;
    closingTime: string;
    openingValue: string;
    openingChange: string;
    openingTime: string;
    openingChangeParameter: string;
    tendencyTime: string;
    tendencyParameter: string;
    chartData: string[];
  };
  alerts: {
    volatility: string;
    footprint: string;
    indexation: string;
  };
  adrs: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      prevChange: string;
      afterChange: string;
    };
  };
  commoditiesList: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
    };
  };
  marketIndices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
      chart?: string[];
    };
  };
  safetyAssets: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  economicDataUS: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  economicDataBrazil: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

export const fetchMarketData = async (): Promise<MarketDataResponse> => {
  try {
    // Format ranges properly for the API - using the new tabular approach
    const encodedRanges = [
      `ranges=${encodeURIComponent(DATA_RANGE)}`,
      `ranges=${encodeURIComponent(VIX_CHART_RANGE)}`
    ].join('&');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${encodedRanges}&key=${API_KEY}`;
    
    console.log("Fetching market data from:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.valueRanges || data.valueRanges.length === 0) {
      throw new Error("No data found in Google Sheets response");
    }

    console.log("Raw Google Sheets data:", data);
    
    // Extract data from response
    const tableData = data.valueRanges[0].values || [];
    const vixChartData = data.valueRanges[1]?.values?.map(row => row[0]) || [];
    
    // Process the tabular data
    return processTableData(tableData, vixChartData);
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return getMockMarketData();
  }
};

// Process the new tabular format data with focus on rows 2-9 for summary cards
const processTableData = (tableData: any[][], vixChartData: string[]): MarketDataResponse => {
  // Initialize response structure
  const result: MarketDataResponse = {
    adrsCurrent: {
      value: "0%",
      parameter: "",
      time: "",
      isNegative: false
    },
    adrsClosing: {
      value: "0%",
      parameter: "",
      time: "",
      isPositive: false
    },
    adrsAfterMarket: {
      value: "0%",
      parameter: "",
      time: "",
      isPositive: false
    },
    commodities: {
      value: "0%",
      parameter: "",
      time: "",
      isNegative: false
    },
    vix: {
      currentValue: "0",
      currentChange: "0%",
      currentTime: "",
      currentValueParameter: "",
      currentChangeParameter: "",
      closingValue: "0",
      closingChange: "0%",
      closingTime: "",
      openingValue: "0",
      openingChange: "0%",
      openingTime: "",
      openingChangeParameter: "",
      tendencyTime: "",
      tendencyParameter: "",
      chartData: vixChartData || []
    },
    alerts: {
      volatility: "",
      footprint: "",
      indexation: ""
    },
    adrs: {},
    commoditiesList: {},
    marketIndices: {},
    safetyAssets: {},
    economicDataUS: {},
    economicDataBrazil: {}
  };
  
  // Temporary structures to collect alert data
  const alertMessages = {
    volatility: [] as string[],
    footprint: [] as string[],
    indexation: [] as string[]
  };
  
  // First, process the first 8 rows specifically for the summary cards
  // These rows have a special importance for the header cards
  if (tableData.length >= 8) {
    // Row 0 (index 0) - ADRs Current
    if (tableData[0] && tableData[0].length >= 3) {
      const row = tableData[0];
      result.adrsCurrent = {
        value: row[2] || "0%", // Column C - Value/Change
        parameter: row[6] || "", // Column G - Parameter
        time: row[1] || "", // Column B - Time
        isNegative: (row[2] || "").includes("-")
      };
    }
    
    // Row 1 (index 1) - ADRs Closing
    if (tableData[1] && tableData[1].length >= 3) {
      const row = tableData[1];
      result.adrsClosing = {
        value: row[2] || "0%", // Column C - Value/Change
        parameter: row[6] || "", // Column G - Parameter
        time: row[1] || "", // Column B - Time
        isPositive: !(row[2] || "").includes("-")
      };
    }
    
    // Row 2 (index 2) - ADRs After Market
    if (tableData[2] && tableData[2].length >= 3) {
      const row = tableData[2];
      result.adrsAfterMarket = {
        value: row[2] || "0%", // Column C - Value/Change
        parameter: row[6] || "", // Column G - Parameter
        time: row[1] || "", // Column B - Time
        isPositive: !(row[2] || "").includes("-")
      };
    }
    
    // Row 3 (index 3) - Commodities Summary
    if (tableData[3] && tableData[3].length >= 3) {
      const row = tableData[3];
      result.commodities = {
        value: row[2] || "0%", // Column C - Value/Change
        parameter: row[6] || "", // Column G - Parameter
        time: row[1] || "", // Column B - Time
        isNegative: (row[2] || "").includes("-")
      };
    }
    
    // Row 4 (index 4) - VIX Current
    if (tableData[4] && tableData[4].length >= 6) {
      const row = tableData[4];
      result.vix.currentValue = row[3] || "0"; // Column D - Value
      result.vix.currentChange = row[4] || "0%"; // Column E - Change
      result.vix.currentTime = row[1] || ""; // Column B - Time
      result.vix.currentValueParameter = row[5] || ""; // Column F - Value Parameter
      result.vix.currentChangeParameter = row[6] || ""; // Column G - Change Parameter
    }
    
    // Row 5 (index 5) - VIX Closing
    if (tableData[5] && tableData[5].length >= 5) {
      const row = tableData[5];
      result.vix.closingValue = row[3] || "0"; // Column D - Value
      result.vix.closingChange = row[4] || "0%"; // Column E - Change
      result.vix.closingTime = row[1] || ""; // Column B - Time
    }
    
    // Row 6 (index 6) - VIX Opening
    if (tableData[6] && tableData[6].length >= 6) {
      const row = tableData[6];
      result.vix.openingValue = row[3] || "0"; // Column D - Value
      result.vix.openingChange = row[4] || "0%"; // Column E - Change
      result.vix.openingTime = row[1] || ""; // Column B - Time
      result.vix.openingChangeParameter = row[6] || ""; // Column G - Parameter
    }
    
    // Row 7 (index 7) - VIX Tendency
    if (tableData[7] && tableData[7].length >= 7) {
      const row = tableData[7];
      result.vix.tendencyTime = row[1] || ""; // Column B - Time
      result.vix.tendencyParameter = row[6] || ""; // Column G - Parameter
    }
  }
  
  // Now process all rows in the table for the detailed data
  tableData.forEach((row, index) => {
    if (!row || row.length < 2 || !row[0]) return; // Skip rows without name
    
    const assetName = row[0]; // Column A: Name
    const time = row[1] || ""; // Column B: Time
    const value = row[3] || "0"; // Column D: Value (or Column C for % values)
    const change = row[4] || "0%"; // Column E: Change %
    const valueParam = row[5] || ""; // Column F: Value Parameter
    const additionalInfo = row[6] || ""; // Column G: Additional info/Parameter
    const hasChart = row[7] ? row[7].toLowerCase().includes("sim") : false; // Column H: Chart indicator
    
    // Flag for change direction
    const isNegative = change.includes("-");
    
    // Skip the first 8 rows as they were processed specially above
    if (index < 8) return;
    
    // Process data for alerts
    if (assetName.includes("Alerta Volatilidade")) {
      alertMessages.volatility.push(additionalInfo);
    } else if (assetName.includes("Alerta Footprint")) {
      alertMessages.footprint.push(additionalInfo);
    } else if (assetName.includes("Alerta Indexação")) {
      alertMessages.indexation.push(additionalInfo);
    }
    
    // Process ADRs
    else if (assetName.includes("ADR") && assetName.includes("dados atuais")) {
      const adrName = extractADRName(assetName);
      if (adrName) {
        result.adrs[adrName] = {
          name: adrName,
          time: time,
          value: value,
          change: change,
          prevChange: "0%", // Default values
          afterChange: "0%"  // Default values
        };
      }
    }
    
    // Process Commodities
    else if (isCommodity(assetName)) {
      const commodityKey = getCommodityKey(assetName);
      if (commodityKey) {
        result.commoditiesList[commodityKey] = {
          name: assetName,
          time: time,
          value: value,
          change: change
        };
      }
    }
    
    // Process Market Indices
    else if (isMarketIndex(assetName)) {
      const indexKey = getMarketIndexKey(assetName);
      if (indexKey) {
        result.marketIndices[indexKey] = {
          name: assetName,
          time: time,
          value: value,
          change: change,
          parameter: valueParam,
          chart: hasChart ? [] : undefined // Empty array if has chart
        };
      }
    }
    
    // Process Safety Assets
    else if (isSafetyAsset(assetName)) {
      const assetKey = getSafetyAssetKey(assetName);
      if (assetKey) {
        result.safetyAssets[assetKey] = {
          name: assetName,
          time: time,
          value: value,
          change: change,
          parameter: valueParam
        };
      }
    }
    
    // Process Economic Data US
    else if (isEconomicDataUS(assetName)) {
      const dataKey = getEconomicDataUSKey(assetName);
      if (dataKey) {
        result.economicDataUS[dataKey] = {
          name: assetName,
          time: time,
          value: value,
          change: change,
          parameter: valueParam
        };
      }
    }
    
    // Process Economic Data Brazil
    else if (isEconomicDataBrazil(assetName)) {
      const dataKey = getEconomicDataBrazilKey(assetName);
      if (dataKey) {
        result.economicDataBrazil[dataKey] = {
          name: assetName,
          time: time,
          value: value,
          change: change,
          parameter: valueParam
        };
      }
    }
  });
  
  // Combine all alert messages
  result.alerts = {
    volatility: alertMessages.volatility.join(" "),
    footprint: alertMessages.footprint.join(" "),
    indexation: alertMessages.indexation.join(" ")
  };
  
  // Ensure we have the market indices we need
  ensureMarketIndices(result);
  
  // Return the processed data
  return result;
};

// Helper functions to extract and categorize data
const extractADRName = (fullName: string): string => {
  // Extract tickers like VALE, PBR, etc.
  const adrMatches = fullName.match(/\b(VALE|PBR|PBRA|ITUB|BBD|BBDO|BSBR)\b/);
  return adrMatches ? adrMatches[0] : "";
};

const isCommodity = (name: string): boolean => {
  const commodityTerms = ['Petróleo', 'Brent', 'WTI', 'Minério', 'Ferro', 'Commodity'];
  return commodityTerms.some(term => name.includes(term));
};

const getCommodityKey = (name: string): string => {
  if (name.includes('Brent')) return 'BRENT';
  if (name.includes('WTI')) return 'WTI';
  if (name.includes('Minério') && name.includes('Singapura')) return 'IRON_SING';
  if (name.includes('Minério') && name.includes('Dalian')) return 'IRON_DALIAN';
  return name.replace(/\s+/g, '_').toUpperCase();
};

const isMarketIndex = (name: string): boolean => {
  const indexTerms = ['S&P 500', 'Dow Jones', 'Nasdaq', 'Euro Stoxx', 'FTSE', 'China', 'IBOV', 'EWZ', 'Índice', 'VALE3', 'PETR4', 'BIT'];
  return indexTerms.some(term => name.includes(term));
};

const getMarketIndexKey = (name: string): string => {
  if (name.includes('S&P 500')) return 'SP500';
  if (name.includes('Dow Jones')) return 'DOW';
  if (name.includes('Nasdaq')) return 'NASDAQ';
  if (name.includes('Euro Stoxx')) return 'EURO_STOXX';
  if (name.includes('FTSE')) return 'FTSE100';
  if (name.includes('China')) return 'CHINA_A50';
  if (name.includes('IBOV')) return 'IBOV';
  if (name.includes('VALE3')) return 'VALE3';
  if (name.includes('PETR4')) return 'PETR4';
  if (name.includes('EWZ')) return 'EWZ';
  if (name.includes('BIT')) return 'BIT_FUT';
  return name.replace(/\s+/g, '_').toUpperCase();
};

const isSafetyAsset = (name: string): boolean => {
  const assetTerms = ['Ouro', 'Dólar', 'Treasury', 'Ativo de Segurança'];
  return assetTerms.some(term => name.includes(term));
};

const getSafetyAssetKey = (name: string): string => {
  if (name.includes('Ouro')) return 'GOLD';
  if (name.includes('Dólar')) return 'DOLLAR';
  if (name.includes('Treasury 2Y')) return 'TREA_2Y';
  if (name.includes('Treasury 5Y')) return 'TREA_5Y';
  if (name.includes('Treasury 10Y')) return 'TREA_10Y';
  if (name.includes('Treasury 30Y')) return 'TREA_30Y';
  return name.replace(/\s+/g, '_').toUpperCase();
};

const isEconomicDataUS = (name: string): boolean => {
  const usTerms = ['Taxa de Juros EUA', 'Inflação EUA', 'CPI', 'Estados Unidos'];
  return usTerms.some(term => name.includes(term));
};

const getEconomicDataUSKey = (name: string): string => {
  if (name.includes('Taxa de Juros EUA')) return 'US_RATE';
  if (name.includes('Inflação EUA') || name.includes('CPI')) return 'US_CPI';
  return name.replace(/\s+/g, '_').toUpperCase();
};

const isEconomicDataBrazil = (name: string): boolean => {
  const brTerms = ['Selic', 'IPCA', 'Brasil', 'Brasileira'];
  return brTerms.some(term => name.includes(term));
};

const getEconomicDataBrazilKey = (name: string): string => {
  if (name.includes('Selic')) return 'BR_SELIC';
  if (name.includes('IPCA')) return 'BR_IPCA';
  return name.replace(/\s+/g, '_').toUpperCase();
};

// Ensure required market indices exist
const ensureMarketIndices = (result: MarketDataResponse) => {
  const requiredIndices = [
    { key: 'IBOV', name: 'IBOV' },
    { key: 'VALE3', name: 'VALE3' },
    { key: 'PETR4', name: 'PETR4' },
    { key: 'EWZ', name: 'EWZ' },
    { key: 'BIT_FUT', name: 'BIT FUT' }
  ];
  
  requiredIndices.forEach(index => {
    if (!result.marketIndices[index.key]) {
      result.marketIndices[index.key] = {
        name: index.name,
        time: "",
        value: "0",
        change: "0%"
      };
    }
  });
};

// Mock data for testing or when API fails - keeping the existing mock data
const getMockMarketData = (): MarketDataResponse => {
  // Get the additional mock data
  const additionalMockData = getMockAdditionalData();
  
  return {
    adrsCurrent: {
      value: "-9.29%",
      parameter: "EXTREMAMENTE NEGATIVO",
      time: "18:00:02",
      isNegative: true
    },
    adrsClosing: {
      value: "7.77%",
      parameter: "MUITO POSITIVO",
      time: "07/03/2025",
      isPositive: true
    },
    adrsAfterMarket: {
      value: "0.26%",
      parameter: "LEVEMENTE POSITIVO",
      time: "07/03/2025",
      isPositive: true
    },
    commodities: {
      value: "-2.06%",
      parameter: "MODERADAMENTE NEGATIVO",
      time: "17:40:07",
      isNegative: true
    },
    vix: {
      currentValue: "27.86",
      currentChange: "+19.21%",
      currentTime: "17:15:01",
      currentValueParameter: "REGIÃO DE VALOR NEUTRA",
      currentChangeParameter: "VOLATILIDADE NEGATIVA MUITO ALTA",
      closingValue: "23.37",
      closingChange: "-6.03%",
      closingTime: "07/03",
      openingValue: "24.70",
      openingChange: "5.69%",
      openingTime: "10/03",
      openingChangeParameter: "ABERTURA DO VIX COM GAP DE ALTA",
      tendencyTime: "16:49:01",
      tendencyParameter: "VIX MANTENDO ALTA, VOLATILIDADE FICANDO MAIS NEGATIVA PARA IBOV",
      chartData: ["23.1", "23.4", "23.8", "24.2", "24.6", "25.1", "25.8", "26.5", "27.1", "27.8"]
    },
    alerts: {
      volatility: "#Volatilidade significativa, ajuste seu STOP LOSS",
      footprint: "#Reconfigure o Footprint para a volatilidade do dia 4/5 ou 5/4 para progressão e exaustão",
      indexation: "#Mantenha o envelope de 0,7 e 1 na configuração da indexação ISPUT/WINFUT"
    },
    adrs: {
      "VALE": {
        name: "VALE",
        time: "17:40:00",
        value: "15.24",
        change: "-1.62%",
        prevChange: "-0.85%",
        afterChange: "-0.25%"
      },
      "PBR": {
        name: "PBR",
        time: "17:40:00",
        value: "14.88",
        change: "-0.67%",
        prevChange: "-1.20%",
        afterChange: "+0.45%"
      },
      "PBRA": {
        name: "PBRA",
        time: "17:40:00",
        value: "13.76",
        change: "-0.94%",
        prevChange: "-1.35%",
        afterChange: "+0.22%"
      },
      "ITUB": {
        name: "ITUB",
        time: "17:40:00",
        value: "6.81",
        change: "-0.87%",
        prevChange: "-1.02%",
        afterChange: "-0.15%"
      },
      "BBD": {
        name: "BBD",
        time: "17:40:00",
        value: "4.94",
        change: "-1.20%",
        prevChange: "-0.80%",
        afterChange: "-0.40%"
      },
      "BBDO": {
        name: "BBDO",
        time: "17:40:00",
        value: "4.87",
        change: "-1.22%",
        prevChange: "-0.82%",
        afterChange: "-0.41%"
      },
      "BSBR": {
        name: "BSBR",
        time: "17:40:00",
        value: "7.89",
        change: "-0.76%",
        prevChange: "-0.51%",
        afterChange: "-0.13%"
      }
    },
    commoditiesList: {
      "BRENT": {
        name: "Petróleo Brent",
        time: "17:40:00",
        value: "82.89",
        change: "-1.85%"
      },
      "WTI": {
        name: "Petróleo WTI",
        time: "17:40:00",
        value: "77.65",
        change: "-2.06%"
      },
      "IRON_SING": {
        name: "Minério de Ferro Singapura",
        time: "",
        value: "110.25",
        change: "-0.75%"
      },
      "IRON_DALIAN": {
        name: "Minério de Ferro Dalian",
        time: "17:40:00",
        value: "782.50",
        change: "-1.24%"
      }
    },
    marketIndices: {
      "SP500": {
        name: "S&P 500",
        time: "17:15:01",
        value: "5,435.02",
        change: "+0.34%",
        parameter: "LEVEMENTE POSITIVO",
        chart: ["5420", "5425", "5430", "5435", "5440", "5445"]
      },
      "DOW": {
        name: "Dow Jones",
        time: "17:15:01",
        value: "39,876.55",
        change: "+0.21%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "NASDAQ": {
        name: "Nasdaq 100",
        time: "17:15:01",
        value: "17,285.32",
        change: "+0.47%",
        parameter: "MODERADAMENTE POSITIVO"
      },
      "IBOV": {
        name: "IBOV",
        time: "17:21:00",
        value: "123.507,35",
        change: "-0.81%",
        chart: ["125571", "126521", "124380", "124850", "128218", "128552", "128531", "127308", "127600", "127128", "125401", "125979", "124768", "124798", "122799", "123046", "123357", "125034", "124519", "123507"]
      },
      "VALE3": {
        name: "VALE3",
        time: "17:21:00",
        value: "54.44",
        change: "+0.83%",
        chart: ["55.4", "55.16", "54.79", "54.86", "55.67", "55.37", "55.74", "55.69", "57.74", "58.16", "57.63", "57.07", "56.72", "56.3", "55.15", "55.59", "56.2", "57.02", "53.99", "54.44"]
      },
      "PETR4": {
        name: "PETR4",
        time: "17:21:00",
        value: "34.1",
        change: "-1.50%",
        chart: ["36.83", "36.83", "36.28", "36.32", "37.44", "37.67", "38.36", "38.44", "38.5", "38.39", "38.12", "37.95", "37.95", "36.61", "35.93", "34.62", "34.26", "34.63", "34.62", "34.1"]
      },
      "EWZ": {
        name: "EWZ",
        time: "17:00:09",
        value: "24.38",
        change: "+0.33%",
        chart: ["25.58", "25.79", "25.34", "25.46", "26.37", "26.39", "26.09", "26.2", "25.47", "25.06", "25.28", "24.88", "24.71", "24.11", "24.14", "23.91", "24.58", "24.57", "24.82", "24.38"]
      },
      "BIT_FUT": {
        name: "BIT FUT",
        time: "23:29:13",
        value: "83.035",
        change: "-0.04%"
      }
    },
    safetyAssets: {
      "GOLD": {
        name: "Ouro",
        time: "17:40:00",
        value: "1,234.56",
        change: "-0.50%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "DOLLAR": {
        name: "Dólar",
        time: "17:40:00",
        value: "5.678",
        change: "+0.10%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "TREA_2Y": {
        name: "Treasury 2Y",
        time: "17:40:00",
        value: "2.345",
        change: "-0.20%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "TREA_5Y": {
        name: "Treasury 5Y",
        time: "17:40:00",
        value: "3.456",
        change: "+0.30%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "TREA_10Y": {
        name: "Treasury 10Y",
        time: "17:40:00",
        value: "4.567",
        change: "-0.40%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "TREA_30Y": {
        name: "Treasury 30Y",
        time: "17:40:00",
        value: "5.678",
        change: "+0.50%",
        parameter: "LEVEMENTE POSITIVO"
      }
    },
    economicDataUS: {
      "US_RATE": {
        name: "Taxa de Juros EUA",
        time: "17:40:00",
        value: "3.21%",
        change: "+0.10%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "US_CPI": {
        name: "Inflação EUA (CPI)",
        time: "17:40:00",
        value: "2.34%",
        change: "-0.20%",
        parameter: "LEVEMENTE NEGATIVO"
      }
    },
    economicDataBrazil: {
      "BR_SELIC": {
        name: "Taxa Selic",
        time: "17:40:00",
        value: "12.34%",
        change: "-0.10%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "BR_IPCA": {
        name: "Inflação (IPCA)",
        time: "17:40:00",
        value: "13.56%",
        change: "+0.20%",
        parameter: "LEVEMENTE POSITIVO"
      }
    }
  };
};

const getMockAdditionalData = (): any => {
  return {
    adrs: {
      "VALE": {
        name: "VALE",
        time: "17:40:00",
        value: "15.24",
        change: "-1.62%",
        prevChange: "-0.85%",
        afterChange: "-0.25%"
      },
      "PBR": {
        name: "PBR",
        time: "17:40:00",
        value: "14.88",
        change: "-0.67%",
        prevChange: "-1.20%",
        afterChange: "+0.45%"
      },
      "PBRA": {
        name: "PBRA",
        time: "17:40:00",
        value: "13.76",
        change: "-0.94%",
        prevChange: "-1.35%",
        afterChange: "+0.22%"
      },
      "ITUB": {
        name: "ITUB",
        time: "17:40:00",
        value: "6.81",
        change: "-0.87%",
        prevChange: "-1.02%",
        afterChange: "-0.15%"
      },
      "BBD": {
        name: "BBD",
        time: "17:40:00",
        value: "4.94",
        change: "-1.20%",
        prevChange: "-0.80%",
        afterChange: "-0.40%"
      },
      "BBDO": {
        name: "BBDO",
        time: "17:40:00",
        value: "4.87",
        change: "-1.22%",
        prevChange: "-0.82%",
        afterChange: "-0.41%"
      },
      "BSBR": {
        name: "BSBR",
        time: "17:40:00",
        value: "7.89",
        change: "-0.76%",
        prevChange: "-0.51%",
        afterChange: "-0.13%"
      }
    },
    commoditiesList: {
      "BRENT": {
        name: "Petróleo Brent",
        time: "17:40:00",
        value: "82.89",
        change: "-1.85%"
      },
      "WTI": {
        name: "Petróleo WTI",
        time: "17:40:00",
        value: "77.65",
        change: "-2.06%"
      },
      "IRON_SING": {
        name: "Minério de Ferro Singapura",
        time: "",
        value: "110.25",
        change: "-0.75%"
      },
      "IRON_DALIAN": {
        name: "Minério de Ferro Dalian",
        time: "17:40:00",
        value: "782.50",
        change: "-1.24%"
      }
    },
    marketIndices: {
      "SP500": {
        name: "S&P 500",
        time: "17:15:01",
        value: "5,435.02",
        change: "+0.34%",
        parameter: "LEVEMENTE POSITIVO",
        chart: ["5420", "5425", "5430", "5435", "5440", "5445"]
      },
      "DOW": {
        name: "Dow Jones",
        time: "17:15:01",
        value: "39,876.55",
        change: "+0.21%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "NASDAQ": {
        name: "Nasdaq 100",
        time: "17:15:01",
        value: "17,285.32",
        change: "+0.47%",
        parameter: "MODERADAMENTE POSITIVO"
      },
      "IBOV": {
        name: "IBOV",
        time: "17:21:00",
        value: "123.507,35",
        change: "-0.81%",
        chart: ["125571", "126521", "124380", "124850", "128218", "128552", "128531", "127308", "127600", "127128", "125401", "125979", "124768", "124798", "122799", "123046", "123357", "125034", "124519", "123507"]
      },
      "VALE3": {
        name: "VALE3",
        time: "17:21:00",
        value: "54.44",
        change: "+0.83%",
        chart: ["55.4", "55.16", "54.79", "54.86", "55.67", "55.37", "55.74", "55.69", "57.74", "58.16", "57.63", "57.07", "56.72", "56.3", "55.15", "55.59", "56.2", "57.02", "53.99", "54.44"]
      },
      "PETR4": {
        name: "PETR4",
        time: "17:21:00",
        value: "34.1",
        change: "-1.50%",
        chart: ["36.83", "36.83", "36.28", "36.32", "37.44", "37.67", "38.36", "38.44", "38.5", "38.39", "38.12", "37.95", "37.95", "36.61", "35.93", "34.62", "34.26", "34.63", "34.62", "34.1"]
      },
      "EWZ": {
        name: "EWZ",
        time: "17:00:09",
        value: "24.38",
        change: "+0.33%",
        chart: ["25.58", "25.79", "25.34", "25.46", "26.37", "26.39", "26.09", "26.2", "25.47", "25.06", "25.28", "24.88", "24.71", "24.11", "24.14", "23.91", "24.58", "24.57", "24.82", "24.38"]
      },
      "BIT_FUT": {
        name: "BIT FUT",
        time: "23:29:13",
        value: "83.035",
        change: "-0.04%"
      }
    },
    safetyAssets: {
      "GOLD": {
        name: "Ouro",
        time: "17:40:00",
        value: "1,234.56",
        change: "-0.50%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "DOLLAR": {
        name: "Dólar",
        time: "17:40:00",
        value: "5.678",
        change: "+0.10%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "TREA_2Y": {
        name: "Treasury 2Y",
        time: "17:40:00",
        value: "2.345",
        change: "-0.20%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "TREA_5Y": {
        name: "Treasury 5Y",
        time: "17:40:00",
        value: "3.456",
        change: "+0.30%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "TREA_10Y": {
        name: "Treasury 10Y",
        time: "17:40:00",
        value: "4.567",
        change: "-0.40%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "TREA_30Y": {
        name: "Treasury 30Y",
        time: "17:40:00",
        value: "5.678",
        change: "+0.50%",
        parameter: "LEVEMENTE POSITIVO"
      }
    },
    economicDataUS: {
      "US_RATE": {
        name: "Taxa de Juros EUA",
        time: "17:40:00",
        value: "3.21%",
        change: "+0.10%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "US_CPI": {
        name: "Inflação EUA (CPI)",
        time: "17:40:00",
        value: "2.34%",
        change: "-0.20%",
        parameter: "LEVEMENTE NEGATIVO"
      }
    },
    economicDataBrazil: {
      "BR_SELIC": {
        name: "Taxa Selic",
        time: "17:40:00",
        value: "12.34%",
        change: "-0.10%",
        parameter: "LEVEMENTE NEGATIVO"
      },
      "BR_IPCA": {
        name: "Inflação (IPCA)",
        time: "17:40:00",
        value: "13.56%",
        change: "+0.20%",
        parameter: "LEVEMENTE POSITIVO"
      }
    },
    vixChartData: ["-3.37%", "-3.37%", "-3.37%", "-3.37%", "-3.37%", "-3.37%"]
  };
};

