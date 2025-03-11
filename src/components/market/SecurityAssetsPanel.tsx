
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SecurityAssetsPanelProps {
  assets: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  parameter: string;
}

const SecurityAssetsPanel: React.FC<SecurityAssetsPanelProps> = ({ assets, parameter }) => {
  // Map friendly names for assets
  const assetNames: { [key: string]: string } = {
    "OURO": "Ouro",
    "DÓLAR": "Dólar",
    "TREA_2A": "Treasury 2 Anos",
    "TREA_5A": "Treasury 5 Anos",
    "TREA_10A": "Treasury 10 Anos",
    "TREA_30A": "Treasury 30 Anos"
  };

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex justify-between items-center">
          <span className="text-[#0066FF]">Ativos de Segurança</span>
          {parameter && (
            <span className="text-sm font-normal bg-blue-50 text-blue-600 px-2 py-1 rounded">
              {parameter}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(assets).map((asset) => (
            <div 
              key={asset.name} 
              className="border rounded-md p-3 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{assetNames[asset.name] || asset.name}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{asset.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{asset.value}</div>
                  <div className={`flex items-center justify-end ${
                    asset.change.startsWith('+') || parseFloat(asset.change) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {asset.change.startsWith('+') || parseFloat(asset.change) > 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    <span>{asset.change}</span>
                  </div>
                </div>
              </div>
              {asset.parameter && (
                <div className="mt-2 text-xs text-gray-600 italic">
                  {asset.parameter}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAssetsPanel;
