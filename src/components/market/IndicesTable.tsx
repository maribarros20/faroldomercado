
import React from "react";
import { Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MarketIndex {
  key: string;
  name: string;
  time_data: string;
  value: string;
  change_value: string;
  parameter?: string;
}

interface IndicesTableProps {
  indices: MarketIndex[];
  isLoading: boolean;
}

const IndicesTable: React.FC<IndicesTableProps> = ({ indices, isLoading }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  // Clean display names by removing "Índices Futuros" prefix
  const getDisplayName = (name: string) => {
    return name.replace(/^Índices Futuros\s+/i, '');
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  return (
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
        {indices.length > 0 ? (
          indices.map((index, idx) => (
            <TableRow key={idx} className="hover:bg-gray-50">
              <TableCell className="font-medium">{getDisplayName(index.name)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end text-gray-500 text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(index.time_data)}
                </div>
              </TableCell>
              <TableCell className="text-right">{index.value}</TableCell>
              <TableCell 
                className={`text-right font-medium ${
                  isNegative(index.change_value) 
                    ? 'text-[#ef4444]' 
                    : index.change_value === '0%' || index.change_value === '0.00%' 
                      ? 'text-black' 
                      : 'text-[#22c55e]'
                }`}
              >
                {index.change_value}
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
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              Nenhum dado disponível
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default IndicesTable;
