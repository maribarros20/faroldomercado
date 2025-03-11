
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart } from "lucide-react";

interface MarketMetricsProps {
  marketMetrics: {
    rows: {
      label: string;
      values: string[];
    }[];
    headers: string[];
  };
}

const MarketMetricsPanel: React.FC<MarketMetricsProps> = ({ marketMetrics }) => {
  if (!marketMetrics || !marketMetrics.rows || marketMetrics.rows.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-[#0066FF]" />
            Métricas de Mercado
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] font-semibold">Métrica</TableHead>
                {marketMetrics.headers.slice(1).map((header, index) => (
                  <TableHead key={index} className="text-center font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketMetrics.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {row.values.map((value, cellIndex) => {
                    // Estilização condicional baseada no valor
                    let textColorClass = "text-black";
                    
                    // Lógica para colorir valores (primeira coluna)
                    if (cellIndex === 0) {
                      if (value.includes("-")) {
                        textColorClass = "text-red-600 font-semibold";
                      } else if (value.includes("+") || parseFloat(value) > 0) {
                        textColorClass = "text-green-600 font-semibold";
                      }
                    }
                    
                    // Lógica para colorir status (segunda coluna)
                    if (cellIndex === 1) {
                      if (value.toUpperCase().includes("ALTO") || 
                          value.toUpperCase().includes("ELEVAD")) {
                        textColorClass = "text-amber-600 font-semibold";
                      } else if (value.toUpperCase().includes("BAIXO") || 
                                value.toUpperCase().includes("FRACO")) {
                        textColorClass = "text-red-600 font-semibold";
                      }
                    }
                    
                    // Lógica para colorir impacto (terceira coluna)
                    if (cellIndex === 2) {
                      if (value.toUpperCase().includes("NEGATIVO")) {
                        textColorClass = "text-red-600 font-semibold";
                      } else if (value.toUpperCase().includes("POSITIVO")) {
                        textColorClass = "text-green-600 font-semibold";
                      } else if (value.toUpperCase().includes("NEUTRO") || 
                               value.toUpperCase().includes("CAUTELA")) {
                        textColorClass = "text-amber-600 font-semibold";
                      }
                    }
                    
                    return (
                      <TableCell key={cellIndex} className={`text-center ${textColorClass}`}>
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketMetricsPanel;
