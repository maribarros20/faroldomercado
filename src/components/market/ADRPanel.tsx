
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
              const isChangePositive = !adr.change.includes("-");
              const isPrevChangePositive = !adr.prevChange.includes("-");
              const isAfterChangePositive = !adr.afterChange.includes("-");
              
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
                  <TableCell className={`text-right font-medium ${isChangePositive ? 'text-green-600' : 'text-red-600'}`}>
                    {adr.change}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${isPrevChangePositive ? 'text-green-600' : 'text-red-600'}`}>
                    {adr.prevChange}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${isAfterChangePositive ? 'text-green-600' : 'text-red-600'}`}>
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
