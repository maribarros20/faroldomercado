
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MarketIndicesPanelProps {
  indices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
      chart?: string[];
    };
  };
}

const MarketIndicesPanel: React.FC<MarketIndicesPanelProps> = ({ indices }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  // Filter indices for display - only US, European and international futures
  const displayIndices = ['SP500', 'DOW', 'NASDAQ', 'EURO_STOXX', 'FTSE100', 'CHINA_A50']
    .filter(key => indices[key])
    .map(key => indices[key]);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <BarChart4 className="h-6 w-6 mr-2" />
          Índices Futuros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Índice</TableHead>
              <TableHead className="text-right font-semibold">Valor</TableHead>
              <TableHead className="text-right font-semibold">Variação</TableHead>
              <TableHead className="text-right font-semibold">Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayIndices.map((index, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50">
                <TableCell className="font-medium">{index.name}</TableCell>
                <TableCell className="text-right">{index.value}</TableCell>
                <TableCell 
                  className={`text-right font-medium ${isNegative(index.change) ? 'text-red-600' : 'text-green-600'}`}
                >
                  {index.change}
                </TableCell>
                <TableCell className="text-right text-gray-500 text-sm">{formatTime(index.time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MarketIndicesPanel;
