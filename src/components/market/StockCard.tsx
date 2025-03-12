
import React, { useMemo, useState, useEffect } from "react";
import { StockData } from "@/services/stockService";
import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalStockData } from "@/services/stockService";
import { Skeleton } from "@/components/ui/skeleton";

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, value: number, date: string } | null>(null);
  
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

  useEffect(() => {
    if (stockHistory && stockHistory.prices.length > 0) {
      console.log(`Stock ${stock.ticker} historical data:`, {
        oldest: {
          date: stockHistory.dates[0],
          price: stockHistory.prices[0]
        },
        newest: {
          date: stockHistory.dates[stockHistory.dates.length - 1],
          price: stockHistory.prices[stockHistory.prices.length - 1]
        },
        totalDataPoints: stockHistory.prices.length
      });
    }
  }, [stockHistory, stock.ticker]);

  // Generate chart data from historical or mock data
  const chartData = useMemo(() => {
    // If we have real data, use it
    if (stockHistory && stockHistory.prices.length > 0) {
      // Use the original order (do not reverse - data is already ordered oldest first)
      const prices = [...stockHistory.prices]; 
      return generateNormalizedChartPoints(prices, stock.changePercent >= 0, stockHistory.dates);
    }
    
    // Otherwise create mock data based on the change percent trend
    return generateMockChartPoints(stock.changePercent);
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

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!stockHistory || !stockHistory.prices.length) return;
    
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - svgRect.left) / svgRect.width) * 100;
    
    // Find the closest point
    let closestPoint = chartData[0];
    let closestDistance = Math.abs(closestPoint.x - x);
    
    for (let i = 1; i < chartData.length; i++) {
      const distance = Math.abs(chartData[i].x - x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = chartData[i];
      }
    }
    
    setHoveredPoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
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
        ) : (
          <div className="relative w-full h-full">
            <svg 
              className="w-full h-full" 
              preserveAspectRatio="none" 
              viewBox="0 0 100 100"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Background gradient */}
              <defs>
                <linearGradient id={`gradient-${stock.ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop 
                    offset="0%" 
                    stopColor={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"} 
                    stopOpacity="0.2"
                  />
                  <stop 
                    offset="100%" 
                    stopColor={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"} 
                    stopOpacity="0.01"
                  />
                </linearGradient>
              </defs>

              {/* Area fill with gradient */}
              <path
                d={`
                  M 0,${chartData[0].y}
                  ${chartData.map(point => `L ${point.x},${point.y}`).join(" ")}
                  L 100,100 L 0,100 Z
                `}
                fill={`url(#gradient-${stock.ticker})`}
                strokeWidth="0"
              />

              {/* Main line */}
              <path
                d={`
                  M 0,${chartData[0].y}
                  ${chartData.map(point => `L ${point.x},${point.y}`).join(" ")}
                `}
                fill="none"
                stroke={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Start and end points */}
              <circle
                cx="0"
                cy={chartData[0].y}
                r="1.5"
                fill={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
              />
              <circle
                cx="100"
                cy={chartData[chartData.length - 1].y}
                r="1.5"
                fill={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
              />
              
              {/* Improved tooltip marker and dot with better visibility */}
              {hoveredPoint && (
                <>
                  {/* Vertical tracking line */}
                  <line 
                    x1={hoveredPoint.x} 
                    y1="0" 
                    x2={hoveredPoint.x} 
                    y2="100" 
                    stroke="rgba(100, 100, 100, 0.3)" 
                    strokeWidth="1" 
                    strokeDasharray="2,2"
                  />
                  
                  {/* Hover point with larger radius */}
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="3.5"
                    fill="#fff"
                    stroke={stock.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth="1.5"
                  />
                  
                  {/* Improved price tooltip */}
                  <rect
                    x={hoveredPoint.x < 70 ? hoveredPoint.x : hoveredPoint.x - 40}
                    y={hoveredPoint.y < 30 ? hoveredPoint.y + 5 : hoveredPoint.y - 25}
                    width="40"
                    height="20"
                    rx="3"
                    fill="rgba(0, 0, 0, 0.8)"
                  />
                  
                  {/* Price value with better positioning */}
                  <text
                    x={hoveredPoint.x < 70 ? hoveredPoint.x + 20 : hoveredPoint.x - 20}
                    y={hoveredPoint.y < 30 ? hoveredPoint.y + 15 : hoveredPoint.y - 15}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {hoveredPoint.value.toFixed(2)}
                  </text>
                  
                  {/* Date tooltip - positioned to avoid edge clipping */}
                  {hoveredPoint.date && (
                    <>
                      <rect
                        x={hoveredPoint.x < 70 ? hoveredPoint.x : hoveredPoint.x - 50}
                        y={hoveredPoint.y < 30 ? hoveredPoint.y + 30 : hoveredPoint.y - 50}
                        width="50"
                        height="18"
                        rx="3"
                        fill="rgba(0, 0, 0, 0.7)"
                      />
                      <text
                        x={hoveredPoint.x < 70 ? hoveredPoint.x + 25 : hoveredPoint.x - 25}
                        y={hoveredPoint.y < 30 ? hoveredPoint.y + 39 : hoveredPoint.y - 41}
                        fill="white"
                        fontSize="8"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {hoveredPoint.date.split(' ')[0]}
                      </text>
                    </>
                  )}
                </>
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to generate normalized chart points from price data
function generateNormalizedChartPoints(prices: number[], isPositive: boolean, dates?: string[]) {
  const points = [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  
  console.log(`Normalizing chart points. Min: ${min}, Max: ${max}, Range: ${range}`);
  console.log(`First date: ${dates?.[0]}, Last date: ${dates?.[dates.length-1]}`);
  console.log(`First price: ${prices[0]}, Last price: ${prices[prices.length-1]}`);

  // If all prices are the same, create a flat line with slight variation
  if (range === 0) {
    const baseY = isPositive ? 40 : 60;
    // Generate a slightly wavy line for visual interest
    for (let i = 0; i < 10; i++) {
      const variance = Math.sin(i) * 3;
      points.push({
        x: i * (100 / 9), // Spread points evenly along x-axis
        y: baseY + variance,
        value: prices[0] || 0,
        date: dates ? dates[0] : ""
      });
    }
    return points;
  }
  
  // Otherwise normalize based on actual price data
  for (let i = 0; i < prices.length; i++) {
    points.push({
      x: (i / (prices.length - 1)) * 100, // Older data on left (0), newer on right (100)
      y: 20 + ((prices[i] - min) / range) * 60,
      value: prices[i],
      date: dates ? dates[i] : ""
    });
  }
  
  return points;
}

// Function to generate mock chart data based on the change percent
function generateMockChartPoints(changePercent: number) {
  const points = [];
  const numPoints = 10;
  const isPositive = changePercent >= 0;
  
  // Starting and ending positions (start low, end high for positive trend)
  const startY = isPositive ? 60 : 40;  // For positive trend: start at bottom (60)
  const endY = isPositive ? 40 : 60;    // For positive trend: end at top (40)
  
  // Create points with a curve that matches the trend
  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * 100;
    
    // Create a curve that's more pronounced near the end
    const progress = i / (numPoints - 1);
    const easedProgress = isPositive 
      ? 1 - Math.pow(1 - progress, 2) // Ease out for positive trend
      : Math.pow(progress, 2);        // Ease in for negative trend
    
    // Add some randomness for more natural appearance
    const randomFactor = Math.sin(i * 0.5) * 3;
    const y = startY + (endY - startY) * easedProgress + randomFactor;
    
    const mockValue = 100 + (changePercent * (i / (numPoints - 1)) * 10);
    
    points.push({ 
      x, 
      y,
      value: mockValue,
      date: ""
    });
  }
  
  return points;
}

export default StockCard;
