
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
              <TableHead className="font-semibold">Commodity</TableHead>
              <TableHead className="text-right font-semibold">Valor</TableHead>
              <TableHead className="text-right font-semibold">Variação</TableHead>
              <TableHead className="text-right font-semibold">Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(commodities).map(([key, commodity]) => {
              const { name, description } = getCommodityDisplayInfo(key);
              const isChangePositive = !commodity.change.includes("-");
              
              return (
                <TableRow key={key} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{commodity.value}</TableCell>
                  <TableCell className={`text-right font-medium ${isChangePositive ? 'text-green-600' : 'text-red-600'}`}>
                    {commodity.change}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {commodity.time && (
                      <div className="flex items-center justify-end">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{commodity.time}</span>
                      </div>
                    )}
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
