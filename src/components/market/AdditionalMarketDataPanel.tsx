
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Clock } from "lucide-react";

interface AdditionalMarketDataProps {
  marketData: {
    rows: {
      label: string;
      values: string[];
      time?: string;
    }[];
    headers: string[];
  };
}

const AdditionalMarketDataPanel: React.FC<AdditionalMarketDataProps> = ({ marketData }) => {
  if (!marketData || !marketData.rows || marketData.rows.length === 0) {
    return null;
  }

  // Determina se tem a coluna de tendências (geralmente a última coluna)
  const hasTrend = marketData.headers.length > 3;

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#0066FF]" />
            Dados Adicionais do Mercado
          </span>
          <span className="text-sm font-normal flex items-center">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            Atualizado
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] font-semibold">Indicador</TableHead>
                {marketData.headers.slice(1).map((header, index) => (
                  <TableHead key={index} className="text-center font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketData.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {row.values.map((value, cellIndex) => {
                    // Estilização condicional baseada no valor
                    let textColorClass = "text-black";
                    
                    // Lógica para colorir valores de variação (geralmente segunda coluna)
                    if (cellIndex === 1 && value.includes("-")) {
                      textColorClass = "text-red-600 font-semibold";
                    } else if (cellIndex === 1 && (value.includes("+") || parseFloat(value) > 0)) {
                      textColorClass = "text-green-600 font-semibold";
                    }
                    
                    // Lógica para colorir status (geralmente terceira coluna)
                    if (cellIndex === 2) {
                      if (value.toUpperCase().includes("NEGATIVO") || 
                          value.toUpperCase().includes("BAIXO") || 
                          value.toUpperCase().includes("FRACO")) {
                        textColorClass = "text-red-600 font-semibold";
                      } else if (value.toUpperCase().includes("POSITIVO") || 
                                value.toUpperCase().includes("ALTO") || 
                                value.toUpperCase().includes("FORTE")) {
                        textColorClass = "text-green-600 font-semibold";
                      } else if (value.toUpperCase().includes("NEUTRO")) {
                        textColorClass = "text-amber-600 font-semibold";
                      }
                    }
                    
                    // Estilização para tendências
                    if (hasTrend && cellIndex === 3) {
                      if (value.toUpperCase().includes("QUEDA")) {
                        textColorClass = "text-red-600 font-semibold";
                      } else if (value.toUpperCase().includes("ALTA")) {
                        textColorClass = "text-green-600 font-semibold";
                      } else if (value.toUpperCase().includes("LATERAL")) {
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

export default AdditionalMarketDataPanel;
