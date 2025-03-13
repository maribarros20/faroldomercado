
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EconomicIndicator {
  name: string;
  time: string;
  value: string;
  change: string;
  parameter?: string;
}

interface EconomicDataWidgetProps {
  usRate: EconomicIndicator;
  usCpi: EconomicIndicator;
  brSelic: EconomicIndicator;
  brIpca: EconomicIndicator;
}

const EconomicDataWidget: React.FC<EconomicDataWidgetProps> = ({
  usRate,
  usCpi,
  brSelic,
  brIpca
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-[#0066FF]" />
                  <span className="font-medium">Taxa de Juros</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(usRate.time)}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{usRate.value}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  isNegative(usRate.change)
                    ? 'bg-red-100 text-red-600' 
                    : usRate.change === '0%' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-green-100 text-green-600'
                }`}>
                  {isNegative(usRate.change) ? (
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                  )}
                  {usRate.change}
                </span>
              </div>
              
              <Progress 
                value={calculateProgress(usRate.value)} 
                className="h-2 bg-gray-100" 
                indicatorClassName="bg-[#0066FF]" 
              />
              
              {usRate.parameter && (
                <div className={`text-xs mt-1 ${
                  usRate.parameter.includes('NEGATIV') 
                    ? 'text-[#ef4444]' 
                    : usRate.parameter.includes('POSITIV') 
                      ? 'text-[#22c55e]' 
                      : 'text-gray-600'
                }`}>
                  {usRate.parameter}
                </div>
              )}
            </div>
            
            {/* US CPI */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1 text-[#0066FF]" />
                  <span className="font-medium">Inflação (CPI)</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(usCpi.time)}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{usCpi.value}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  isNegative(usCpi.change)
                    ? 'bg-green-100 text-green-600' // For CPI, negative change is good
                    : usCpi.change === '0%' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-red-100 text-red-600'
                }`}>
                  {isNegative(usCpi.change) ? (
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                  )}
                  {usCpi.change}
                </span>
              </div>
              
              <Progress 
                value={calculateProgress(usCpi.value)} 
                className="h-2 bg-gray-100" 
                indicatorClassName={isNegative(usCpi.change) ? "bg-[#22c55e]" : "bg-[#ef4444]"}
              />
              
              {usCpi.parameter && (
                <div className={`text-xs mt-1 ${
                  usCpi.parameter.includes('NEGATIV') 
                    ? 'text-[#ef4444]' 
                    : usCpi.parameter.includes('POSITIV') 
                      ? 'text-[#22c55e]' 
                      : 'text-gray-600'
                }`}>
                  {usCpi.parameter}
                </div>
              )}
            </div>
          </div>
          
          {/* Brazil Economic Data */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Brasil</h3>
            
            {/* BR SELIC */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-[#0066FF]" />
                  <span className="font-medium">Taxa SELIC</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(brSelic.time)}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{brSelic.value}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  isNegative(brSelic.change)
                    ? 'bg-red-100 text-red-600' 
                    : brSelic.change === '0%' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-green-100 text-green-600'
                }`}>
                  {isNegative(brSelic.change) ? (
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                  )}
                  {brSelic.change}
                </span>
              </div>
              
              <Progress 
                value={calculateProgress(brSelic.value)} 
                className="h-2 bg-gray-100" 
                indicatorClassName="bg-[#0066FF]" 
              />
              
              {brSelic.parameter && (
                <div className={`text-xs mt-1 ${
                  brSelic.parameter.includes('NEGATIV') 
                    ? 'text-[#ef4444]' 
                    : brSelic.parameter.includes('POSITIV') 
                      ? 'text-[#22c55e]' 
                      : 'text-gray-600'
                }`}>
                  {brSelic.parameter}
                </div>
              )}
            </div>
            
            {/* BR IPCA */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1 text-[#0066FF]" />
                  <span className="font-medium">Inflação (IPCA)</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(brIpca.time)}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{brIpca.value}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  isNegative(brIpca.change)
                    ? 'bg-green-100 text-green-600' // For IPCA, negative change is good
                    : brIpca.change === '0%' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-red-100 text-red-600'
                }`}>
                  {isNegative(brIpca.change) ? (
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                  )}
                  {brIpca.change}
                </span>
              </div>
              
              <Progress 
                value={calculateProgress(brIpca.value)} 
                className="h-2 bg-gray-100" 
                indicatorClassName={isNegative(brIpca.change) ? "bg-[#22c55e]" : "bg-[#ef4444]"}
              />
              
              {brIpca.parameter && (
                <div className={`text-xs mt-1 ${
                  brIpca.parameter.includes('NEGATIV') 
                    ? 'text-[#ef4444]' 
                    : brIpca.parameter.includes('POSITIV') 
                      ? 'text-[#22c55e]' 
                      : 'text-gray-600'
                }`}>
                  {brIpca.parameter}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataWidget;
