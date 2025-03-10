
import React from "react";
import { StockData } from "@/services/stockService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StockListProps {
  stocks: StockData[];
  onRemoveStock: (ticker: string) => void;
  isLoading: boolean;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const StockList: React.FC<StockListProps> = ({ stocks, onRemoveStock, isLoading }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ativo</TableHead>
          <TableHead>Hora Cotação</TableHead>
          <TableHead>Atual</TableHead>
          <TableHead>Variação</TableHead>
          <TableHead>%</TableHead>
          <TableHead>Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
              Nenhum ativo selecionado
            </TableCell>
          </TableRow>
        ) : (
          stocks.map((stock) => (
            <TableRow key={stock.ticker}>
              <TableCell>
                <div className="font-medium">{stock.ticker}</div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </TableCell>
              <TableCell className="text-gray-500 text-sm">{stock.updateTime}</TableCell>
              <TableCell>{formatCurrency(stock.lastPrice)}</TableCell>
              <TableCell>{stock.changePrice.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {stock.changePercent > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : stock.changePercent < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : null}
                  <span className={stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  onClick={() => onRemoveStock(stock.ticker)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 p-0 h-8 w-8"
                >
                  🗑
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StockList;
