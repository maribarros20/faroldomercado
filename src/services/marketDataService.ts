const SHEET_ID = "1fPLwFZmfhfjc2muHkr58WySldsj_AmsM_TXhykMPj8I"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 
const SHEET_NAME = "V.10";

// Properly formatted ranges for batch requests with core data
const RANGES = [
  "'V.10'!F6:AC18",   // Main data with times
  "'V.10'!F12:AC14",  // VIX data
  "'V.10'!F16:AC18"   // Alerts data
];

// Ranges for additional market data
const ADDITIONAL_RANGES = {
  indicesFuturos: "'V.10'!F16:O28",
  ativosSeguranca: "'V.10'!T16:AC28",
  ibov: "'V.10'!T30:V33",
  vale: "'V.10'!W30:AA33",
  petrobras: "'V.10'!AB30:AC33",
  bitFut: "'V.10'!K30:M33",
  ewz: "'V.10'!F30:H33",
  dadosEUA: "'V.10'!T35:W40",
  dadosBrasil: "'V.10'!AA35:AC40"
};

// Chart data mappings
const GRAPH_RANGES = {
  vixTrend: "'VIX'!C2:C400",
  ibovChart: "'spik'!F4:F70",
  valeChart: "'spik'!J4:J70",
  petrobrasChart: "'spik'!B4:B70",
  ewzChart: "'spik'!O4:O70"
};

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
    const alertsData = data.valueRanges[2]?.values || [];
    
    // Extract times from mainData (F6:AC6 row)
    const timesData = mainData[1] || [];
    
    // VIX data is in mainData rows 3-4
    const vixData = [
      mainData[1] || [], // times
      mainData[3] || [], // values
      mainData[4] || []  // changes
    ];
    
    // Fetch additional market data
    const additionalData = await fetchAdditionalMarketData();
    
    // Define isNegative and isPositive indicators based on values
    const adrsCurrentValue = mainData[2] && mainData[2][0] ? parseFloat(mainData[2][0]) : 0;
    const adrsClosingValue = mainData[2] && mainData[2][7] ? parseFloat(mainData[2][7]) : 0;
    const adrsAfterValue = mainData[2] && mainData[2][14] ? parseFloat(mainData[2][14]) : 0;
    const commoditiesValue = mainData[2] && mainData[2][21] ? parseFloat(mainData[2][21]) : 0;
    
    // Build structured response according to correct cell references
    return {
      adrsCurrent: {
        value: mainData[2] ? (mainData[2][0] || "0") : "0%",
        parameter: mainData[4] ? (mainData[4][0] || "") : "",
        time: timesData[0] || "",
        isNegative: adrsCurrentValue < 0
      },
      adrsClosing: {
        value: mainData[2] ? (mainData[2][7] || "0") : "0%",
        parameter: mainData[4] ? (mainData[4][7] || "") : "",
        time: (timesData[7] || ""),
        isPositive: adrsClosingValue > 0
      },
      adrsAfterMarket: {
        value: mainData[2] ? (mainData[2][14] || "0") : "0%",
        parameter: mainData[4] ? (mainData[4][14] || "") : "",
        time: (timesData[14] || ""),
        isPositive: adrsAfterValue > 0
      },
      commodities: {
        value: mainData[2] ? (mainData[2][21] || "0%") : "0%",
        parameter: mainData[4] ? (mainData[4][21] || "") : "",
        time: timesData[21] || "",
        isNegative: commoditiesValue < 0
      },
      vix: {
        currentValue: vixData[1] ? (vixData[1][0] || "0") : "0",
        currentChange: vixData[2] ? (vixData[2][0] || "0%") : "0%",
        currentTime: vixData[0] ? (vixData[0][0] || "") : "",
        closingValue: vixData[1] ? vixData[1][7] || "0" : "0",
        closingChange: vixData[2] ? vixData[2][7] || "0%" : "0%",
        closingTime: vixData[0] ? vixData[0][7] || "" : "",
        openingValue: vixData[1] ? vixData[1][9] || "0" : "0",
        openingChange: vixData[1] ? vixData[1][10] || "0%" : "0%",
        openingTime: vixData[0] ? vixData[0][9] || "" : "",
        valueParameter: vixData[1] ? vixData[1][2] || "" : "",
        resultParameter: vixData[2] ? vixData[2][2] || "" : "",
        gapParameter: vixData[2] ? (vixData[2][10] || "") : "",
        tendencyTime: vixData[0] ? vixData[0][14] || "" : "",
        tendencyParameter: vixData[2] ? (vixData[2][14] || "") : "",
        chartData: additionalData.vixChartData || []
      },
      alerts: {
        volatility: alertsData[0] ? alertsData[0].filter(Boolean).join(" ") : "",
        footprint: alertsData[2] ? alertsData[2].slice(0, 10).filter(Boolean).join(" ") : "",
        indexation: alertsData[2] ? alertsData[2].slice(14).filter(Boolean).join(" ") : ""
      },
      adrs: additionalData.adrs || {}, 
      commoditiesList: additionalData.commoditiesList || {},
      marketIndices: additionalData.marketIndices || {},
      safetyAssets: additionalData.safetyAssets || {},
      economicDataUS: additionalData.economicDataUS || {},
      economicDataBrazil: additionalData.economicDataBrazil || {}
    };
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return getMockMarketData();
  }
};

// New function to fetch additional market data
const fetchAdditionalMarketData = async () => {
  try {
    // Prepare batch requests for all additional ranges
    const allRanges = [
      ...Object.entries(ADDITIONAL_RANGES).map(([key, range]) => `ranges=${encodeURIComponent(range)}`),
      ...Object.entries(GRAPH_RANGES).map(([key, range]) => `ranges=${encodeURIComponent(range)}`)
    ];
    
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${allRanges.join('&')}&key=${API_KEY}`;
    
    console.log("Fetching additional market data from:", batchUrl);
    const response = await fetch(batchUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error (Additional Data):", errorData);
      throw new Error(`API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.valueRanges || data.valueRanges.length === 0) {
      throw new Error("No additional data found");
    }
    
    console.log("Raw additional data:", data);
    
    const rangeData = {
      indicesFuturos: data.valueRanges[0]?.values || [],
      ativosSeguranca: data.valueRanges[1]?.values || [],
      ibov: data.valueRanges[2]?.values || [],
      vale: data.valueRanges[3]?.values || [],
      petrobras: data.valueRanges[4]?.values || [],
      bitFut: data.valueRanges[5]?.values || [],
      ewz: data.valueRanges[6]?.values || [],
      dadosEUA: data.valueRanges[7]?.values || [],
      dadosBrasil: data.valueRanges[8]?.values || [],
      vixTrend: data.valueRanges[9]?.values || [],
      ibovChart: data.valueRanges[10]?.values || [],
      valeChart: data.valueRanges[11]?.values || [],
      petrobrasChart: data.valueRanges[12]?.values || [],
      ewzChart: data.valueRanges[13]?.values || []
    };
    
    // Build ADR data
    const adrs: any = {
      "VALE": {
        name: "VALE",
        time: rangeData.vale[1]?.[0] || "Dados atuais",
        value: rangeData.vale[2]?.[3] || "0",
        change: rangeData.vale[2]?.[0] || "0%",
        prevChange: "0%",
        afterChange: "0%"
      },
      "PBR": {
        name: "PBR",
        time: rangeData.petrobras[1]?.[0] || "Dados atuais",
        value: rangeData.petrobras[2]?.[1] || "0",
        change: rangeData.petrobras[2]?.[0] || "0%",
        prevChange: "0%",
        afterChange: "0%"
      },
      "PBRA": {
        name: "PBRA",
        time: "Dados atuais",
        value: "0",
        change: "0%",
        prevChange: "0%",
        afterChange: "0%"
      },
      "ITUB": {
        name: "ITUB",
        time: "Dados atuais",
        value: "0",
        change: "0%",
        prevChange: "0%",
        afterChange: "0%"
      },
      "BBD": {
        name: "BBD",
        time: "Dados atuais",
        value: "0",
        change: "0%",
        prevChange: "0%",
        afterChange: "0%"
      },
      "BBDO": {
        name: "BBDO",
        time: "Dados atuais",
        value: "0",
        change: "0%",
        prevChange: "0%",
        afterChange: "0%"
      },
      "BSBR": {
        name: "BSBR",
        time: "Dados atuais",
        value: "0",
        change: "0%",
        prevChange: "0%",
        afterChange: "0%"
      }
    };
    
    // Build commodities data
    const commoditiesList: any = {
      "BRENT": {
        name: "Petróleo Brent",
        time: "Dados atuais",
        value: "0",
        change: "0%"
      },
      "WTI": {
        name: "Petróleo WTI",
        time: "Dados atuais",
        value: "0",
        change: "0%"
      },
      "IRON_SING": {
        name: "Minério de Ferro Singapura",
        time: "Dados atuais",
        value: "0",
        change: "0%"
      },
      "IRON_DALIAN": {
        name: "Minério de Ferro Dalian",
        time: "Dados atuais",
        value: "0",
        change: "0%"
      }
    };
    
    // Process market indices (futures)
    const marketIndices: any = {};
    
    // Process futures indices data
    if (rangeData.indicesFuturos.length > 0) {
      // S&P 500
      if (rangeData.indicesFuturos.length > 2) {
        marketIndices["SP500"] = {
          name: "S&P 500",
          time: rangeData.indicesFuturos[1]?.[2] || "",
          value: rangeData.indicesFuturos[2]?.[2] || "0",
          change: rangeData.indicesFuturos[2]?.[0] || "0%",
          parameter: rangeData.indicesFuturos[1]?.[3] || ""
        };
      }
      
      // Dow Jones
      if (rangeData.indicesFuturos.length > 4) {
        marketIndices["DOW"] = {
          name: "Dow Jones",
          time: rangeData.indicesFuturos[3]?.[2] || "",
          value: rangeData.indicesFuturos[4]?.[2] || "0",
          change: rangeData.indicesFuturos[4]?.[0] || "0%"
        };
      }
      
      // Nasdaq
      if (rangeData.indicesFuturos.length > 6) {
        marketIndices["NASDAQ"] = {
          name: "Nasdaq 100",
          time: rangeData.indicesFuturos[5]?.[2] || "",
          value: rangeData.indicesFuturos[6]?.[2] || "0",
          change: rangeData.indicesFuturos[6]?.[0] || "0%"
        };
      }
      
      // Euro Stoxx
      if (rangeData.indicesFuturos.length > 8) {
        marketIndices["EURO_STOXX"] = {
          name: "Euro Stoxx 50",
          time: rangeData.indicesFuturos[7]?.[2] || "",
          value: rangeData.indicesFuturos[8]?.[2] || "0",
          change: rangeData.indicesFuturos[8]?.[0] || "0%"
        };
      }
      
      // FTSE100
      if (rangeData.indicesFuturos.length > 10) {
        marketIndices["FTSE100"] = {
          name: "FTSE 100",
          time: rangeData.indicesFuturos[9]?.[2] || "",
          value: rangeData.indicesFuturos[10]?.[2] || "0",
          change: rangeData.indicesFuturos[10]?.[0] || "0%"
        };
      }
      
      // China A50
      if (rangeData.indicesFuturos.length > 12) {
        marketIndices["CHINA_A50"] = {
          name: "China A50",
          time: rangeData.indicesFuturos[11]?.[2] || "",
          value: rangeData.indicesFuturos[12]?.[2] || "0",
          change: rangeData.indicesFuturos[12]?.[0] || "0%"
        };
      }
    }
    
    // Process safety assets
    const safetyAssets: any = {};
    
    if (rangeData.ativosSeguranca.length > 0) {
      // Gold
      if (rangeData.ativosSeguranca.length > 2) {
        safetyAssets["GOLD"] = {
          name: "Ouro",
          time: rangeData.ativosSeguranca[1]?.[2] || "",
          value: rangeData.ativosSeguranca[2]?.[2] || "0",
          change: rangeData.ativosSeguranca[2]?.[0] || "0%",
          parameter: rangeData.ativosSeguranca[1]?.[3] || ""
        };
      }
      
      // Dollar
      if (rangeData.ativosSeguranca.length > 4) {
        safetyAssets["DOLLAR"] = {
          name: "Dólar",
          time: rangeData.ativosSeguranca[3]?.[2] || "",
          value: rangeData.ativosSeguranca[4]?.[2] || "0",
          change: rangeData.ativosSeguranca[4]?.[0] || "0%",
          parameter: rangeData.ativosSeguranca[3]?.[3] || ""
        };
      }
      
      // Treasury 2Y
      if (rangeData.ativosSeguranca.length > 6) {
        safetyAssets["TREA_2Y"] = {
          name: "Treasury 2Y",
          time: rangeData.ativosSeguranca[5]?.[2] || "",
          value: rangeData.ativosSeguranca[6]?.[2] || "0",
          change: rangeData.ativosSeguranca[6]?.[0] || "0%"
        };
      }
      
      // Treasury 5Y
      if (rangeData.ativosSeguranca.length > 8) {
        safetyAssets["TREA_5Y"] = {
          name: "Treasury 5Y",
          time: rangeData.ativosSeguranca[7]?.[2] || "",
          value: rangeData.ativosSeguranca[8]?.[2] || "0",
          change: rangeData.ativosSeguranca[8]?.[0] || "0%"
        };
      }
      
      // Treasury 10Y
      if (rangeData.ativosSeguranca.length > 10) {
        safetyAssets["TREA_10Y"] = {
          name: "Treasury 10Y",
          time: rangeData.ativosSeguranca[9]?.[2] || "",
          value: rangeData.ativosSeguranca[10]?.[2] || "0",
          change: rangeData.ativosSeguranca[10]?.[0] || "0%",
          parameter: rangeData.ativosSeguranca[9]?.[3] || ""
        };
      }
      
      // Treasury 30Y
      if (rangeData.ativosSeguranca.length > 12) {
        safetyAssets["TREA_30Y"] = {
          name: "Treasury 30Y",
          time: rangeData.ativosSeguranca[11]?.[2] || "",
          value: rangeData.ativosSeguranca[12]?.[2] || "0",
          change: rangeData.ativosSeguranca[12]?.[0] || "0%"
        };
      }
    }
    
    // Process IBOV, VALE, PETR4, etc. data
    const ibov = {
      name: "IBOV",
      time: rangeData.ibov[1]?.[0] || "",
      value: rangeData.ibov[2]?.[2] || "0",
      change: rangeData.ibov[2]?.[0] || "0%",
      chart: rangeData.ibovChart.map(row => row?.[0] || "0").filter(Boolean)
    };
    
    const vale = {
      name: "VALE3",
      time: rangeData.vale[1]?.[0] || "",
      value: rangeData.vale[2]?.[3] || "0",
      change: rangeData.vale[2]?.[0] || "0%",
      chart: rangeData.valeChart.map(row => row?.[0] || "0").filter(Boolean)
    };
    
    const petrobras = {
      name: "PETR4",
      time: rangeData.petrobras[1]?.[0] || "",
      value: rangeData.petrobras[2]?.[1] || "0",
      change: rangeData.petrobras[2]?.[0] || "0%",
      chart: rangeData.petrobrasChart.map(row => row?.[0] || "0").filter(Boolean)
    };
    
    const bitfut = {
      name: "BIT_FUT",
      time: rangeData.bitFut[1]?.[0] || "",
      value: rangeData.bitFut[2]?.[2] || "0",
      change: rangeData.bitFut[2]?.[0] || "0%"
    };
    
    const ewz = {
      name: "EWZ",
      time: rangeData.ewz[1]?.[0] || "",
      value: rangeData.ewz[2]?.[2] || "0",
      change: rangeData.ewz[2]?.[0] || "0%",
      chart: rangeData.ewzChart.map(row => row?.[0] || "0").filter(Boolean)
    };
    
    // Add to market indices
    marketIndices["IBOV"] = ibov;
    marketIndices["VALE3"] = vale;
    marketIndices["PETR4"] = petrobras;
    marketIndices["BIT_FUT"] = bitfut;
    marketIndices["EWZ"] = ewz;
    
    // Process US economic data
    const economicDataUS: any = {};
    
    if (rangeData.dadosEUA.length > 0) {
      economicDataUS["US_RATE"] = {
        name: "Taxa de Juros EUA",
        time: rangeData.dadosEUA[2]?.[1] || "",
        value: rangeData.dadosEUA[2]?.[0] || "0",
        change: "0%",
        parameter: ""
      };
      
      economicDataUS["US_CPI"] = {
        name: "Inflação EUA (CPI)",
        time: rangeData.dadosEUA[4]?.[1] || "",
        value: rangeData.dadosEUA[4]?.[0] || "0",
        change: "0%",
        parameter: rangeData.dadosEUA[5]?.[0] || ""
      };
    }
    
    // Process Brazil economic data
    const economicDataBrazil: any = {};
    
    if (rangeData.dadosBrasil.length > 0) {
      economicDataBrazil["BR_SELIC"] = {
        name: "Taxa Selic",
        time: rangeData.dadosBrasil[2]?.[1] || "",
        value: rangeData.dadosBrasil[2]?.[0] || "0",
        change: "0%",
        parameter: ""
      };
      
      economicDataBrazil["BR_IPCA"] = {
        name: "Inflação (IPCA)",
        time: rangeData.dadosBrasil[4]?.[1] || "",
        value: rangeData.dadosBrasil[4]?.[0] || "0",
        change: "0%",
        parameter: rangeData.dadosBrasil[5]?.[0] || ""
      };
    }
    
    // Extract VIX chart data
    const vixChartData = rangeData.vixTrend.map(row => row?.[0] || "0").filter(Boolean);
    
    return {
      marketIndices,
      safetyAssets,
      economicDataUS,
      economicDataBrazil,
      adrs,
      commoditiesList,
      vixChartData
    };
  } catch (error) {
    console.error("Error fetching additional market data:", error);
    return getMockAdditionalData();
  }
};

// Mock data for testing or when API fails
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
        value: "19,235.87",
        change: "+0.47%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "US_FUTURES": {
        name: "US Futures",
        time: "17:15:01",
        value: "5,440.25",
        change: "+0.42%",
        parameter: "LEVEMENTE POSITIVO"
      },
      "EURO_STOXX": {
        name: "Euro Stoxx 5
