
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketMetricsPanelProps {
  data: {
    rows: Array<{
      title?: string;
      data: string[];
      isHeader?: boolean;
    }>;
    time?: string;
  };
}

const MarketMetricsPanel: React.FC<MarketMetricsPanelProps> = ({ data }) => {
  if (!data || !data.rows || data.rows.length === 0) {
    return null;
  }

  const headerRow = data.rows.find(row => row.isHeader);
  const dataRows = data.rows.filter(row => !row.isHeader);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-[#0066FF]" />
            Métricas de Mercado
          </span>
          {data.time && (
            <span className="text-sm font-normal flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              {data.time}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] bg-gray-50">Métrica</TableHead>
                {headerRow && headerRow.data.map((header, index) => (
                  <TableHead key={index} className="bg-gray-50 text-center">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  {row.data.map((cell, cellIndex) => {
                    // Determine styling based on cell content
                    let icon = null;
                    let textClass = "";
                    
                    if (cell.includes("↑") || cell.includes("alta") || cell.includes("positiv") || cell.includes("aument")) {
                      icon = <TrendingUp className="h-4 w-4 inline mr-1 text-green-500" />;
                      textClass = "text-green-600";
                    } else if (cell.includes("↓") || cell.includes("baixa") || cell.includes("negativ") || cell.includes("queda")) {
                      icon = <TrendingDown className="h-4 w-4 inline mr-1 text-red-500" />;
                      textClass = "text-red-600";
                    }
                    
                    // For numerical values
                    if (!isNaN(Number(cell.replace('%', '').replace(',', '.')))) {
                      const value = Number(cell.replace('%', '').replace(',', '.'));
                      if (value < 0) {
                        textClass = "text-red-600";
                      } else if (value > 0) {
                        textClass = "text-green-600";
                      }
                    }
                    
                    return (
                      <TableCell key={cellIndex} className={`text-center ${textClass}`}>
                        {icon}{cell}
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
