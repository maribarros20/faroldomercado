
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUpRight, ArrowDownRight, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  const parseChartData = (chartData: string[] | undefined) => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) return [];
    
    return chartData.map((value, index) => ({
      time: index,
      value: parseFloat(value.replace(',', '.')) || 0
    }));
  };

  const chartData = parseChartData(vixData.chartData);
  const isCurrentNegative = vixData.currentChange.includes('-');
  const isClosingNegative = vixData.closingChange.includes('-');
  const isOpeningNegative = vixData.openingChange.includes('-');

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <Activity className="h-6 w-6 mr-2" />
          VIX (CBOE Volatility Index)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column: Chart */}
          <div className="md:col-span-5 h-48 md:h-auto">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <XAxis dataKey="time" hide={true} />
                <YAxis domain={['auto', 'auto']} hide={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }} 
                  formatter={(value) => [`${value}`, 'VIX']}
                  labelFormatter={() => ''}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Right Column: VIX Stats */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current VIX */}
              <Card className={`border-l-4 ${isCurrentNegative ? 'border-l-green-500' : 'border-l-red-500'} shadow-sm`}>
                <CardHeader className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">VIX Atual</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {vixData.currentTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center">
                    {isCurrentNegative ? (
                      <TrendingDown className="h-8 w-8 text-green-500 mr-2" />
                    ) : (
                      <TrendingUp className="h-8 w-8 text-red-500 mr-2" />
                    )}
                    <div>
                      <div className="text-xl font-bold">{vixData.currentValue}</div>
                      <div className={`text-sm font-medium ${isCurrentNegative ? 'text-green-600' : 'text-red-600'}`}>
                        {vixData.currentChange}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Closing VIX */}
              <Card className={`border-l-4 ${isClosingNegative ? 'border-l-green-500' : 'border-l-red-500'} shadow-sm`}>
                <CardHeader className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">VIX Fechamento</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {vixData.closingTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center">
                    {isClosingNegative ? (
                      <TrendingDown className="h-8 w-8 text-green-500 mr-2" />
                    ) : (
                      <TrendingUp className="h-8 w-8 text-red-500 mr-2" />
                    )}
                    <div>
                      <div className="text-xl font-bold">{vixData.closingValue}</div>
                      <div className={`text-sm font-medium ${isClosingNegative ? 'text-green-600' : 'text-red-600'}`}>
                        {vixData.closingChange}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Opening VIX */}
              <Card className={`border-l-4 ${isOpeningNegative ? 'border-l-green-500' : 'border-l-red-500'} shadow-sm`}>
                <CardHeader className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">VIX Abertura</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {vixData.openingTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center">
                    {isOpeningNegative ? (
                      <TrendingDown className="h-8 w-8 text-green-500 mr-2" />
                    ) : (
                      <TrendingUp className="h-8 w-8 text-red-500 mr-2" />
                    )}
                    <div>
                      <div className="text-xl font-bold">{vixData.openingValue}</div>
                      <div className={`text-sm font-medium ${isOpeningNegative ? 'text-green-600' : 'text-red-600'}`}>
                        {vixData.openingChange}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* VIX Parameters */}
            <div className="mt-4 grid grid-cols-1 gap-2">
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium mb-1">Parâmetros de Valor</div>
                <div className="text-gray-600">{vixData.valueParameter}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium mb-1">Gap de Abertura</div>
                <div className="text-gray-600">{vixData.gapParameter}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium mb-1">Tendência ({vixData.tendencyTime})</div>
                <div className="text-gray-600">{vixData.tendencyParameter}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VixPanel;
