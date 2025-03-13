
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SafetyAssetsPanel from "./SafetyAssetsPanel";

interface MarketIndicesSafetySectionProps {
  marketIndices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
  safetyAssets: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const IndicesAndAssetsSection: React.FC<MarketIndicesSafetySectionProps> = ({ 
  marketIndices, 
  safetyAssets 
}) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Indices Panel */}
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
                <TableHead className="font-semibold">Nome do ativo</TableHead>
                <TableHead className="text-right font-semibold">Horário</TableHead>
                <TableHead className="text-right font-semibold">Valor</TableHead>
                <TableHead className="text-right font-semibold">Variação</TableHead>
                <TableHead className="text-right font-semibold">Parâmetro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(marketIndices)
                .filter(([key]) => ['SP500', 'DOW', 'NASDAQ', 'EURO_STOXX', 'FTSE100', 'CHINA_A50'].includes(key))
                .map(([key, index]) => {
                  // Remove "Índices Futuros" prefix from name
                  const displayName = index.name.replace(/^Índices Futuros\s+/i, '');
                  return (
                    <TableRow key={key} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end text-gray-500 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(index.time)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{index.value}</TableCell>
                      <TableCell 
                        className={`text-right font-medium ${
                          isNegative(index.change)
                            ? 'text-[#ef4444]' 
                            : index.change === '0%' || index.change === '0.00%'
                              ? 'text-black' 
                              : 'text-[#22c55e]'
                        }`}
                      >
                        {index.change}
                      </TableCell>
                      <TableCell 
                        className={`text-right text-sm ${
                          index.parameter?.includes('NEGATIV') 
                            ? 'text-[#ef4444]' 
                            : index.parameter?.includes('POSITIV') 
                              ? 'text-[#22c55e]' 
                              : 'text-gray-600'
                        }`}
                      >
                        {index.parameter || ""}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Safety Assets */}
      <SafetyAssetsPanel assets={safetyAssets} />
    </div>
  );
};

export default IndicesAndAssetsSection;
