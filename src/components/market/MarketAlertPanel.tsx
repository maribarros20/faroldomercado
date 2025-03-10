
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
      return "border-red-300 bg-red-50 text-red-700";
    } 
    if (lowerText.includes("baixa")) {
      return "border-blue-300 bg-blue-50 text-blue-700";
    }
    return "border-orange-200 bg-orange-50 text-orange-700";
  };

  return (
    <Card className="border-orange-300 bg-orange-50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-orange-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Alertas de Mercado</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.volatility && (
          <div className={`p-4 border rounded-md bg-white ${getAlertColor(alerts.volatility)}`}>
            <div className="flex items-start">
              <Hash className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium mb-1">Volatilidade</div>
                <span className="text-sm">{alerts.volatility}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.footprint && (
            <div className={`p-4 border rounded-md bg-white ${getAlertColor(alerts.footprint)}`}>
              <div className="flex items-start">
                <Hash className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium mb-1">Footprint</div>
                  <span className="text-sm">{alerts.footprint}</span>
                </div>
              </div>
            </div>
          )}
          
          {alerts.indexation && (
            <div className={`p-4 border rounded-md bg-white ${getAlertColor(alerts.indexation)}`}>
              <div className="flex items-start">
                <Hash className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium mb-1">Indexação</div>
                  <span className="text-sm">{alerts.indexation}</span>
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
