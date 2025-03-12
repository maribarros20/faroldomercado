
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MarketAlertPanelProps {
  alerts: {
    volatility: string;
    footprint: string;
    indexation: string;
  };
}

const MarketAlertPanel: React.FC<MarketAlertPanelProps> = ({ alerts }) => {
  // Filter out empty alerts
  const activeAlerts = Object.entries(alerts)
    .filter(([_, message]) => message && message.trim() !== "")
    .map(([key, message]) => ({ key, message }));

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Alertas de Mercado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {activeAlerts.map(({ key, message }) => {
            let title = "";
            let variant: "default" | "destructive" = "default";
            
            switch (key) {
              case "volatility":
                title = "Alerta de Volatilidade";
                variant = "destructive";
                break;
              case "footprint":
                title = "Configuração de Footprint";
                break;
              case "indexation":
                title = "Configuração de Indexação";
                break;
              default:
                title = "Alerta";
            }
            
            return (
              <Alert key={key} variant={variant} className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">{title}</h3>
                  <AlertDescription className="text-amber-700 text-sm">
                    {message}
                  </AlertDescription>
                </div>
              </Alert>
            );
          })}
        </div>
        
        <div className="mt-3 bg-blue-50 p-3 rounded-md flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">
              Estes alertas são atualizados com base nas condições de mercado atuais. Considere ajustar suas estratégias de acordo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAlertPanel;
