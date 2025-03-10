
import { StockData } from "@/services/stockService";

export interface AlertData {
  id: string;
  type: "success" | "info" | "danger" | "warning";
  message: string;
}

export function generateAlerts(stocks: StockData[]): AlertData[] {
  return stocks.map(stock => {
    let alertMessage: string | null = null;
    let alertType: "success" | "info" | "danger" | "warning" = "info";
    
    if (stock.movingAvg5 > stock.movingAvg20) {
      alertMessage = `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para cima!`;
      alertType = "success";
    } else if (stock.movingAvg5 < stock.movingAvg20) {
      alertMessage = `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para baixo!`;
      alertType = "danger";
    }
    
    if (stock.lastPrice >= stock.max10Days) {
      alertMessage = `${stock.name} (${stock.ticker}) atingiu a máxima dos últimos 10 dias!`;
      alertType = "warning";
    }
    
    if (stock.lastPrice <= stock.min10Days) {
      alertMessage = `${stock.name} (${stock.ticker}) atingiu a mínima dos últimos 10 dias!`;
      alertType = "danger";
    }
    
    if (stock.openPrice >= stock.prevCloseD1 * 1.02 || stock.openPrice <= stock.prevCloseD1 * 0.98) {
      alertMessage = `${stock.name} (${stock.ticker}) teve um gap de abertura significativo!`;
      alertType = "warning";
    }
    
    return alertMessage ? { 
      id: `${stock.ticker}-${alertType}`, 
      type: alertType, 
      message: alertMessage
    } : null;
  }).filter((alert): alert is AlertData => alert !== null);
}
