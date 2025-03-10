
import React from "react";
import { StockData } from "@/services/stockService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface StockSelectorProps {
  stocks: StockData[];
  userStocks: StockData[];
  selectedStock: string;
  onSelectStock: (value: string) => void;
  onAddStock: () => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  userStocks,
  selectedStock,
  onSelectStock,
  onAddStock
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-lg border shadow-sm">
      <div className="w-full md:w-auto">
        <Select value={selectedStock} onValueChange={onSelectStock}>
          <SelectTrigger className="w-full md:w-[250px] bg-white">
            <SelectValue placeholder="Selecione um ativo" />
          </SelectTrigger>
          <SelectContent>
            {stocks
              .filter(stock => !userStocks.some(s => s.ticker === stock.ticker))
              .map(stock => (
                <SelectItem key={stock.ticker} value={stock.ticker}>
                  {stock.ticker} - {stock.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={onAddStock} 
        variant="default" 
        disabled={!selectedStock || userStocks.some(s => s.ticker === selectedStock)}
      >
        Adicionar Ativo
      </Button>
    </div>
  );
};

export default StockSelector;
