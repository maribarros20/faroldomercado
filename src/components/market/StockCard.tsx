import React, { useMemo } from "react";
import { StockData } from "@/services/stockService";
import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalStockData } from "@/services/stockService";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  // Fetch historical data for all stocks with proper caching
  const { data: historicalData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['stockHistory'],
    queryFn: fetchHistoricalStockData,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (historical data)
    refetchInterval: 1000 * 60 * 60 * 24, // Refresh every 24 hours
  });

  // Find historical data for this specific stock
  const stockHistory = useMemo(() => {
    if (!historicalData) return null;
    return historicalData.find(item => item.ticker === stock.ticker);
  }, [historicalData, stock.ticker]);

  // Generate chart data from historical or mock data
  const chartData = useMemo(() => {
    // If we have real data, use it
    if (stockHistory && stockHistory.prices.length > 0) {
      // Prepare data in the format that Recharts expects
      return stockHistory.prices.map((price, index) => ({
        date: stockHistory.dates[index],
        price: price
      }));
    }
    
    // Otherwise create mock data based on the change percent trend
    return generateMockChartData(stock.changePercent);
  }, [stockHistory, stock.changePercent]);

  const getChangeIcon = () => {
    return stock.changePercent >= 0 ? "↗" : "↘";
  };

  const getChangeColor = () => {
    return stock.changePercent >= 0 ? "text-green-500" : "text-red-500";
  };

  const getBorderColor = () => {
    return stock.changePercent >= 0 ? "border-l-green-500" : "border-l-red-500";
  };

  // Custom tooltip that only shows value every 3 points
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].payload.index % 3 === 0) {
      return (
        <div className="text-xs text-gray-500" style={{ backgroundColor: 'transparent', border: 'none' }}>
          {payload[0].value.toFixed(2)}
        </div>
      );
    }
    return null;
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
          {getChangeIcon()} {Math.abs(stock.changePercent).toFixed(2)}<span className="text-xs">%</span>
        </div>
      </div>
      
      <div className="w-full h-8 mt-1">
        {isLoadingHistory ? (
          <Skeleton className="w-full h-full rounded-md" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData.map((point, index) => ({...point, index}))}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`colorStock${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(100, 100, 100, 0.3)', strokeDasharray: '2 2'}} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                fillOpacity={1}
                fill={`url(#colorStock${stock.ticker})`}
                strokeWidth={1.5}
                dot={false}
                activeDot={{
                  r: 3.5, 
                  stroke: stock.changePercent >= 0 ? "#22c55e" : "#ef4444",
                  strokeWidth: 1.5,
                  fill: "#fff"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// Function to generate mock chart data based on the change percent
function generateMockChartData(changePercent: number) {
  const data = [];
  const numPoints = 30;
  const isPositive = changePercent >= 0;
  
  // Starting value
  let price = 100;
  
  // Create points with a trend that matches the change percent
  for (let i = 0; i < numPoints; i++) {
    // Add a random component to the price change
    const randomFactor = (Math.random() - 0.45) * 2; // Slight bias
    
    // Create progressive change, more pronounced near the end for positive trends
    const progressiveFactor = isPositive ? 
      (i / numPoints) * 1.5 : // Accelerating upward for positive
      1 - (i / numPoints) * 1.5; // Decelerating downward for negative
      
    // Calculate the step change with both random and progressive components
    const change = (changePercent / numPoints) * (1 + randomFactor) * progressiveFactor;
    
    // Update the price
    price += change;
    
    // Ensure price doesn't go negative or too low
    price = Math.max(price, 50);
    
    // Create a date value (not displayed, but helps with Recharts)
    const date = new Date();
    date.setDate(date.getDate() - (numPoints - i - 1));
    
    // Add the data point
    data.push({
      date: date.toISOString().split('T')[0],
      price
    });
  }
  
  return data;
}

export default StockCard;
