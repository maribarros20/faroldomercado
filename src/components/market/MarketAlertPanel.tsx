
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Hash, Info } from "lucide-react";

interface MarketAlertPanelProps {
  alerts: {
    volatility: string;
    footprint: string;
    indexation: string;
  };
}

const MarketAlertPanel: React.FC<MarketAlertPanelProps> = ({ alerts }) => {
  // Helper to determine alert color based on content
  const getAlertColor = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("stop") || lowerText.includes("alta")) {
      return "border-red-300 bg-red-50";
    } 
    if (lowerText.includes("baixa")) {
      return "border-blue-300 bg-blue-50";
    }
    return "border-orange-200 bg-orange-50";
  };

  return (
    <Card className="border-orange-300 bg-orange-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-orange-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Alertas de Mercado</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.volatility && (
          <div className={`p-4 border rounded-md shadow-sm ${getAlertColor(alerts.volatility)}`}>
            <div className="flex items-start">
              <Hash className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-[#323232]" />
              <div>
                <div className="text-sm font-medium mb-1 text-[#323232]">Volatilidade</div>
                <span className="text-sm text-[#323232]">{alerts.volatility}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.footprint && (
            <div className={`p-4 border rounded-md shadow-sm ${getAlertColor(alerts.footprint)}`}>
              <div className="flex items-start">
                <Hash className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-[#323232]" />
                <div>
                  <div className="text-sm font-medium mb-1 text-[#323232]">Footprint</div>
                  <span className="text-sm text-[#323232]">{alerts.footprint}</span>
                </div>
              </div>
            </div>
          )}
          
          {alerts.indexation && (
            <div className={`p-4 border rounded-md shadow-sm ${getAlertColor(alerts.indexation)}`}>
              <div className="flex items-start">
                <Hash className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-[#323232]" />
                <div>
                  <div className="text-sm font-medium mb-1 text-[#323232]">Indexação</div>
                  <span className="text-sm text-[#323232]">{alerts.indexation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAlertPanel;
