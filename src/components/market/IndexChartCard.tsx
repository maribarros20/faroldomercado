
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

interface ChartData {
  time: number;
  value: number;
}

interface IndexChartCardProps {
  name: string;
  time: string;
  value: string;
  change: string;
  chartData: ChartData[];
}

const IndexChartCard: React.FC<IndexChartCardProps> = ({
  name,
  time,
  value,
  change,
  chartData
}) => {
  const isNegative = (changeValue: string) => {
    if (!changeValue) return false;
    return changeValue.includes('-');
  };

  const formatTime = (timeStr: string) => {
    return timeStr || "Sem horário";
  };

  // Clean display name by removing "Índices Futuros" prefix
  const getDisplayName = (name: string) => {
    return name.replace(/^Índices Futuros\s+/i, '');
  };

  return (
    <Card 
      className={`shadow-sm border-l-4 ${
        isNegative(change) 
          ? 'border-l-[#ef4444]' 
          : change === '0%' || change === '0.00%' 
            ? 'border-l-[#0066FF]' 
            : 'border-l-[#22c55e]'
      }`}
    >
      <CardHeader className="py-2 px-4 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium text-[#323232]">{getDisplayName(name)}</CardTitle>
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(time)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">{value}</span>
          <span className={`text-xl font-medium ${
            isNegative(change) 
              ? 'text-[#ef4444]' 
              : change === '0%' || change === '0.00%' 
                ? 'text-black' 
                : 'text-[#22c55e]'
          }`}>
            {isNegative(change) ? (
              <TrendingDown className="h-4 w-4 inline mr-1" />
            ) : (
              <TrendingUp className="h-4 w-4 inline mr-1" />
            )}
            {change}
          </span>
        </div>
        
        <div className="h-36">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0066FF"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                  formatter={(value) => [`${value}`, name]}
                  labelFormatter={() => ''}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Sem dados do gráfico
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexChartCard;
