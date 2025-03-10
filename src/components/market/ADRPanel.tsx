
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface ADRPanelProps {
  adrs: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      prevChange: string;
      afterChange: string;
    };
  };
}

const ADRPanel: React.FC<ADRPanelProps> = ({ adrs }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>ADRs Brasileiras</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-2 font-semibold text-gray-600">ADR</th>
                <th className="text-right pb-2 font-semibold text-gray-600">Horário</th>
                <th className="text-right pb-2 font-semibold text-gray-600">Valor</th>
                <th className="text-right pb-2 font-semibold text-gray-600">Variação</th>
                <th className="text-right pb-2 font-semibold text-gray-600">Vs Fechamento</th>
                <th className="text-right pb-2 font-semibold text-gray-600">After Market</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(adrs).map(([key, adr]) => {
                const isChangePositive = !adr.change.includes("-");
                const isPrevChangePositive = !adr.prevChange.includes("-");
                const isAfterChangePositive = !adr.afterChange.includes("-");
                
                return (
                  <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{adr.name}</td>
                    <td className="py-3 text-right text-sm text-gray-500">{adr.time}</td>
                    <td className="py-3 text-right">${adr.value}</td>
                    <td className="py-3 text-right">
                      <div className={`flex items-center justify-end ${isChangePositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isChangePositive ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        <span>{adr.change}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className={isPrevChangePositive ? 'text-green-600' : 'text-red-600'}>
                        {adr.prevChange}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={isAfterChangePositive ? 'text-green-600' : 'text-red-600'}>
                        {adr.afterChange}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ADRPanel;
