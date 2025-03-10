
const SHEET_ID = "1fPLwFZmfhfjc2muHkr58WySldsj_AmsM_TXhykMPj8I"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 

// Properly formatted ranges for batch requests
const RANGES = [
  "'v.10'!F8:AC18",
  "'v.10'!F12:AC14",
  "'v.10'!F16:AC18",
  "'v.10'!I64:P70",
  "'v.10'!W64:AC68",
  "'v.10'!F6:W6"
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
    
    // Extract data from response - using proper indices
    const mainData = data.valueRanges[0].values || [];
    const vixData = data.valueRanges[1].values || [];
    const alertsData = data.valueRanges[2].values || [];
    const adrsListData = data.valueRanges[3].values || [];
    const commoditiesListData = data.valueRanges[4].values || [];
    const timesData = data.valueRanges[5].values || [];
    
    // Process ADRs data
    const adrs: any = {};
    
    // Map ADRs data with proper names
    const adrNames = ["VALE", "PBR", "PBRA", "ITUB", "BBD", "BBDO", "BSBR"];
    
    if (adrsListData.length > 0) {
      adrsListData.forEach((row, index) => {
        if (index < adrNames.length) {
          adrs[adrNames[index]] = {
            name: adrNames[index],
            time: (row[0] || "") + " " + (row[3] || ""),
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
            time: index < 2 ? ((row[0] || "") + " " + (row[3] || "")) : "",
            value: (row[4] || "") + (row[5] || ""),
            change: row[6] || "0%"
          };
        }
      });
    }
    
    // Extract times from timesData
    const adrCurrentTime = timesData[0] ? timesData[0][2] || "" : "";
    const adrClosingTime = timesData[0] ? (timesData[0][8] || "") + " " + (timesData[0][9] || "") : "";
    const adrAfterTime = timesData[0] ? (timesData[0][16] || "") + " " + (timesData[0][17] || "") : "";
    const commoditiesTime = timesData[0] ? timesData[0][22] || "" : "";
    
    // Build structured response
    return {
      adrsCurrent: {
        value: mainData[0] ? (mainData[0][0] || "0") + (mainData[0][1] || "%") : "0%",
        parameter: mainData[1] ? (mainData[1][0] || "") + (mainData[1][1] || "") + (mainData[1][2] || "") : "",
        time: adrCurrentTime,
        isNegative: mainData[0] && mainData[0][0] ? parseFloat(mainData[0][0]) < 0 : false
      },
      adrsClosing: {
        value: mainData[0] ? (mainData[0][5] || "0") + (mainData[0][6] || "0") + (mainData[0][7] || "%") : "0%",
        parameter: mainData[1] ? (mainData[1][5] || "") + (mainData[1][6] || "") + (mainData[1][7] || "") + (mainData[1][8] || "") + (mainData[1][9] || "") : "",
        time: adrClosingTime,
        isPositive: mainData[0] && mainData[0][5] ? parseFloat(mainData[0][5]) > 0 : false
      },
      adrsAfterMarket: {
        value: mainData[0] ? (mainData[0][14] || "0") + (mainData[0][15] || "%") : "0%",
        parameter: mainData[1] ? (mainData[1][14] || "") + (mainData[1][15] || "") + (mainData[1][16] || "") + (mainData[1][17] || "") : "",
        time: adrAfterTime,
        isPositive: mainData[0] && mainData[0][14] ? parseFloat(mainData[0][14]) > 0 : false
      },
      commodities: {
        value: mainData[0] ? (mainData[0][21] || "0%") : "0%",
        parameter: mainData[1] ? (mainData[1][21] || "") + (mainData[1][22] || "") + (mainData[1][23] || "") : "",
        time: commoditiesTime,
        isNegative: mainData[0] && mainData[0][21] ? parseFloat(mainData[0][21]) < 0 : false
      },
      vix: {
        currentValue: vixData[1] ? (vixData[1][0] || "0") + (vixData[1][1] || "") : "0",
        currentChange: vixData[2] ? (vixData[2][0] || "0") + (vixData[2][1] || "%") : "0%",
        currentTime: vixData[0] ? (vixData[0][0] || "") + (vixData[0][4] || "") : "",
        closingValue: vixData[1] ? vixData[1][8] || "0" : "0",
        closingChange: vixData[1] ? vixData[1][7] || "0%" : "0%",
        closingTime: vixData[0] ? vixData[0][7] || "" : "",
        openingValue: vixData[1] ? vixData[1][10] || "0" : "0",
        openingChange: vixData[1] ? vixData[1][9] || "0%" : "0%",
        openingTime: vixData[0] ? vixData[0][9] || "" : "",
        valueParameter: vixData[1] ? vixData[1][2] || "" : "",
        resultParameter: vixData[2] ? vixData[2][2] || "" : "",
        gapParameter: vixData[2] ? (vixData[2][7] || "") + (vixData[2][8] || "") + (vixData[2][9] || "") + (vixData[2][10] || "") + (vixData[2][11] || "") : "",
        tendencyTime: vixData[0] ? vixData[0][14] || "" : "",
        tendencyParameter: vixData[2] ? (vixData[2][13] || "") + (vixData[2][14] || "") + (vixData[2][15] || "") + (vixData[2][16] || "") : "",
        chartData: vixData[0] ? vixData[0].slice(15).filter(Boolean) : []
      },
      alerts: {
        volatility: alertsData[0] ? alertsData[0].join(" ") : "",
        footprint: alertsData[2] ? alertsData[2].slice(0, 10).join(" ") : "",
        indexation: alertsData[2] ? alertsData[2].slice(14).join(" ") : ""
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
      value: "-9.29%",
      parameter: "EXTREMAMENTE NEGATIVO",
      time: "18:00:02",
      isNegative: true
    },
    adrsClosing: {
      value: "7.77%",
      parameter: "MUITO POSITIVO",
      time: "07/03/2023",
      isPositive: true
    },
    adrsAfterMarket: {
      value: "0.26%",
      parameter: "LEVEMENTE POSITIVO",
      time: "07/03/2023",
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
    }
  };
};
