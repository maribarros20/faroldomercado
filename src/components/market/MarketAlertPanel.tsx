
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Bell, TrendingUp } from "lucide-react";

interface MarketAlertPanelProps {
  alerts: {
    volatility: string;
    footprint: string;
    indexation: string;
  };
}

const MarketAlertPanel: React.FC<MarketAlertPanelProps> = ({ alerts }) => {
  // Function to determine if the alert is active
  const isAlertActive = (alertText: string) => {
    return alertText && alertText.trim() !== '';
  };

  // Function to get appropriate icon for each alert type
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "volatility":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "footprint":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "indexation":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Background color for each alert type
  const getAlertBgColor = (alertType: string) => {
    switch (alertType) {
      case "volatility":
        return "bg-amber-50 border-amber-100";
      case "footprint":
        return "bg-red-50 border-red-100";
      case "indexation":
        return "bg-green-50 border-green-100";
      default:
        return "bg-gray-50 border-gray-100";
    }
  };

  // Get alert title
  const getAlertTitle = (alertType: string) => {
    switch (alertType) {
      case "volatility":
        return "Alerta de Volatilidade";
      case "footprint":
        return "Alerta de Footprint";
      case "indexation":
        return "Alerta de Indexação";
      default:
        return "Alerta";
    }
  };

  // Get all active alerts
  const activeAlerts = Object.entries(alerts)
    .filter(([_, message]) => isAlertActive(message))
    .map(([type, message]) => ({
      type,
      title: getAlertTitle(type),
      message: message.replace('#', ''),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeAlerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`p-3 border rounded-md flex gap-3 ${getAlertBgColor(alert.type)}`}
            >
              <div className="mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{alert.title}</div>
                <p className="text-sm text-gray-700">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAlertPanel;
