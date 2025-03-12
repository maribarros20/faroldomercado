
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MarketIndicesPanelProps {
  indices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
      chart?: string[];
    };
  };
}

const MarketIndicesPanel: React.FC<MarketIndicesPanelProps> = ({ indices }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  const parseChartData = (chartData: string[] | undefined) => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) return [];
    
    return chartData.map((value, index) => ({
      time: index,
      value: parseFloat(value.replace(',', '.')) || 0
    }));
  };

  const renderChart = (index: any) => {
    if (!('chart' in index) || !index.chart || !Array.isArray(index.chart) || index.chart.length === 0) {
      return null;
    }
    
    const chartData = parseChartData(index.chart);
    
    return (
      <div className="h-20 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isNegative(index.change) ? "#ef4444" : "#22c55e"} 
              strokeWidth={2} 
              dot={false} 
            />
            <XAxis dataKey="time" hide={true} />
            <YAxis hide={true} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }} 
              formatter={(value) => [`${value}`, 'Valor']}
              labelFormatter={() => ''}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const indicesOrder = [
    'IBOV', 'SP500', 'DOW', 'NASDAQ', 'US_FUTURES', 
    'EURO_STOXX', 'FTSE100', 'CHINA_A50', 'VALE3', 
    'PETR4', 'EWZ', 'BIT_FUT'
  ];

  // Sort indices based on predefined order
  const sortedIndices = indicesOrder
    .filter(key => indices[key])
    .map(key => indices[key]);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <TrendingUp className="h-6 w-6 mr-2" />
          Índices de Mercado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedIndices.map((index, idx) => (
            <Card 
              key={idx} 
              className={`border-l-4 shadow-sm ${isNegative(index.change) ? 'border-l-red-500' : 'border-l-green-500'}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="text-[#323232]">{index.name}</span>
                  <span className="text-sm font-normal flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {formatTime(index.time)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {isNegative(index.change) ? (
                    <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
                  ) : (
                    <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  )}
                  <div>
                    <div className="text-xl font-bold">{index.value}</div>
                    <div 
                      className={`text-sm font-medium ${isNegative(index.change) ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {index.change}
                    </div>
                    {index.parameter && (
                      <div className="text-xs text-gray-600 mt-1">
                        {index.parameter}
                      </div>
                    )}
                  </div>
                </div>
                {renderChart(index)}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketIndicesPanel;
