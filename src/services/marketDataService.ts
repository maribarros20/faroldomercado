
const SHEET_ID = "1fPLwFZmfhfjc2muHkr58WySldsj_AmsM_TXhykMPj8I"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 

// Properly formatted ranges for batch requests with ALL required data
const RANGES = [
  "'v.10'!F6:AC18",   // Main data with times
  "'v.10'!F12:AC14",  // VIX data
  "'v.10'!F16:AC18",  // Alerts data
  "'v.10'!F16:O28",   // Indices Futuros e Parametro do Índice Futuro
  "'v.10'!T16:AC28",  // Ativos de Segurança e Parâmetro dos Ativos de Segurança
  "'v.10'!T30:V33",   // IBOV
  "'v.10'!W30:AA33",  // VALE - VALE3
  "'v.10'!AB30:AC33", // PETROBRAS - PETR4
  "'v.10'!K30:M33",   // BIT FUT
  "'v.10'!F30:H33",   // EWZ
  "'v.10'!T35:W40",   // Dados Econômicos Estados Unidos
  "'v.10'!AA35:AC40"  // Dados Econômicos Brasil
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
  futureIndices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
    };
  };
  futureIndicesParameter: string;
  securityAssets: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  securityAssetsParameter: string;
  marketIndices: {
    ibov: {
      time: string;
      value: string;
      change: string;
      chart?: string[];
    };
    vale3: {
      time: string;
      value: string;
      change: string;
      chart?: string[];
    };
    petr4: {
      time: string;
      value: string;
      change: string;
      chart?: string[];
    };
    bitfut: {
      time: string;
      value: string;
      change: string;
    };
    ewz: {
      time: string;
      value: string;
      change: string;
    };
  };
  economicData: {
    us: {
      interestRate: {
        value: string;
        date: string;
      };
      inflation: {
        value: string;
        date: string;
        comment: string;
      };
    };
    brazil: {
      interestRate: {
        value: string;
        date: string;
      };
      inflation: {
        value: string;
        date: string;
        comment: string;
      };
    };
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
    
    // New data ranges
    const futureIndicesData = data.valueRanges[3].values || [];
    const securityAssetsData = data.valueRanges[4].values || [];
    const ibovData = data.valueRanges[5].values || [];
    const valeData = data.valueRanges[6].values || [];
    const petrData = data.valueRanges[7].values || [];
    const bitfutData = data.valueRanges[8].values || [];
    const ewzData = data.valueRanges[9].values || [];
    const usEconomicData = data.valueRanges[10].values || [];
    const brEconomicData = data.valueRanges[11].values || [];

    // Extract times from mainData (F6:AC6 row)
    const timesData = mainData[0] || [];
    
    // Process ADRs data
    const adrs: any = {};
    
    // Process Commodities data
    const commoditiesList: any = {};
    
    // Process Future Indices data
    const futureIndices: any = {};
    const futureIndicesNames = ["S&P 500", "Dow Jones", "Nasdaq", "Eu. Stoxx50", "FTSE100", "China A50"];
    
    if (futureIndicesData.length > 0) {
      // Extract parameter
      const futureIndicesParameter = futureIndicesData.find(row => row[0] === "PARÂMETRO DO ÍNDICE FUTURO")?.[0] || "";
      
      // Process each index
      futureIndicesData.forEach((row, index) => {
        if (row && row.length > 1 && futureIndicesNames.includes(row[0])) {
          const name = row[0];
          futureIndices[name] = {
            name: name,
            time: row[1] || "",
            value: row[2] || "0",
            change: row[3] ? (row[3].startsWith('+') || row[3].startsWith('-') ? row[3] : `${parseFloat(row[3]) >= 0 ? '+' : ''}${row[3]}`) : "0%"
          };
        }
      });
    }
    
    // Process Security Assets data
    const securityAssets: any = {};
    const securityAssetNames = ["OURO", "DÓLAR", "TREA_2A", "TREA_5A", "TREA_10A", "TREA_30A"];
    
    if (securityAssetsData.length > 0) {
      // Extract parameter
      const securityAssetsParameter = securityAssetsData.find(row => row[0] === "PARÂMETRO DOS ATIVOS DE SEGURANÇA")?.[0] || "";
      
      // Process each asset
      securityAssetsData.forEach((row, index) => {
        if (row && row.length > 1 && securityAssetNames.includes(row[0])) {
          const name = row[0];
          securityAssets[name] = {
            name: name,
            time: row[1] || "",
            value: row[2] || "0",
            change: row[3] ? (row[3].startsWith('+') || row[3].startsWith('-') ? row[3] : `${parseFloat(row[3]) >= 0 ? '+' : ''}${row[3]}`) : "0%",
            parameter: row[4] || ""
          };
        }
      });
    }
    
    // Process Market Indices
    const marketIndices: any = {
      ibov: { time: "", value: "", change: "", chart: [] },
      vale3: { time: "", value: "", change: "", chart: [] },
      petr4: { time: "", value: "", change: "", chart: [] },
      bitfut: { time: "", value: "", change: "" },
      ewz: { time: "", value: "", change: "" }
    };
    
    // Process IBOV data
    if (ibovData.length > 0) {
      marketIndices.ibov = {
        time: ibovData[0]?.[1] || "",
        value: ibovData[0]?.[2] || "0",
        change: ibovData[1]?.[0] || "0%",
        chart: ibovData[3] || []
      };
    }
    
    // Process VALE3 data
    if (valeData.length > 0) {
      marketIndices.vale3 = {
        time: valeData[0]?.[1] || "",
        value: valeData[0]?.[3] || "0",
        change: valeData[1]?.[0] || "0%",
        chart: valeData[3] || []
      };
    }
    
    // Process PETR4 data
    if (petrData.length > 0) {
      marketIndices.petr4 = {
        time: petrData[0]?.[1] || "",
        value: petrData[0]?.[2] || "0",
        change: petrData[1]?.[0] || "0%",
        chart: petrData[3] || []
      };
    }
    
    // Process BIT FUT data
    if (bitfutData.length > 0) {
      marketIndices.bitfut = {
        time: bitfutData[0]?.[1] || "",
        value: bitfutData[0]?.[2] || "0",
        change: bitfutData[1]?.[0] || "0%"
      };
    }
    
    // Process EWZ data
    if (ewzData.length > 0) {
      marketIndices.ewz = {
        time: ewzData[0]?.[1] || "",
        value: ewzData[0]?.[2] || "0",
        change: ewzData[1]?.[0] || "0%"
      };
    }
    
    // Process Economic Data
    const economicData: any = {
      us: {
        interestRate: { value: "", date: "" },
        inflation: { value: "", date: "", comment: "" }
      },
      brazil: {
        interestRate: { value: "", date: "" },
        inflation: { value: "", date: "", comment: "" }
      }
    };
    
    // US Economic Data
    if (usEconomicData.length > 0) {
      // Find interest rate data
      const interestRow = usEconomicData.findIndex(row => row[0] === "TAXA DE JUROS (SELIC)");
      if (interestRow >= 0 && interestRow + 1 < usEconomicData.length) {
        economicData.us.interestRate = {
          value: usEconomicData[interestRow + 1]?.[0] || "",
          date: usEconomicData[interestRow + 1]?.[1] || ""
        };
      }
      
      // Find inflation data
      const inflationRow = usEconomicData.findIndex(row => row[0] === "INFLAÇÃO (CPI)");
      if (inflationRow >= 0 && inflationRow + 1 < usEconomicData.length) {
        economicData.us.inflation = {
          value: usEconomicData[inflationRow + 1]?.[0] || "",
          date: usEconomicData[inflationRow + 1]?.[1] || "",
          comment: usEconomicData[inflationRow + 2]?.[0] || ""
        };
      }
    }
    
    // Brazil Economic Data
    if (brEconomicData.length > 0) {
      // Find interest rate data
      const interestRow = brEconomicData.findIndex(row => row[0] === "TAXA DE JUROS (SELIC)");
      if (interestRow >= 0 && interestRow + 1 < brEconomicData.length) {
        economicData.brazil.interestRate = {
          value: brEconomicData[interestRow + 1]?.[0] || "",
          date: brEconomicData[interestRow + 1]?.[1] || ""
        };
      }
      
      // Find inflation data
      const inflationRow = brEconomicData.findIndex(row => row[0] === "INFLAÇÃO (IPCA)");
      if (inflationRow >= 0 && inflationRow + 1 < brEconomicData.length) {
        economicData.brazil.inflation = {
          value: brEconomicData[inflationRow + 1]?.[0] || "",
          date: brEconomicData[inflationRow + 1]?.[1] || "",
          comment: brEconomicData[inflationRow + 2]?.[0] || ""
        };
      }
    }
    
    // Extract times from mainData (F6:AC6 row)
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
        footprint: alertsData[1] ? alertsData[1].filter(Boolean).join(" ") : "",
        indexation: alertsData[2] ? alertsData[2].filter(Boolean).join(" ") : ""
      },
      adrs,
      commoditiesList,
      futureIndices,
      futureIndicesParameter: futureIndicesData[0]?.[1] || "",
      securityAssets,
      securityAssetsParameter: securityAssetsData[0]?.[1] || "",
      marketIndices,
      economicData
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
    futureIndices: {
      "S&P 500": {
        name: "S&P 500",
        time: "17:59:58",
        value: "5,570.90",
        change: "-0.78%"
      },
      "Dow Jones": {
        name: "Dow Jones",
        time: "17:59:59",
        value: "41,432.20",
        change: "-1.15%"
      },
      "Nasdaq": {
        name: "Nasdaq",
        time: "17:59:59",
        value: "19,375.60",
        change: "-0.28%"
      },
      "Eu. Stoxx50": {
        name: "Eu. Stoxx50",
        time: "17:58:58",
        value: "5,336.00",
        change: "-0.89%"
      },
      "FTSE100": {
        name: "FTSE100",
        time: "17:58:58",
        value: "8,515.00",
        change: "-1.06%"
      },
      "China A50": {
        name: "China A50",
        time: "18:00:13",
        value: "13,262.00",
        change: "-0.02%"
      }
    },
    futureIndicesParameter: "FUTUROS DOS EUA NEGATIVO",
    securityAssets: {
      "OURO": {
        name: "OURO",
        time: "17:59:59",
        value: "2,922.80",
        change: "+0.81%",
        parameter: "ALTA MODERADA DO OURO; INVESTIDORES BUSCAM PROTEÇÃO."
      },
      "DÓLAR": {
        name: "DÓLAR",
        time: "17:59:59",
        value: "103.36",
        change: "-0.58%",
        parameter: "APETITE AO RISCO AUMENTA; ENTRADA DE CAPITAL ESTRANGEIRO."
      },
      "TREA_2A": {
        name: "TREA_2A",
        time: "18:05:00",
        value: "3.949",
        change: "+1.36%"
      },
      "TREA_5A": {
        name: "TREA_5A",
        time: "18:05:00",
        value: "4.04",
        change: "+1.78%"
      },
      "TREA_10A": {
        name: "TREA_10A",
        time: "18:01:45",
        value: "4.282",
        change: "+1.64%",
        parameter: "YIELDS ELEVADOS; FUGA DE RECURSOS PARA OS EUA."
      },
      "TREA_30A": {
        name: "TREA_30A",
        time: "18:03:31",
        value: "4.597",
        change: "+1.28%"
      }
    },
    securityAssetsParameter: "PARÂMETRO DOS ATIVOS DE SEGURANÇA",
    marketIndices: {
      ibov: {
        time: "17:21:00",
        value: "123,507.3",
        change: "-0.81%",
        chart: []
      },
      vale3: {
        time: "",
        value: "54.44",
        change: "+0.83%",
        chart: []
      },
      petr4: {
        time: "",
        value: "34.1",
        change: "-1.50%",
        chart: []
      },
      bitfut: {
        time: "18:00:00",
        value: "83.070",
        change: "+4.62%"
      },
      ewz: {
        time: "17:00:09",
        value: "24.38",
        change: "+0.33%"
      }
    },
    economicData: {
      us: {
        interestRate: {
          value: "4,50%",
          date: "19.03.2025"
        },
        inflation: {
          value: "3,00%",
          date: "12.03.2025",
          comment: "Progresso estagnado na contenção da inflação."
        }
      },
      brazil: {
        interestRate: {
          value: "13,25%",
          date: "19.03.2025"
        },
        inflation: {
          value: "4,56%",
          date: "12.03.2025",
          comment: "Acima da faixa de tolerância superior do BC de 4,5%, perspectiva de que a autoridade realizará outro aumento dos juros em março."
        }
      }
    }
  };
};
