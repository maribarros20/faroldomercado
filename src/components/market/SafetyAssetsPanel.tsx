
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";

interface SafetyAssetsPanelProps {
  assets: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const SafetyAssetsPanel: React.FC<SafetyAssetsPanelProps> = ({ assets }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  const getAssetLabel = (name: string): string => {
    const labels: Record<string, string> = {
      'GOLD': 'Ouro',
      'DOLLAR': 'Dólar',
      'TREA_2Y': 'Treasury 2 Anos',
      'TREA_5Y': 'Treasury 5 Anos',
      'TREA_10Y': 'Treasury 10 Anos',
      'TREA_30Y': 'Treasury 30 Anos'
    };
    return labels[name] || name;
  };

  const assetOrder = ['GOLD', 'DOLLAR', 'TREA_2Y', 'TREA_5Y', 'TREA_10Y', 'TREA_30Y'];
  const sortedAssets = assetOrder
    .filter(key => assets[key])
    .map(key => assets[key]);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <ShieldCheck className="h-6 w-6 mr-2" />
          Ativos de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {sortedAssets.map((asset, idx) => (
            <Card 
              key={idx} 
              className={`border-l-4 shadow-sm ${isNegative(asset.change) ? 'border-l-red-500' : 'border-l-green-500'}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="text-[#323232]">{getAssetLabel(asset.name)}</span>
                  <span className="text-xs font-normal flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {formatTime(asset.time)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {isNegative(asset.change) ? (
                    <TrendingDown className="h-7 w-7 text-red-500 mr-2" />
                  ) : (
                    <TrendingUp className="h-7 w-7 text-green-500 mr-2" />
                  )}
                  <div>
                    <div className="text-lg font-bold">{asset.value}</div>
                    <div 
                      className={`text-sm font-medium ${isNegative(asset.change) ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {asset.change}
                    </div>
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

export default SafetyAssetsPanel;
