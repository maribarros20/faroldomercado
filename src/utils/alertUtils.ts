
import { StockData } from "@/services/stockService";

export interface AlertData {
  id: string;
  type: "success" | "info" | "danger" | "warning";
  message: string;
}

export function generateAlerts(stocks: StockData[]): AlertData[] {
  const alerts: AlertData[] = [];
  
  stocks.forEach(stock => {
    // 1. Gap de Abertura → Comparar Preço de Abertura (G) vs. P. Fec D-1 (K)
    if (stock.openPrice >= stock.prevCloseD1 * 1.02 || stock.openPrice <= stock.prevCloseD1 * 0.98) {
      alerts.push({
        id: `${stock.ticker}-gap`,
        type: "warning",
        message: `${stock.name} (${stock.ticker}) teve um gap de abertura significativo!`
      });
    }
    
    // 2. Cruzamento de Médias → Média Móvel 5 dias (C) cruzou Média Móvel 20 dias (D)
    if (stock.movingAvg5 > stock.movingAvg20 && (stock.movingAvg5 / stock.movingAvg20 - 1) < 0.01) {
      alerts.push({
        id: `${stock.ticker}-crossover-up`,
        type: "success",
        message: `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para cima!`
      });
    } else if (stock.movingAvg5 < stock.movingAvg20 && (stock.movingAvg20 / stock.movingAvg5 - 1) < 0.01) {
      alerts.push({
        id: `${stock.ticker}-crossover-down`,
        type: "danger",
        message: `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para baixo!`
      });
    }
    
    // 3. Volume Anormal - Not implemented yet as volume is not in the data
    
    // 4. Rompimento de Máxima/Mínima 10 dias
    if (stock.lastPrice >= stock.max10Days) {
      alerts.push({
        id: `${stock.ticker}-high-10d`,
        type: "success",
        message: `${stock.name} (${stock.ticker}) atingiu a máxima dos últimos 10 dias!`
      });
    }
    
    if (stock.lastPrice <= stock.min10Days) {
      alerts.push({
        id: `${stock.ticker}-low-10d`,
        type: "danger",
        message: `${stock.name} (${stock.ticker}) atingiu a mínima dos últimos 10 dias!`
      });
    }
    
    // 5. Máxima/Mínima de 52 semanas - Not directly implemented as we don't have 52-week data
    // Using max10Days and min10Days as proxies
  });
  
  // Sort alerts by importance (danger > warning > success > info)
  const sortedAlerts = alerts.sort((a, b) => {
    const priority = { danger: 3, warning: 2, success: 1, info: 0 };
    return priority[b.type] - priority[a.type];
  });
  
  // Limit to the 10 most important alerts
  return sortedAlerts.slice(0, 10);
}

export async function markAlertAsSeen(userId: string, alertId: string, ticker: string, alertType: string, message: string) {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('users_alerts_seen')
      .upsert({
        user_id: userId,
        ticker: ticker,
        alert_type: alertType,
        alert_message: message,
        seen_at: new Date().toISOString()
      });
      
    return !error;
  } catch (err) {
    console.error("Error marking alert as seen:", err);
    return false;
  }
}

import { supabase } from "@/integrations/supabase/client";
