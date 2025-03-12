
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Clock, TrendingDown, TrendingUp } from "lucide-react";

interface EconomicDataPanelProps {
  usData: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  brData: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const EconomicDataPanel: React.FC<EconomicDataPanelProps> = ({ usData, brData }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  // Combine US and BR data for rendering
  const allData = [
    ...Object.values(usData),
    ...Object.values(brData)
  ];

  const getDataLabel = (name: string): string => {
    const labels: Record<string, string> = {
      'US_RATE': 'Taxa de Juros EUA',
      'US_CPI': 'Inflação EUA (CPI)',
      'BR_SELIC': 'Taxa Selic (Brasil)',
      'BR_IPCA': 'Inflação Brasil (IPCA)'
    };
    return labels[name] || name;
  };

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <BarChart className="h-6 w-6 mr-2" />
          Dados Econômicos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {allData.map((data, idx) => (
            <Card 
              key={idx} 
              className={`border-l-4 shadow-sm ${isNegative(data.change) ? 'border-l-red-500' : 'border-l-green-500'}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="text-[#323232]">{getDataLabel(data.name)}</span>
                  <span className="text-xs font-normal flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {formatTime(data.time)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {isNegative(data.change) ? (
                    <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
                  ) : (
                    <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  )}
                  <div>
                    <div className="text-xl font-bold">{data.value}</div>
                    <div 
                      className={`text-sm font-medium ${isNegative(data.change) ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {data.change}
                    </div>
                    {data.parameter && (
                      <div className="text-xs text-gray-600 mt-1">
                        {data.parameter}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataPanel;
