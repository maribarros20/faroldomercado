
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock } from "lucide-react";

interface EconomicDataPanelProps {
  usData: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  brData: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const EconomicDataPanel: React.FC<EconomicDataPanelProps> = ({ usData, brData }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          Dados Econômicos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* US Economic Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Estados Unidos</h3>
            <div className="space-y-4">
              {Object.entries(usData).map(([key, data]) => (
                <div key={key} className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{data.name}</div>
                    {data.parameter && (
                      <div className="text-sm text-gray-600 mt-1">{data.parameter}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{data.value}</div>
                    <div className="text-sm text-gray-500">{formatTime(data.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Brazil Economic Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Brasil</h3>
            <div className="space-y-4">
              {Object.entries(brData).map(([key, data]) => (
                <div key={key} className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{data.name}</div>
                    {data.parameter && (
                      <div className="text-sm text-gray-600 mt-1">{data.parameter}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{data.value}</div>
                    <div className="text-sm text-gray-500">{formatTime(data.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataPanel;
