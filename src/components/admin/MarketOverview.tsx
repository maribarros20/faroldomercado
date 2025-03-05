
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Type for chart data points
type ChartDataPoint = {
  time: string;
  IBOV: number;
  SP500: number;
};

// Function to generate chart data (simulated, would be replaced by real API data)
const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  // Start from 10:00 to current hour
  for (let i = 0; i < 7; i++) {
    const hour = 10 + i;
    const ibovBase = 120000 + Math.random() * 10000;
    const sp500Base = 5000 + Math.random() * 200;
    
    data.push({
      time: `${hour}:00`,
      IBOV: Math.round(ibovBase),
      SP500: Math.round(sp500Base * 10) // Multiplying to get similar scale
    });
  }
  
  return data;
};

const MarketOverview = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  useEffect(() => {
    setChartData(generateChartData());
    
    // Update data every 5 minutes
    const interval = setInterval(() => {
      setChartData(generateChartData());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl">Visão geral do mercado</CardTitle>
        <p className="text-sm text-muted-foreground">
          Acompanhe o desempenho dos principais índices
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="IBOV"
                stroke="#0063F5"
                activeDot={{ r: 8 }}
                name="IBOV"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="SP500" 
                stroke="#10B981" 
                name="S&P" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
