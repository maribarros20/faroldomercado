
import React, { useMemo } from "react";
import { StockData } from "@/services/stockService";
import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalStockData } from "@/services/stockService";
import { Skeleton } from "@/components/ui/skeleton";

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  // Fetch historical data for all stocks
  const { data: historicalData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['stockHistory'],
    queryFn: fetchHistoricalStockData,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Find historical data for this specific stock
  const stockHistory = useMemo(() => {
    if (!historicalData) return null;
    return historicalData.find(item => item.ticker === stock.ticker);
  }, [historicalData, stock.ticker]);

  // Normalize prices to fit in the chart area
  const normalizedPrices = useMemo(() => {
    if (!stockHistory || stockHistory.prices.length === 0) return [];
    
    const prices = [...stockHistory.prices].reverse(); // Reverse to show newest data on right
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    if (range === 0) return prices.map(() => 50); // If all prices are the same, show a flat line
    
    return prices.map(price => {
      // Normalize to a value between 20 and 80 (percentage of height)
      return 20 + ((price - min) / range) * 60;
    });
  }, [stockHistory]);

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
        {isLoadingHistory ? (
          <Skeleton className="w-full h-full rounded-md" />
        ) : normalizedPrices.length > 0 ? (
          <div className="relative w-full h-full">
            {/* Main curved line */}
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox={`0 0 ${normalizedPrices.length} 100`}>
              {/* Gradient fill under the curve */}
              <defs>
                <linearGradient id={`gradient-${stock.ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={stock.changePercent >= 0 ? "#4ade80" : "#f87171"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={stock.changePercent >= 0 ? "#4ade80" : "#f87171"} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path
                d={`
                  M0,${100 - normalizedPrices[0]}
                  ${normalizedPrices.map((height, i) => {
                    // Use curve control points for a smoother line
                    if (i === 0) return "";
                    const prev = normalizedPrices[i-1];
                    return `C${i-0.5},${100-prev} ${i-0.5},${100-height} ${i},${100-height}`;
                  }).join(' ')}
                  L${normalizedPrices.length-1},100 L0,100 Z
                `}
                fill={`url(#gradient-${stock.ticker})`}
                strokeWidth="0"
              />
              
              {/* Smooth curved line on top */}
              <path
                d={`
                  M0,${100 - normalizedPrices[0]}
                  ${normalizedPrices.map((height, i) => {
                    // Use curve control points for a smoother line
                    if (i === 0) return "";
                    const prev = normalizedPrices[i-1];
                    return `C${i-0.5},${100-prev} ${i-0.5},${100-height} ${i},${100-height}`;
                  }).join(' ')}
                `}
                fill="none"
                stroke={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          // Fallback with sample data
          <div className="relative w-full h-full">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Gradient fill */}
              <defs>
                <linearGradient id={`gradient-${stock.ticker}-fallback`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={stock.changePercent >= 0 ? "#4ade80" : "#f87171"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={stock.changePercent >= 0 ? "#4ade80" : "#f87171"} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Generate a sample curve shape */}
              {(() => {
                const points = [];
                const numPoints = 20;
                for (let i = 0; i < numPoints; i++) {
                  points.push(50 + (Math.sin(i/3) * 15) + (Math.random() * 5));
                }
                
                // If negative trend, invert the curve
                if (stock.changePercent < 0) {
                  points.reverse();
                }
                
                // Create a smooth path with the points
                const pathData = `
                  M0,${100 - points[0]}
                  ${points.map((height, i) => {
                    if (i === 0) return "";
                    const x = (i / (numPoints-1)) * 100;
                    const prevX = ((i-1) / (numPoints-1)) * 100;
                    const prev = points[i-1];
                    return `C${prevX+5},${100-prev} ${x-5},${100-height} ${x},${100-height}`;
                  }).join(' ')}
                `;
                
                return (
                  <>
                    {/* Area fill */}
                    <path
                      d={`${pathData} L100,100 L0,100 Z`}
                      fill={`url(#gradient-${stock.ticker}-fallback)`}
                      strokeWidth="0"
                    />
                    
                    {/* Line on top */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </>
                );
              })()}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
