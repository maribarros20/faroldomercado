
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";

interface AdditionalMarketDataPanelProps {
  data: {
    rows: Array<{
      title?: string;
      data: string[];
      isHeader?: boolean;
    }>;
    time?: string;
  };
}

const AdditionalMarketDataPanel: React.FC<AdditionalMarketDataPanelProps> = ({ data }) => {
  if (!data || !data.rows || data.rows.length === 0) {
    return null;
  }

  const headerRow = data.rows.find(row => row.isHeader);
  const dataRows = data.rows.filter(row => !row.isHeader);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="text-[#0066FF]">Dados de Mercado Adicionais</span>
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
                <TableHead className="w-[180px] bg-gray-50">Indicador</TableHead>
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
                    // Check if cell contains a percentage or numerical value that might be negative
                    const isNegative = cell.includes('-') || 
                                     (cell.includes('%') && cell.includes('-'));
                    const isPositive = !cell.includes('-') && 
                                     (cell.includes('%') || !isNaN(Number(cell.replace('%', ''))));
                    
                    return (
                      <TableCell 
                        key={cellIndex} 
                        className={`text-center ${isNegative ? 'text-red-600' : (isPositive ? 'text-green-600' : '')}`}
                      >
                        {cell}
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
