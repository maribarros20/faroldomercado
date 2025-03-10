
import React from "react";
import { StockData } from "@/services/stockService";
import { formatCurrency } from "@/components/market/StockList";

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const getChangeIcon = () => {
    return stock.changePercent >= 0 ? "↗" : "↘";
  };

  const getChangeColor = () => {
    return stock.changePercent >= 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div 
      className="rounded-xl p-4 min-w-[200px] h-[120px] flex flex-col justify-between bg-white shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">{stock.ticker}</div>
          <div className="text-xs opacity-70 truncate max-w-[120px]">{stock.name}</div>
        </div>
        <div className={`text-xs font-semibold ${getChangeColor()}`}>
          {getChangeIcon()} {Math.abs(stock.changePercent).toFixed(2)}%
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-sm font-medium">Current Value</div>
        <div className="text-xl font-bold">{formatCurrency(stock.lastPrice)}</div>
      </div>
      
      <div className="w-full h-8 mt-1">
        {/* Simple sparkline placeholder - in a real app, this would be a chart */}
        <div className="h-full w-full flex items-end">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 mx-[1px] ${stock.changePercent >= 0 ? "bg-green-400" : "bg-red-400"} opacity-50`}
              style={{ 
                height: `${20 + Math.random() * 50}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockCard;
