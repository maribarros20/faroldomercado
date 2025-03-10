
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

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
  const isVixUp = vixData.currentChange.includes("+");
  
  const renderMiniChart = () => {
    if (vixData.chartData.length === 0) return null;
    
    // Normalize chart data for display
    const chartValues = vixData.chartData.map(val => parseFloat(val) || 0);
    const min = Math.min(...chartValues);
    const max = Math.max(...chartValues);
    const range = max - min;
    
    // Prevent division by zero
    const normalizedValues = range === 0 
      ? chartValues.map(() => 50) 
      : chartValues.map(val => ((val - min) / range) * 100);
    
    return (
      <div className="h-12 flex items-end space-x-1">
        {normalizedValues.map((val, i) => {
          const height = Math.max(5, val); // Minimum height of 5%
          const colorClass = chartValues[i] >= chartValues[i > 0 ? i-1 : i] 
            ? "bg-red-400" 
            : "bg-green-400";
          
          return (
            <div 
              key={i} 
              className={`w-3 rounded-t ${colorClass}`} 
              style={{ height: `${height}%` }}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl">VIX (CBOE VOLATILITY INDEX)</span>
            <div className="flex items-center ml-4 text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {vixData.currentTime}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium uppercase">Atual</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`text-3xl font-bold ${isVixUp ? 'text-red-600' : 'text-green-600'}`}>
                {vixData.currentValue}
              </div>
              <div className={`flex items-center ${isVixUp ? 'text-red-500' : 'text-green-500'}`}>
                {isVixUp ? (
                  <TrendingUp className="h-5 w-5 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-1" />
                )}
                <span className="font-semibold">{vixData.currentChange}</span>
              </div>
            </div>
            <div className="text-sm uppercase mt-2 font-medium">{vixData.valueParameter}</div>
            <div className={`text-xs mt-1 uppercase font-medium ${isVixUp ? 'text-red-500' : 'text-green-500'}`}>
              {vixData.resultParameter}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Fechamento</div>
                <div className="text-xl font-semibold">{vixData.closingValue}</div>
                <div className={`text-sm ${vixData.closingChange.includes("-") ? 'text-green-500' : 'text-red-500'}`}>
                  {vixData.closingChange}
                </div>
                <div className="text-xs text-gray-500 mt-1">{vixData.closingTime}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Abertura</div>
                <div className="text-xl font-semibold">{vixData.openingValue}</div>
                <div className={`text-sm ${vixData.openingChange.includes("-") ? 'text-green-500' : 'text-red-500'}`}>
                  {vixData.openingChange}
                </div>
                <div className="text-xs text-gray-500 mt-1">{vixData.openingTime}</div>
              </div>
            </div>
            <div className="text-sm uppercase mt-4 font-medium text-orange-500">{vixData.gapParameter}</div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Tendência ({vixData.tendencyTime})</span>
            </div>
            {renderMiniChart()}
            <div className="text-sm text-red-500 mt-2 uppercase font-medium">{vixData.tendencyParameter}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VixPanel;
