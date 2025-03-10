
import React, { useState, useEffect } from "react";
import { StockData } from "@/services/stockService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const { toast } = useToast();
  const { userId } = useUserProfile();

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStocks(stocks.filter(stock => !userStocks.some(s => s.ticker === stock.ticker)));
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStocks(
        stocks.filter(
          stock => 
            (stock.ticker.toLowerCase().includes(term) || 
             stock.name.toLowerCase().includes(term)) &&
            !userStocks.some(s => s.ticker === stock.ticker)
        )
      );
    }
  }, [searchTerm, stocks, userStocks]);

  const saveFavoriteToSupabase = async (stock: StockData) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('users_favorites')
        .insert({
          user_id: userId,
          ticker: stock.ticker,
          name: stock.name,
          exchange: stock.exchange
        });
      
      if (error) {
        console.error("Error saving favorite:", error);
        toast({
          title: "Erro ao salvar favorito",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Exception saving favorite:", err);
    }
  };

  const handleAddStock = () => {
    onAddStock();
    
    // Save to Supabase if authenticated
    if (userId && selectedStock) {
      const stockToAdd = stocks.find(stock => stock.ticker === selectedStock);
      if (stockToAdd) {
        saveFavoriteToSupabase(stockToAdd);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="w-full md:w-auto relative">
          <Input
            type="search"
            placeholder="Buscar por ticker ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8 bg-white"
          />
          <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={selectedStock} onValueChange={onSelectStock}>
            <SelectTrigger className="w-full md:w-[250px] bg-white">
              <SelectValue placeholder="Selecione um ativo" />
            </SelectTrigger>
            <SelectContent>
              {filteredStocks.map(stock => (
                <SelectItem key={stock.ticker} value={stock.ticker}>
                  {stock.ticker} - {stock.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleAddStock} 
          variant="default" 
          className="bg-[#0066FF] hover:bg-[#004FC4]"
          disabled={!selectedStock || userStocks.some(s => s.ticker === selectedStock)}
        >
          Adicionar Ativo
        </Button>
      </div>
    </div>
  );
};

export default StockSelector;
