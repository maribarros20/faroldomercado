
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

interface MarketAlertWidgetProps {
  alerts: {
    volatility: string;
    footprint: string;
    indexation: string;
  };
}

const MarketAlertWidget: React.FC<MarketAlertWidgetProps> = ({ alerts }) => {
  const hasAlerts = alerts.volatility || alerts.footprint || alerts.indexation;

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Alertas de Mercado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {!hasAlerts ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Info className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Sem alertas no momento</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1">
              Não há alertas ativos para exibir. Fique atento para futuros alertas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.volatility && (
              <div className="flex p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Alerta de Volatilidade</h4>
                  <p className="text-sm text-amber-700 mt-1">{alerts.volatility}</p>
                </div>
              </div>
            )}
            
            {alerts.footprint && (
              <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Alerta de Footprint</h4>
                  <p className="text-sm text-blue-700 mt-1">{alerts.footprint}</p>
                </div>
              </div>
            )}
            
            {alerts.indexation && (
              <div className="flex p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Alerta de Indexação</h4>
                  <p className="text-sm text-purple-700 mt-1">{alerts.indexation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketAlertWidget;
