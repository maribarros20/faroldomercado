
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Tipo para dados do gráfico
type ChartDataPoint = {
  time: string;
  IBOV: number;
  SP500: number;
};

// Função para gerar dados simulados para o gráfico
const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  // Começar das 10:00 até hora atual
  for (let i = 0; i < 7; i++) {
    const hour = 10 + i;
    const ibovBase = 120000 + Math.random() * 10000;
    const sp500Base = 5000 + Math.random() * 200;
    
    data.push({
      time: `${hour}:00`,
      IBOV: Math.round(ibovBase),
      SP500: Math.round(sp500Base * 10) // Multiplicando para ficar em escala similar
    });
  }
  
  return data;
};

const MarketOverview = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  useEffect(() => {
    setChartData(generateChartData());
    
    // Atualizar dados a cada 5 minutos
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
