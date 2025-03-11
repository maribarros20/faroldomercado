
const SHEET_ID = "1fPLwFZmfhfjc2muHkr58WySldsj_AmsM_TXhykMPj8I"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 

// Properly formatted ranges for batch requests with ALL required data
const RANGES = [
  "'v.10'!F6:AC18",   // Main data with times
  "'v.10'!F12:AC14",  // VIX data
  "'v.10'!F16:AC18",  // Alerts data
  "'v.10'!I64:P70",   // ADRs data
  "'v.10'!W64:AC68",  // Commodities data
  "'v.10'!F16:AC33",  // Additional market data
  "'v.10'!T35:AC40"   // Market metrics
];

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
    closingValue: string;
    closingChange: string;
    closingTime: string;
    openingValue: string;
    openingChange: string;
    openingTime: string;
    valueParameter: string;
    resultParameter: string;
    gapParameter: string;
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
  additionalMarketData: {
    rows: {
      label: string;
      values: string[];
      time?: string;
    }[];
    headers: string[];
  };
  marketMetrics: {
    rows: {
      label: string;
      values: string[];
    }[];
    headers: string[];
  };
}

export const fetchMarketData = async (): Promise<MarketDataResponse> => {
  try {
    // Format ranges properly for the API
    const encodedRanges = RANGES.map(range => `ranges=${encodeURIComponent(range)}`).join('&');
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
    
    // Extract data from response - using proper indices according to cell references
    const mainData = data.valueRanges[0].values || [];
    const vixData = data.valueRanges[1].values || [];
    const alertsData = data.valueRanges[2].values || [];
    const adrsListData = data.valueRanges[3].values || [];
    const commoditiesListData = data.valueRanges[4].values || [];
    const additionalMarketData = data.valueRanges[5].values || [];
    const marketMetricsData = data.valueRanges[6].values || [];
    
    // Extract times from mainData (F6:AC6 row)
    const timesData = mainData[0] || [];
    
    // Process ADRs data
    const adrs: any = {};
    
    // Map ADRs data with proper names
    const adrNames = ["VALE", "PBR", "PBRA", "ITUB", "BBD", "BBDO", "BSBR"];
    
    if (adrsListData.length > 0) {
      adrsListData.forEach((row, index) => {
        if (index < adrNames.length) {
          adrs[adrNames[index]] = {
            name: adrNames[index],
            time: (row[0] || ""),
            value: row[4] || "0",
            change: row[5] || "0%",
            prevChange: row[6] || "0%",
            afterChange: row[7] || "0%"
          };
        }
      });
    }
    
    // Process Commodities data
    const commoditiesList: any = {};
    const commodityNames = ["BRENT", "WTI", "IRON_SING", "IRON_DALIAN"];
    
    if (commoditiesListData.length > 0) {
      commoditiesListData.forEach((row, index) => {
        if (index < commodityNames.length) {
          commoditiesList[commodityNames[index]] = {
            name: commodityNames[index],
            time: index < 2 ? ((row[0] || "")) : (index === 3 ? (row[0] || "") : ""),
            value: index < 2 ? (row[4] || "") : (row[3] || ""),
            change: index < 2 ? (row[6] || "0%") : (row[4] || "0%")
          };
        }
      });
    }
    
    // Process Additional Market Data (F16:AC33)
    const additionalMarketDataProcessed = {
      rows: [] as any[],
      headers: [] as string[]
    };
    
    if (additionalMarketData.length > 0) {
      // Extract headers from the first row
      additionalMarketDataProcessed.headers = additionalMarketData[0].map((header: string) => header || "");
      
      // Process data rows
      for (let i = 1; i < additionalMarketData.length; i++) {
        const row = additionalMarketData[i];
        if (row && row.length > 0) {
          additionalMarketDataProcessed.rows.push({
            label: row[0] || `Row ${i}`,
            values: row.slice(1) || [],
            time: row[1] || "" // Assuming the second column has time information
          });
        }
      }
    }
    
    // Process Market Metrics Data (T35:AC40)
    const marketMetricsProcessed = {
      rows: [] as any[],
      headers: [] as string[]
    };
    
    if (marketMetricsData.length > 0) {
      // Extract headers from the first row
      marketMetricsProcessed.headers = marketMetricsData[0].map((header: string) => header || "");
      
      // Process data rows
      for (let i = 1; i < marketMetricsData.length; i++) {
        const row = marketMetricsData[i];
        if (row && row.length > 0) {
          marketMetricsProcessed.rows.push({
            label: row[0] || `Row ${i}`,
            values: row.slice(1) || []
          });
        }
      }
    }
    
    // Extract times from timesData
    const adrCurrentTime = timesData[2] || "";
    const adrClosingTime = (timesData[8] || "") + " " + (timesData[9] || "");
    const adrAfterTime = (timesData[16] || "") + " " + (timesData[17] || "");
    const commoditiesTime = timesData[22] || "";
    
    // Build structured response according to correct cell references
    return {
      adrsCurrent: {
        value: mainData[2] ? (mainData[2][0] || "0") : "0%",
        parameter: mainData[3] ? (mainData[3][0] || "") : "",
        time: adrCurrentTime,
        isNegative: mainData[2] && mainData[2][0] ? parseFloat(mainData[2][0]) < 0 : false
      },
      adrsClosing: {
        value: mainData[2] ? (mainData[2][5] || "0") : "0%",
        parameter: mainData[3] ? (mainData[3][5] || "") : "",
        time: adrClosingTime,
        isPositive: mainData[2] && mainData[2][5] ? parseFloat(mainData[2][5]) > 0 : false
      },
      adrsAfterMarket: {
        value: mainData[2] ? (mainData[2][14] || "0") : "0%",
        parameter: mainData[3] ? (mainData[3][14] || "") : "",
        time: adrAfterTime,
        isPositive: mainData[2] && mainData[2][14] ? parseFloat(mainData[2][14]) > 0 : false
      },
      commodities: {
        value: mainData[2] ? (mainData[2][21] || "0%") : "0%",
        parameter: mainData[3] ? (mainData[3][21] || "") : "",
        time: commoditiesTime,
        isNegative: mainData[2] && mainData[2][21] ? parseFloat(mainData[2][21]) < 0 : false
      },
      vix: {
        currentValue: vixData[1] ? (vixData[1][0] || "0") : "0",
        currentChange: vixData[2] ? (vixData[2][0] || "0%") : "0%",
        currentTime: vixData[0] ? (vixData[0][0] || "") : "",
        closingValue: vixData[1] ? vixData[1][8] || "0" : "0",
        closingChange: vixData[2] ? vixData[2][7] || "0%" : "0%",
        closingTime: vixData[0] ? vixData[0][7] || "" : "",
        openingValue: vixData[1] ? vixData[1][10] || "0" : "0",
        openingChange: vixData[1] ? vixData[1][9] || "0%" : "0%",
        openingTime: vixData[0] ? vixData[0][9] || "" : "",
        valueParameter: vixData[1] ? vixData[1][2] || "" : "",
        resultParameter: vixData[2] ? vixData[2][2] || "" : "",
        gapParameter: vixData[2] ? (vixData[2][7] || "") : "",
        tendencyTime: vixData[0] ? vixData[0][14] || "" : "",
        tendencyParameter: vixData[2] ? (vixData[2][14] || "") : "",
        chartData: vixData[1] ? vixData[1].slice(15).filter(Boolean) : []
      },
      alerts: {
        volatility: alertsData[0] ? alertsData[0].filter(Boolean).join(" ") : "",
        footprint: alertsData[2] ? alertsData[2].slice(0, 10).filter(Boolean).join(" ") : "",
        indexation: alertsData[2] ? alertsData[2].slice(14).filter(Boolean).join(" ") : ""
      },
      adrs,
      commoditiesList,
      additionalMarketData: additionalMarketDataProcessed,
      marketMetrics: marketMetricsProcessed
    };
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return getMockMarketData();
  }
};

// Mock data for testing or when API fails
const getMockMarketData = (): MarketDataResponse => {
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
      closingValue: "23.37",
      closingChange: "-6.03%",
      closingTime: "07/03",
      openingValue: "24.70",
      openingChange: "5.69%",
      openingTime: "10/03",
      valueParameter: "REGIÃO DE VALOR NEUTRA",
      resultParameter: "VOLATILIDADE NEGATIVA MUITO ALTA",
      gapParameter: "ABERTURA DO VIX COM GAP DE ALTA",
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
    additionalMarketData: {
      headers: ["Indicador", "Valor Atual", "Variação", "Status", "Tendência"],
      rows: [
        {
          label: "IBOV",
          values: ["127.450", "-1.25%", "NEGATIVO", "QUEDA"],
          time: "17:40:00"
        },
        {
          label: "Dólar",
          values: ["5.12", "+0.75%", "POSITIVO", "ALTA"],
          time: "17:40:00"
        },
        {
          label: "S&P 500",
          values: ["5.230", "-0.65%", "NEUTRO", "LATERAL"],
          time: "17:40:00"
        },
        {
          label: "Nasdaq",
          values: ["16.430", "-0.92%", "NEGATIVO", "QUEDA"],
          time: "17:40:00"
        }
      ]
    },
    marketMetrics: {
      headers: ["Métrica", "Valor", "Status", "Impacto"],
      rows: [
        {
          label: "Put/Call Ratio",
          values: ["1.25", "ALTO", "NEGATIVO"]
        },
        {
          label: "Volatilidade Implícita",
          values: ["22.5%", "ELEVADA", "CAUTELA"]
        },
        {
          label: "Volume Médio",
          values: ["85%", "ABAIXO", "NEUTRO"]
        },
        {
          label: "Índice de Força",
          values: ["42", "FRACO", "NEGATIVO"]
        }
      ]
    }
  };
};
