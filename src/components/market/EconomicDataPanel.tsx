
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EconomicData {
  name: string;
  time: string;
  value: string;
  change: string;
  parameter?: string;
}

interface EconomicDataPanelProps {
  brDiRates: {
    [key: string]: EconomicData;
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

  // Sort DI rates by term ascending
  const sortedDiRates = Object.entries(brDiRates)
    .sort(([keyA], [keyB]) => {
      const yearA = parseInt(keyA.match(/\d+/)?.[0] || "0");
      const yearB = parseInt(keyB.match(/\d+/)?.[0] || "0");
      return yearA - yearB;
    })
    .map(([_, data]) => data);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <TrendingUp className="h-6 w-6 mr-2" />
          DI Futuros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Nome do ativo</TableHead>
              <TableHead className="text-right font-semibold">Horário</TableHead>
              <TableHead className="text-right font-semibold">Valor</TableHead>
              <TableHead className="text-right font-semibold">Variação</TableHead>
              <TableHead className="text-right font-semibold">Parâmetro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDiRates.map((data, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50">
                <TableCell className="font-medium">{data.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end text-gray-500 text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(data.time)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{data.value}</TableCell>
                <TableCell 
                  className={`text-right font-medium ${
                    isNegative(data.change)
                      ? 'text-[#ef4444]' 
                      : data.change === '0%' || data.change === '0.00%' 
                        ? 'text-black' 
                        : 'text-[#22c55e]'
                  }`}
                >
                  {data.change}
                </TableCell>
                <TableCell 
                  className={`text-right text-sm ${
                    data.parameter?.includes('NEGATIV') 
                      ? 'text-[#ef4444]' 
                      : data.parameter?.includes('POSITIV') 
                        ? 'text-[#22c55e]' 
                        : 'text-gray-600'
                  }`}
                >
                  {data.parameter || ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EconomicDataPanel;
