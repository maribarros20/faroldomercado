
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Info } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface VixPanelProps {
  vixData: {
    currentValue: string;
    currentChange: string;
    currentTime: string;
    closingValue: string;
    closingChange: string;
    closingTime: string;
    openingValue: string;
    openingChange: string;
    openingTime: string;
    valueParameter: string;
    resultParameter: string;
    gapParameter: string;
    tendencyTime: string;
    tendencyParameter: string;
    chartData: string[];
  };
}

const VixPanel: React.FC<VixPanelProps> = ({ vixData }) => {
  // Helper function to determine if a value is positive or negative
  const isPositive = (value: string) => value && value.includes("+");
  const isNegative = (value: string) => value && value.includes("-");
  
  // Create chart data from string values
  const chartData = vixData.chartData.map((value, index) => ({
    name: index.toString(),
    value: parseFloat(value) || 0
  }));
  
  // Helper for dynamic color styling
  const getValueColor = (value: string) => {
    if (isPositive(value)) return "text-green-600";
    if (isNegative(value)) return "text-red-600";
    return "text-[#323232]";
  };
  
  // Helper for parameter color styling
  const getParameterColor = (parameter: string) => {
    const lowerParam = parameter.toLowerCase();
    if (lowerParam.includes("positiv")) return "text-green-600";
    if (lowerParam.includes("negativ")) return "text-red-600";
    if (lowerParam.includes("neutr")) return "text-blue-600";
    return "text-[#323232]";
  };

  // Calculate min and max values for chart
  const numericValues = chartData.map(item => item.value);
  const minValue = Math.min(...numericValues) * 0.98;
  const maxValue = Math.max(...numericValues) * 1.02;

  return (
    <Card className="bg-[#323232] border-0 shadow-xl text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            VIX (CBOE VOLATILITY INDEX)
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Current value */}
          <div className="flex flex-col justify-between">
            <div className="mb-1">
              <div className="text-sm mb-0">
                <span className="text-white font-bold">{vixData.currentTime}</span>
              </div>
              <div className="flex items-end">
                <div className="text-3xl font-bold text-white">{vixData.currentValue}</div>
                <div className={`ml-2 flex items-center ${getValueColor(vixData.currentChange)}`}>
                  {isPositive(vixData.currentChange) ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">{vixData.currentChange}</span>
                </div>
              </div>
              <div className={`text-sm font-medium text-white mt-1`}>
                {vixData.valueParameter}
              </div>
              <div className={`text-sm font-medium ${getValueColor(vixData.resultParameter)} mt-1`}>
                {vixData.resultParameter}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div>
                <div className="text-xs text-gray-300 mb-0">Fechamento</div>
                <div className="text-white font-normal text-xs">{vixData.closingTime}</div>
                <div className="flex items-end">
                  <div className="text-lg font-bold text-white">{vixData.closingValue}</div>
                  <div className={`ml-2 text-xs ${getValueColor(vixData.closingChange)}`}>
                    {vixData.closingChange}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-300 mb-0">Abertura</div>
                <div className="text-white font-normal text-xs">{vixData.openingTime}</div>
                <div className="flex items-end">
                  <div className="text-lg font-bold text-white">{vixData.openingValue}</div>
                  <div className={`ml-2 text-xs ${getValueColor(vixData.openingChange)}`}>
                    {vixData.openingChange}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white">Tendência volatilidade</span>
              <div className="flex items-center text-xs text-gray-300">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{vixData.tendencyTime || "Sem horário"}</span>
              </div>
            </div>
            
            {chartData.length > 0 ? (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis domain={[minValue, maxValue]} hide />
                    <Tooltip 
                      formatter={(value) => [parseFloat(value as string).toFixed(2), 'VIX']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}
                    />
                    <ReferenceLine y={parseFloat(vixData.openingValue)} stroke="#555" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00B0FF" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Sem dados disponíveis para o gráfico
              </div>
            )}
            
            <div className="mt-2">
              <div className={`text-xs ${getParameterColor(vixData.gapParameter)}`}>
                {vixData.gapParameter}
              </div>
              <div className={`text-xs ${getParameterColor(vixData.tendencyParameter)}`}>
                {vixData.tendencyParameter}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VixPanel;
