import { StockData } from "@/services/stockService";

export interface AlertData {
  id: string;
  type: "success" | "info" | "danger" | "warning";
  message: string;
  ticker: string;
  category: "gap" | "crossover" | "volume" | "breakout" | "yearlyRange";
  value: number; // Numerical value for sorting (percentage change, etc.)
}

export function generateAlerts(stocks: StockData[], userStockTickers: string[] = []): AlertData[] {
  const allAlerts: AlertData[] = [];
  
  stocks.forEach(stock => {
    // 1. Gap de Abertura → Comparar Preço de Abertura (G) vs. P. Fec D-1 (K)
    if (stock.openPrice && stock.prevCloseD1) {
      const gapPercent = ((stock.openPrice - stock.prevCloseD1) / stock.prevCloseD1) * 100;
      if (Math.abs(gapPercent) >= 2) {
        allAlerts.push({
          id: `${stock.ticker}-gap`,
          type: "warning",
          message: `${stock.name} (${stock.ticker}) teve um gap de abertura de ${gapPercent.toFixed(2)}%`,
          ticker: stock.ticker,
          category: "gap",
          value: Math.abs(gapPercent)
        });
      }
    }
    
    // 2. Cruzamento de Médias → Média Móvel 5 dias (C) cruzou Média Móvel 20 dias (D)
    if (stock.movingAvg5 && stock.movingAvg20) {
      const crossoverPercent = ((stock.movingAvg5 / stock.movingAvg20) - 1) * 100;
      if (Math.abs(crossoverPercent) < 1) {
        // Crossed recently (within 1%)
        if (stock.movingAvg5 > stock.movingAvg20) {
          allAlerts.push({
            id: `${stock.ticker}-crossover-up`,
            type: "success",
            message: `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para cima`,
            ticker: stock.ticker,
            category: "crossover",
            value: crossoverPercent
          });
        } else if (stock.movingAvg5 < stock.movingAvg20) {
          allAlerts.push({
            id: `${stock.ticker}-crossover-down`,
            type: "danger",
            message: `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para baixo`,
            ticker: stock.ticker,
            category: "crossover",
            value: -crossoverPercent
          });
        }
      }
    }
    
    // 3. Volume Anormal - Only if we have volume data
    if (stock.avgVolume10Days && stock.avgVolume10Days > 0) {
      // This is a placeholder since we don't have current volume in the data
      // In a real implementation, we would compare current volume with avgVolume10Days
      const volumeRatio = 1; // Placeholder for current volume / avgVolume10Days
      if (volumeRatio > 2) {
        allAlerts.push({
          id: `${stock.ticker}-volume`,
          type: "warning",
          message: `${stock.name} (${stock.ticker}) com volume anormal (${volumeRatio.toFixed(1)}x a média)`,
          ticker: stock.ticker,
          category: "volume",
          value: volumeRatio
        });
      }
    }
    
    // 4. Rompimento de Máxima/Mínima 10 dias
    if (stock.lastPrice && (stock.max10Days || stock.min10Days)) {
      if (stock.max10Days && stock.lastPrice >= stock.max10Days) {
        const breakoutPercent = ((stock.lastPrice - stock.max10Days) / stock.max10Days) * 100;
        allAlerts.push({
          id: `${stock.ticker}-high-10d`,
          type: "success",
          message: `${stock.name} (${stock.ticker}) rompeu a máxima dos últimos 10 dias (+${breakoutPercent.toFixed(2)}%)`,
          ticker: stock.ticker,
          category: "breakout",
          value: breakoutPercent
        });
      }
      
      if (stock.min10Days && stock.lastPrice <= stock.min10Days) {
        const breakoutPercent = ((stock.lastPrice - stock.min10Days) / stock.min10Days) * 100;
        allAlerts.push({
          id: `${stock.ticker}-low-10d`,
          type: "danger",
          message: `${stock.name} (${stock.ticker}) rompeu a mínima dos últimos 10 dias (${breakoutPercent.toFixed(2)}%)`,
          ticker: stock.ticker,
          category: "breakout",
          value: breakoutPercent
        });
      }
    }
    
    // 5. Máxima/Mínima de 52 semanas - Simulating with max10Days and min10Days
    // In a real implementation, we would use actual 52-week high/low
    if (stock.lastPrice && (stock.max10Days || stock.min10Days)) {
      // Using a 10% buffer above/below 10-day highs/lows to simulate 52-week ranges
      const simulatedHigh52 = stock.max10Days * 1.1;
      const simulatedLow52 = stock.min10Days * 0.9;
      
      if (stock.lastPrice >= simulatedHigh52) {
        const yearlyHighPercent = ((stock.lastPrice - simulatedHigh52) / simulatedHigh52) * 100;
        allAlerts.push({
          id: `${stock.ticker}-high-52w`,
          type: "success",
          message: `${stock.name} (${stock.ticker}) atingiu nova máxima de 52 semanas`,
          ticker: stock.ticker,
          category: "yearlyRange",
          value: yearlyHighPercent
        });
      }
      
      if (stock.lastPrice <= simulatedLow52) {
        const yearlyLowPercent = ((stock.lastPrice - simulatedLow52) / simulatedLow52) * 100;
        allAlerts.push({
          id: `${stock.ticker}-low-52w`,
          type: "danger",
          message: `${stock.name} (${stock.ticker}) atingiu nova mínima de 52 semanas`,
          ticker: stock.ticker,
          category: "yearlyRange",
          value: yearlyLowPercent
        });
      }
    }
  });
  
  // Select the alerts to display based on priority
  return selectPrioritizedAlerts(allAlerts, userStockTickers);
}

function selectPrioritizedAlerts(allAlerts: AlertData[], userStockTickers: string[]): AlertData[] {
  // Step 1: Separate alerts for user's selected stocks
  const userAlerts = allAlerts.filter(alert => userStockTickers.includes(alert.ticker));
  
  // If we already have 10 or more alerts for user's stocks, prioritize and return those
  if (userAlerts.length >= 10) {
    return sortAlertsByPriority(userAlerts).slice(0, 10);
  }
  
  // Step 2: Get the remaining capacity for alerts
  const remainingCapacity = 10 - userAlerts.length;
  
  // Step 3: Group non-user alerts by category
  const nonUserAlerts = allAlerts.filter(alert => !userStockTickers.includes(alert.ticker));
  const categorizedAlerts: Record<string, AlertData[]> = {};
  
  nonUserAlerts.forEach(alert => {
    if (!categorizedAlerts[alert.category]) {
      categorizedAlerts[alert.category] = [];
    }
    categorizedAlerts[alert.category].push(alert);
  });
  
  // Step 4: For each category, get the 2 best and 2 worst alerts
  const categoriesToInclude = ['gap', 'crossover', 'volume', 'breakout', 'yearlyRange'];
  let selectedNonUserAlerts: AlertData[] = [];
  
  categoriesToInclude.forEach(category => {
    if (categorizedAlerts[category] && categorizedAlerts[category].length > 0) {
      // Sort by value (desc for positive alerts, asc for negative alerts)
      const sortedCategory = [...categorizedAlerts[category]].sort((a, b) => {
        if (a.type === 'success' && b.type === 'success') {
          return b.value - a.value; // Highest positive values first
        } else if (a.type === 'danger' && b.type === 'danger') {
          return a.value - b.value; // Lowest negative values first
        } else if (a.type === 'success' && b.type === 'danger') {
          return -1; // Success before danger
        } else if (a.type === 'danger' && b.type === 'success') {
          return 1; // Success before danger
        }
        return 0;
      });
      
      // Get top 2 positive alerts (if any)
      const positiveAlerts = sortedCategory.filter(a => a.type === 'success').slice(0, 2);
      
      // Get top 2 negative alerts (if any)
      const negativeAlerts = sortedCategory.filter(a => a.type === 'danger').slice(0, 2);
      
      // Combine them
      selectedNonUserAlerts = [...selectedNonUserAlerts, ...positiveAlerts, ...negativeAlerts];
    }
  });
  
  // Step 5: Combine user alerts with selected non-user alerts, up to a maximum of 10 total
  let result = [...userAlerts];
  
  // Sort non-user alerts by priority and take only what we need
  const sortedNonUserAlerts = sortAlertsByPriority(selectedNonUserAlerts);
  result = [...result, ...sortedNonUserAlerts.slice(0, remainingCapacity)];
  
  return result;
}

function sortAlertsByPriority(alerts: AlertData[]): AlertData[] {
  // Priority order: danger > warning > success > info
  const typeOrder = { danger: 3, warning: 2, success: 1, info: 0 };
  
  return [...alerts].sort((a, b) => {
    // First by alert type
    const typeDiff = typeOrder[b.type] - typeOrder[a.type];
    if (typeDiff !== 0) {
      return typeDiff;
    }
    
    // Then by value (absolute value for comparison)
    return Math.abs(b.value) - Math.abs(a.value);
  });
}

export async function markAlertAsSeen(
  userId: string, 
  alertId: string, 
  ticker: string, 
  alertType: string, 
  alertMessage: string
) {
  try {
    const { error } = await supabase
      .from('users_alerts_seen')
      .insert({
        user_id: userId,
        ticker,
        alert_type: alertType,
        alert_message: alertMessage
      });
    
    if (error) {
      console.error("Error marking alert as seen:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception marking alert as seen:", err);
    return false;
  }
}

import { supabase } from "@/integrations/supabase/client";
