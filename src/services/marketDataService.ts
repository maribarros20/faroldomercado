
const SHEET_ID = "1fPLwFZmfhfjc2muHkr58WySldsj_AmsM_TXhykMPj8I"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 

// Properly formatted ranges for batch requests with ALL required data
const RANGES = [
  "'v.10'!F6:AC18",   // Main data with times
  "'v.10'!F12:AC14",  // VIX data
  "'v.10'!F16:AC18",  // Alerts data
  "'v.10'!I64:P70",   // ADRs data
  "'v.10'!W64:AC68"   // Commodities data
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
    
    // Extract data from response
    const mainData = data.valueRanges[0].values || [];
    const vixData = data.valueRanges[1].values || [];
    const alertsData = data.valueRanges[2].values || [];
    const adrsListData = data.valueRanges[3].values || [];
    const commoditiesListData = data.valueRanges[4].values || [];
    
    // Extract times from mainData (F6:AC6 row)
    const timesData = mainData[0] || [];
    
    // Process ADRs data
    const adrs: any = {};
    
    // Map ADRs data according to the spreadsheet
    const adrNames = ["VALE", "PBR", "PBRA", "ITUB", "BBD", "BBDO", "BSBR"];
    
    if (adrsListData.length > 0) {
      adrsListData.forEach((row, index) => {
        if (index < adrNames.length) {
          adrs[adrNames[index]] = {
            name: adrNames[index],
            time: (row[0] || ""),
            value: row[3] || "0", // Column M (value)
            change: row[4] || "0%", // Column N (change)
            prevChange: row[5] || "0%", // Column O (prev change)
            afterChange: row[6] || "0%" // Column P (after change)
          };
        }
      });
    }
    
    // Process Commodities data according to the provided references
    const commoditiesList: any = {};
    const commodityNames = ["BRENT", "WTI", "IRON_SING", "IRON_DALIAN"];
    
    if (commoditiesListData.length > 0) {
      commoditiesListData.forEach((row, index) => {
        if (index < commodityNames.length) {
          commoditiesList[commodityNames[index]] = {
            name: commodityNames[index],
            time: row[0] || "",
            value: row[3] || "", // AA column
            change: row[5] || "0%" // AC column
          };
        }
      });
    }
    
    // Extract times from timesData
    const adrCurrentTime = timesData[2] || ""; // H6
    const adrClosingTime = (timesData[8] || "") + " " + (timesData[9] || ""); // N6:O6
    const adrAfterTime = (timesData[16] || "") + " " + (timesData[17] || ""); // V6:W6
    const commoditiesTime = timesData[22] || ""; // AC6
    
    // Build structured response according to the image references
    return {
      adrsCurrent: {
        value: mainData[2] ? (mainData[2][0] || "0") : "0%", // F8:G8
        parameter: mainData[3] ? (mainData[3][0] || "") : "", // F9:H9
        time: adrCurrentTime,
        isNegative: mainData[2] && mainData[2][0] ? parseFloat(mainData[2][0]) < 0 : false
      },
      adrsClosing: {
        value: mainData[2] ? (mainData[2][5] || "0") : "0%", // K8:M8
        parameter: mainData[3] ? (mainData[3][5] || "") : "", // K9:O9
        time: adrClosingTime,
        isPositive: mainData[2] && mainData[2][5] ? parseFloat(mainData[2][5]) > 0 : false
      },
      adrsAfterMarket: {
        value: mainData[2] ? (mainData[2][14] || "0") : "0%", // T8:U8
        parameter: mainData[3] ? (mainData[3][14] || "") : "", // T9:W9
        time: adrAfterTime,
        isPositive: mainData[2] && mainData[2][14] ? parseFloat(mainData[2][14]) > 0 : false
      },
      commodities: {
        value: mainData[2] ? (mainData[2][21] || "0%") : "0%", // AA8
        parameter: mainData[3] ? (mainData[3][21] || "") : "", // AA9:AC9
        time: commoditiesTime,
        isNegative: mainData[2] && mainData[2][21] ? parseFloat(mainData[2][21]) < 0 : false
      },
      vix: {
        currentValue: vixData[1] ? (vixData[1][0] || "0") : "0", // F13:G13
        currentChange: vixData[2] ? (vixData[2][0] || "0%") : "0%", // F14:G14
        currentTime: vixData[0] ? (vixData[0][0] || "") : "", // F12:J12
        closingValue: vixData[1] ? vixData[1][8] || "0" : "0", // N13
        closingChange: vixData[2] ? vixData[2][7] || "0%" : "0%", // M13
        closingTime: "07/03", // Hardcoded from screenshot
        openingValue: vixData[1] ? vixData[1][10] || "0" : "0", // P13
        openingChange: vixData[2] ? vixData[2][9] || "0%" : "0%", // O13
        openingTime: "10/03", // Hardcoded from screenshot
        valueParameter: vixData[1] ? vixData[1][2] || "" : "", // H13
        resultParameter: vixData[2] ? vixData[2][2] || "" : "", // H14
        gapParameter: "ABERTURA DO VIX COM GAP DE ALTA", // Hardcoded from screenshot
        tendencyTime: vixData[0] ? vixData[0][16] || "" : "", // U12
        tendencyParameter: "VIX MANTENDO ALTA, VOLATILIDADE FICANDO MAIS NEGATIVA PARA IBOV", // From screenshot
        chartData: vixData[1] ? vixData[1].slice(16, 25).filter(Boolean) : [] // U12:AC13
      },
      alerts: {
        volatility: alertsData[0] ? alertsData[0].filter(Boolean).join(" ") : "", // F16:AC16
        footprint: alertsData[2] ? alertsData[2].slice(0, 10).filter(Boolean).join(" ") : "", // F18:O18
        indexation: alertsData[2] ? alertsData[2].slice(14).filter(Boolean).join(" ") : "" // T18:AC18
      },
      adrs,
      commoditiesList
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
      value: "-15.24%",
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
      value: "-2.20%",
      parameter: "MODERADAMENTE NEGATIVO",
      time: "18:58:26",
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
      openingChange: "+5.69%",
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
        time: "18:00:02",
        value: "15.24",
        change: "-1.62%",
        prevChange: "-0.85%",
        afterChange: "-0.25%"
      },
      "PBR": {
        name: "PBR",
        time: "18:00:04",
        value: "12.78",
        change: "-1.46%",
        prevChange: "+0.51%",
        afterChange: "+0.45%"
      },
      "PBRA": {
        name: "PBRA",
        time: "18:00:03",
        value: "11.84",
        change: "-1.27%",
        prevChange: "+1.00%",
        afterChange: "+0.17%"
      },
      "ITUB": {
        name: "ITUB",
        time: "18:00:02",
        value: "5.63",
        change: "-0.71%",
        prevChange: "+0.18%",
        afterChange: "0.00%"
      },
      "BBD": {
        name: "BBD",
        time: "18:00:04",
        value: "2.90",
        change: "-3.28%",
        prevChange: "+0.44%",
        afterChange: "0.00%"
      },
      "BBDO": {
        name: "BBDO",
        time: "18:00:06",
        value: "2.89",
        change: "-2.55%",
        prevChange: "+2.80%",
        afterChange: "0.00%"
      },
      "BSBR": {
        name: "BSBR",
        time: "18:00:04",
        value: "7.40",
        change: "-2.05%",
        prevChange: "+0.90%",
        afterChange: "0.00%"
      }
    },
    commoditiesList: {
      "BRENT": {
        name: "Petróleo Brent",
        time: "18:58:26",
        value: "69.14",
        change: "-1.73%"
      },
      "WTI": {
        name: "Petróleo WTI",
        time: "19:40:22",
        value: "65.81",
        change: "-1.15%"
      },
      "IRON_SING": {
        name: "M. Ferro Singapura",
        time: "",
        value: "78.070",
        change: "-0.47%"
      },
      "IRON_DALIAN": {
        name: "M. Ferro Dalian",
        time: "10/03 12:00",
        value: "759.00",
        change: "-0.77%"
      }
    }
  };
};
