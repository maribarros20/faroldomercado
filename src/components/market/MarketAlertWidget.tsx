
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AlertData {
  name: string;
  time: string;
  value: string;
  parameter: string;
}

interface MarketAlertWidgetProps {
  alerts: AlertData[];
}

const MarketAlertWidget: React.FC<MarketAlertWidgetProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <AlertCircle className="h-6 w-6 mr-2" />
          Alertas de Mercado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className="p-3 rounded-md bg-amber-50 border border-amber-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800">{alert.name}</h4>
                    <p className="text-amber-700 break-words">{alert.parameter}</p>
                  </div>
                </div>
                {alert.time && (
                  <span className="text-xs text-amber-600 ml-4 flex-shrink-0">
                    {alert.time}
                  </span>
                )}
              </div>
              {alert.value && <div className="mt-2 text-sm text-amber-700">{alert.value}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAlertWidget;
