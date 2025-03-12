
import React from "react";
import { StockData } from "@/services/stockService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";

interface StockListProps {
  stocks: StockData[];
  onRemoveStock: (ticker: string) => void;
  isLoading: boolean;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(value)
    .replace("R$", "")
    .trim();
}

const StockList: React.FC<StockListProps> = ({ stocks, onRemoveStock, isLoading }) => {
  const { toast } = useToast();
  const { userId } = useUserProfile();

  const handleRemoveStock = async (ticker: string) => {
    onRemoveStock(ticker);
    
    // Also delete from Supabase if authenticated
    if (userId) {
      try {
        const { error } = await supabase
          .from('users_favorites')
          .delete()
          .match({ user_id: userId, ticker });
        
        if (error) {
          console.error("Error removing favorite:", error);
          toast({
            title: "Erro ao remover favorito",
            description: error.message,
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Exception removing favorite:", err);
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="font-semibold">Ativo</TableHead>
          <TableHead className="text-right font-semibold">Horário</TableHead>
          <TableHead className="text-right font-semibold">Abertura</TableHead>
          <TableHead className="text-right font-semibold">Fechamento</TableHead>
          <TableHead className="text-right font-semibold">Atual</TableHead>
          <TableHead className="text-right font-semibold">Variação</TableHead>
          <TableHead className="text-right font-semibold">%</TableHead>
          <TableHead className="text-right font-semibold">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
              Nenhum ativo selecionado
            </TableCell>
          </TableRow>
        ) : (
          stocks.map((stock) => (
            <TableRow key={stock.ticker} className="hover:bg-gray-50">
              <TableCell>
                <div className="font-medium">{stock.ticker}</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-xs text-gray-500">{stock.updateTime}</div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(stock.openPrice)}</TableCell>
              <TableCell className="text-right">{formatCurrency(stock.prevCloseD1)}</TableCell>
              <TableCell className="text-right">{formatCurrency(stock.lastPrice)}</TableCell>
              <TableCell className="text-right">{stock.changePrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
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
              <TableCell className="text-right">
                <Button 
                  onClick={() => handleRemoveStock(stock.ticker)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 p-0 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
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
