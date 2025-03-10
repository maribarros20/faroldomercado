
import React from "react";
import { AlertData } from "@/utils/alertUtils";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface MarketAlertsProps {
  alerts: AlertData[];
  isLoading: boolean;
}

const MarketAlerts: React.FC<MarketAlertsProps> = ({ alerts, isLoading }) => {
  return (
    <>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>Nenhum alerta de variação significativa no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-md flex gap-3 ${
                alert.type === "danger" 
                  ? "bg-red-50 border-red-100" 
                  : alert.type === "success"
                  ? "bg-green-50 border-green-100"
                  : alert.type === "warning"
                  ? "bg-amber-50 border-amber-100"
                  : "bg-blue-50 border-blue-100"
              }`}
            >
              <div className="mt-1">
                {alert.type === "danger" ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : alert.type === "success" ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {alert.type === "danger" ? "Alerta de Queda" : 
                   alert.type === "success" ? "Sinal de Alta" : 
                   alert.type === "warning" ? "Alta Volatilidade" : "Notificação"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MarketAlerts;
