
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Hash } from "lucide-react";

interface MarketAlertPanelProps {
  alerts: {
    volatility: string;
    footprint: string;
    indexation: string;
  };
}

const MarketAlertPanel: React.FC<MarketAlertPanelProps> = ({ alerts }) => {
  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
          <span>Alertas de Mercado</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.volatility && (
          <div className="p-3 border border-orange-200 rounded-md bg-white">
            <div className="flex items-start">
              <Hash className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{alerts.volatility}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.footprint && (
            <div className="p-3 border border-orange-200 rounded-md bg-white">
              <div className="flex items-start">
                <Hash className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{alerts.footprint}</span>
              </div>
            </div>
          )}
          
          {alerts.indexation && (
            <div className="p-3 border border-orange-200 rounded-md bg-white">
              <div className="flex items-start">
                <Hash className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{alerts.indexation}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAlertPanel;
