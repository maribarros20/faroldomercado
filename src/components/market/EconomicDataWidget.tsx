
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EconomicIndicator {
  name: string;
  time: string;
  value: string;
  change: string;
  annualValue?: string;
  monthlyValue?: string;
  parameter?: string;
}

interface EconomicDataWidgetProps {
  usData: {
    interestRate?: EconomicIndicator;
    inflation?: EconomicIndicator;
  };
  brData: {
    interestRate?: EconomicIndicator;
    inflation?: EconomicIndicator;
  };
}

const EconomicDataWidget: React.FC<EconomicDataWidgetProps> = ({
  usData,
  brData
}) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };
  
  // Helper function to calculate progress value based on economic data
  const calculateProgress = (value: string): number => {
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    // Scale the value between 0-100 for progress bar
    if (isNaN(numValue)) return 50;
    // Different scaling for interest rates vs inflation
    return Math.min(Math.max(numValue * 5, 0), 100);
  };

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <Activity className="h-6 w-6 mr-2" />
          Dados Econômicos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* US Economic Data */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Estados Unidos</h3>
            
            {/* US Interest Rate */}
            {usData.interestRate && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-[#0066FF]" />
                    <span className="font-medium">Taxa de Juros</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(usData.interestRate.time)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{usData.interestRate.value}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isNegative(usData.interestRate.change)
                      ? 'bg-red-100 text-red-600' 
                      : usData.interestRate.change === '0%' 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-100 text-green-600'
                  }`}>
                    {isNegative(usData.interestRate.change) ? (
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                    )}
                    {usData.interestRate.change}
                  </span>
                </div>
                
                <Progress 
                  value={calculateProgress(usData.interestRate.value)} 
                  className="h-2 bg-gray-100" 
                />
                
                {usData.interestRate.parameter && (
                  <div className={`text-xs mt-1 ${
                    usData.interestRate.parameter.includes('NEGATIV') 
                      ? 'text-[#ef4444]' 
                      : usData.interestRate.parameter.includes('POSITIV') 
                        ? 'text-[#22c55e]' 
                        : 'text-gray-600'
                  }`}>
                    {usData.interestRate.parameter}
                  </div>
                )}
              </div>
            )}
            
            {/* US Inflation */}
            {usData.inflation && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-[#0066FF]" />
                    <span className="font-medium">Inflação (CPI)</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(usData.inflation.time)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">Anual</div>
                    <div className="text-xl font-bold">{usData.inflation.value}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Mensal</div>
                    <div className="text-xl font-bold">{usData.inflation.monthlyValue || "N/A"}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Variação</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isNegative(usData.inflation.change)
                      ? 'bg-green-100 text-green-600' // For inflation, negative is good
                      : usData.inflation.change === '0%' 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-red-100 text-red-600'
                  }`}>
                    {isNegative(usData.inflation.change) ? (
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                    )}
                    {usData.inflation.change}
                  </span>
                </div>
                
                <Progress 
                  value={calculateProgress(usData.inflation.value)} 
                  className="h-2 bg-gray-100" 
                />
                
                {usData.inflation.parameter && (
                  <div className={`text-xs mt-1 ${
                    usData.inflation.parameter.includes('NEGATIV') 
                      ? 'text-[#ef4444]' 
                      : usData.inflation.parameter.includes('POSITIV') 
                        ? 'text-[#22c55e]' 
                        : 'text-gray-600'
                  }`}>
                    {usData.inflation.parameter}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Brazil Economic Data */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Brasil</h3>
            
            {/* BR Interest Rate (SELIC) */}
            {brData.interestRate && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-[#0066FF]" />
                    <span className="font-medium">Taxa SELIC</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(brData.interestRate.time)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{brData.interestRate.value}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isNegative(brData.interestRate.change)
                      ? 'bg-red-100 text-red-600' 
                      : brData.interestRate.change === '0%' 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-100 text-green-600'
                  }`}>
                    {isNegative(brData.interestRate.change) ? (
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                    )}
                    {brData.interestRate.change}
                  </span>
                </div>
                
                <Progress 
                  value={calculateProgress(brData.interestRate.value)} 
                  className="h-2 bg-gray-100" 
                />
                
                {brData.interestRate.parameter && (
                  <div className={`text-xs mt-1 ${
                    brData.interestRate.parameter.includes('NEGATIV') 
                      ? 'text-[#ef4444]' 
                      : brData.interestRate.parameter.includes('POSITIV') 
                        ? 'text-[#22c55e]' 
                        : 'text-gray-600'
                  }`}>
                    {brData.interestRate.parameter}
                  </div>
                )}
              </div>
            )}
            
            {/* BR Inflation (IPCA) */}
            {brData.inflation && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-[#0066FF]" />
                    <span className="font-medium">Inflação (IPCA)</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(brData.inflation.time)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">Anual</div>
                    <div className="text-xl font-bold">{brData.inflation.value}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Mensal</div>
                    <div className="text-xl font-bold">{brData.inflation.monthlyValue || "N/A"}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Variação</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isNegative(brData.inflation.change)
                      ? 'bg-green-100 text-green-600' // For inflation, negative is good
                      : brData.inflation.change === '0%' 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-red-100 text-red-600'
                  }`}>
                    {isNegative(brData.inflation.change) ? (
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                    )}
                    {brData.inflation.change}
                  </span>
                </div>
                
                <Progress 
                  value={calculateProgress(brData.inflation.value)} 
                  className="h-2 bg-gray-100" 
                />
                
                {brData.inflation.parameter && (
                  <div className={`text-xs mt-1 ${
                    brData.inflation.parameter.includes('NEGATIV') 
                      ? 'text-[#ef4444]' 
                      : brData.inflation.parameter.includes('POSITIV') 
                        ? 'text-[#22c55e]' 
                        : 'text-gray-600'
                  }`}>
                    {brData.inflation.parameter}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataWidget;
