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
const VixPanel: React.FC<VixPanelProps> = ({
  vixData
}) => {
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
  return <Card className="bg-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-[#0066FF]">
          <span className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            VIX - Índice de Volatilidade
          </span>
          <span className="text-sm font-normal flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {vixData.currentTime || "Sem horário"}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current value */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-md border-l-4 border-l-blue-500">
              <div className="text-sm text-gray-600 mb-1">VIX Atual</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-[#323232]">{vixData.currentValue}</div>
                <div className={`flex items-center ${getValueColor(vixData.currentChange)}`}>
                  {isPositive(vixData.currentChange) ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                  <span className="font-medium">{vixData.currentChange}</span>
                </div>
              </div>
              <div className={`text-sm mt-2 font-medium ${getParameterColor(vixData.valueParameter)}`}>
                {vixData.valueParameter}
              </div>
              <div className={`text-sm mt-1 font-medium ${getParameterColor(vixData.resultParameter)}`}>
                {vixData.resultParameter}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg shadow-md border-l-4 border-l-blue-500">
                <div className="text-xs text-gray-600 mb-1">Fechamento</div>
                <div className="text-lg font-bold text-[#323232]">{vixData.closingValue}</div>
                
                <div className="text-xs text-gray-600 mt-1 mx-0 px-0 my-0">{vixData.closingTime}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg shadow-md border-l-4 border-l-blue-500">
                <div className="text-xs text-gray-600 mb-1">Abertura</div>
                <div className="text-lg font-bold text-[#323232]">{vixData.openingValue}</div>
                <div className={`text-sm flex items-center ${getValueColor(vixData.openingChange)}`}>
                  {isPositive(vixData.openingChange) ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {vixData.openingChange}
                </div>
                <div className="text-xs text-gray-600 mt-1">{vixData.openingTime}</div>
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md border-l-4 border-l-blue-500 md:col-span-2 h-64">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#323232]">Histórico VIX</span>
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{vixData.tendencyTime || "Sem horário"}</span>
              </div>
            </div>
            
            {chartData.length > 0 ? <ResponsiveContainer width="100%" height="70%">
                <LineChart data={chartData} margin={{
              top: 5,
              right: 5,
              bottom: 5,
              left: 5
            }}>
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[minValue, maxValue]} hide />
                  <Tooltip formatter={value => [parseFloat(value as string).toFixed(2), 'VIX']} contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0'
              }} />
                  <ReferenceLine y={parseFloat(vixData.openingValue)} stroke="#888" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="value" stroke="#0066FF" strokeWidth={2} dot={false} activeDot={{
                r: 6
              }} isAnimationActive={true} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-gray-400 my-0 mx-[2px] px-0 py-0">
                Sem dados disponíveis para o gráfico
              </div>}
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              
              <div className={`text-xs ${getParameterColor(vixData.tendencyParameter)}`}>
                {vixData.tendencyParameter}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default VixPanel;