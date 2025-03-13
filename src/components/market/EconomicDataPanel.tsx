
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EconomicDataPanelProps {
  brDiRates: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const EconomicDataPanel: React.FC<EconomicDataPanelProps> = ({ brDiRates }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };
  
  // Filter out SELIC, IPCA and alerts which are displayed elsewhere
  const excludedKeys = ['BR_SELIC', 'BR_IPCA', 'MARKET_ALERT_1', 'MARKET_ALERT_2'];
  
  // Filter and sort the DI rates
  const filteredDiRates = Object.entries(brDiRates)
    .filter(([key]) => !excludedKeys.includes(key) && key.includes("DI1F"))
    .sort((a, b) => {
      // Extract number from DI1F string (e.g. "DI1F25" -> 25)
      const numA = parseInt(a[0].replace(/\D/g, '')) || 0;
      const numB = parseInt(b[0].replace(/\D/g, '')) || 0;
      return numA - numB;
    })
    .map(([key, data]) => data);

  if (filteredDiRates.length === 0) {
    return null; // Don't show panel if no data
  }

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <Activity className="h-6 w-6 mr-2" />
          Futuros de Taxas de Juros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Vencimento</TableHead>
              <TableHead className="text-right font-semibold">Horário</TableHead>
              <TableHead className="text-right font-semibold">Taxa</TableHead>
              <TableHead className="text-right font-semibold">Variação</TableHead>
              <TableHead className="text-right font-semibold">Parâmetro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiRates.map((rate, idx) => {
              // Clean up name: Extract the month/year part if possible
              let displayName = rate.name;
              if (displayName.includes("DI1F")) {
                const match = displayName.match(/DI1F(\d+)/);
                if (match && match[1]) {
                  const month = match[1].slice(-2);
                  const year = match[1].slice(0, -2) || new Date().getFullYear().toString().slice(-2);
                  displayName = `${month}/${year}`;
                }
              }
              
              return (
                <TableRow key={idx} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{displayName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end text-gray-500 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(rate.time)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{rate.value}</TableCell>
                  <TableCell 
                    className={`text-right font-medium ${
                      isNegative(rate.change) 
                        ? 'text-[#ef4444]' 
                        : rate.change === '0%' || rate.change === '0.00%' 
                          ? 'text-black' 
                          : 'text-[#22c55e]'
                    }`}
                  >
                    {rate.change}
                  </TableCell>
                  <TableCell 
                    className={`text-right text-sm ${
                      rate.parameter?.includes('NEGATIV') 
                        ? 'text-[#ef4444]' 
                        : rate.parameter?.includes('POSITIV') 
                          ? 'text-[#22c55e]' 
                          : 'text-gray-600'
                    }`}
                  >
                    {rate.parameter || ""}
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

export default EconomicDataPanel;
