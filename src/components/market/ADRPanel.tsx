
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  // Helper function to get company name from ADR ticker
  const getCompanyName = (ticker: string) => {
    const names: {[key: string]: string} = {
      "VALE": "Vale S.A.",
      "PBR": "Petrobras (Ord.)",
      "PBRA": "Petrobras (Pref.)",
      "ITUB": "Itaú Unibanco",
      "BBD": "Bradesco",
      "BBDO": "Bradesco (Ord.)",
      "BSBR": "Santander Brasil"
    };
    return names[ticker] || ticker;
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <Landmark className="h-6 w-6 mr-2" />
          ADRs Brasileiras
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">ADR</TableHead>
              <TableHead className="text-right font-semibold">Horário</TableHead>
              <TableHead className="text-right font-semibold">Valor</TableHead>
              <TableHead className="text-right font-semibold">Variação</TableHead>
              <TableHead className="text-right font-semibold">Vs Fechamento</TableHead>
              <TableHead className="text-right font-semibold">After Market</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(adrs).map(([key, adr]) => {
              const isChangePositive = !isNegative(adr.change);
              const isPrevChangePositive = !isNegative(adr.prevChange);
              const isAfterChangePositive = !isNegative(adr.afterChange);
              
              return (
                <TableRow key={key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="font-medium">{key}</div>
                    <div className="text-xs text-gray-500">{getCompanyName(key)}</div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    <div className="flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {adr.time}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">${adr.value}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    isNegative(adr.change) 
                      ? 'text-[#ef4444]' 
                      : adr.change === '0%' || adr.change === '0.00%' 
                        ? 'text-black' 
                        : 'text-[#22c55e]'
                  }`}>
                    {adr.change}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    isNegative(adr.prevChange)
                      ? 'text-[#ef4444]' 
                      : adr.prevChange === '0%' || adr.prevChange === '0.00%' 
                        ? 'text-black' 
                        : 'text-[#22c55e]'
                  }`}>
                    {adr.prevChange}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    isNegative(adr.afterChange)
                      ? 'text-[#ef4444]' 
                      : adr.afterChange === '0%' || adr.afterChange === '0.00%' 
                        ? 'text-black' 
                        : 'text-[#22c55e]'
                  }`}>
                    {adr.afterChange}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ADRPanel;
