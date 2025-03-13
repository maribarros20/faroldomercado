
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BarChart4 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CommoditiesPanelProps {
  commodities: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const CommoditiesPanel: React.FC<CommoditiesPanelProps> = ({ commodities }) => {
  const getCommodityDisplayInfo = (key: string) => {
    switch (key) {
      case "BRENT":
        return { 
          name: "Petróleo Brent", 
          description: "Referência para mercados europeus"
        };
      case "WTI":
        return { 
          name: "Petróleo WTI", 
          description: "Referência para mercados americanos"
        };
      case "IRON_SING":
        return { 
          name: "Minério Ferro (Singapura)", 
          description: "Cotação em Singapura"
        };
      case "IRON_DALIAN":
        return {
          name: "Minério Ferro (Dalian)", 
          description: "Cotação na China"
        };
      default:
        return { name: key, description: "" };
    }
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <BarChart4 className="h-6 w-6 mr-2" />
          Commodities
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
            {Object.entries(commodities).map(([key, commodity]) => {
              const { name, description } = getCommodityDisplayInfo(key);
              const isChangeNegative = isNegative(commodity.change);
              
              return (
                <TableRow key={key} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end text-gray-500 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(commodity.time)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{commodity.value}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    isChangeNegative
                      ? 'text-[#ef4444]' 
                      : commodity.change === '0%' || commodity.change === '0.00%' 
                        ? 'text-black' 
                        : 'text-[#22c55e]'
                  }`}>
                    {commodity.change}
                  </TableCell>
                  <TableCell className={`text-right text-sm ${
                    commodity.parameter?.includes('NEGATIV') 
                      ? 'text-[#ef4444]' 
                      : commodity.parameter?.includes('POSITIV') 
                        ? 'text-[#22c55e]' 
                        : 'text-gray-600'
                  }`}>
                    {commodity.parameter || ""}
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

export default CommoditiesPanel;
