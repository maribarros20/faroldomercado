
import React from "react";
import { StockData } from "@/services/stockService";

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

  const getBorderColor = () => {
    if (stock.changePercent > 0) return "border-l-green-500";
    if (stock.changePercent < 0) return "border-l-red-500";
    return "border-l-blue-500"; // Neutral case
  };

  return (
    <div 
      className={`rounded-xl p-4 min-w-[200px] h-[120px] flex flex-col justify-between bg-white shadow-sm border border-gray-100 border-l-4 ${getBorderColor()}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">{stock.ticker}</div>
          <div className="text-xs opacity-70 truncate max-w-[120px]">{stock.name}</div>
        </div>
        <div className="text-xs text-gray-500">
          {stock.updateTime}
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div className="text-xl font-bold">{stock.lastPrice.toFixed(2)}</div>
        <div className={`text-sm font-semibold ${getChangeColor()}`}>
          {getChangeIcon()} {Math.abs(stock.changePercent).toFixed(2)}%
        </div>
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
