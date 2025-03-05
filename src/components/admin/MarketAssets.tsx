
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

// Tipos de ativos
type Asset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
};

// Lista de ativos disponíveis
const availableAssets = [
  { symbol: "IBOVESPA", name: "IBOVESPA" },
  { symbol: "NASDAQ", name: "NASDAQ" },
  { symbol: "S&P500", name: "S&P 500" },
  { symbol: "DJIA", name: "DOW JONES" },
  { symbol: "EURUSD", name: "EUR/USD" },
  { symbol: "BTCUSD", name: "BTC/USD" },
  { symbol: "PETR4.SA", name: "PETROBRAS" },
  { symbol: "VALE3.SA", name: "VALE" },
  { symbol: "ITUB4.SA", name: "ITAÚ" },
  { symbol: "BBDC4.SA", name: "BRADESCO" },
  { symbol: "MGLU3.SA", name: "MAGAZINE LUIZA" },
  { symbol: "WEGE3.SA", name: "WEG" },
];

// Função para obter dados simulados de um ativo (em um ambiente real, usaria a API do Google Finance)
const fetchAssetData = (symbol: string): Promise<Asset> => {
  return new Promise((resolve) => {
    // Dados simulados - em produção, usaria a API do Google Finance ou similar
    const randomPrice = Math.random() * 1000;
    const randomChange = (Math.random() * 20) - 10;
    const randomChangePercent = (randomChange / randomPrice) * 100;
    
    // Simulando uma chamada de API
    setTimeout(() => {
      resolve({
        symbol,
        name: availableAssets.find(a => a.symbol === symbol)?.name || symbol,
        price: parseFloat(randomPrice.toFixed(2)),
        change: parseFloat(randomChange.toFixed(2)),
        changePercent: parseFloat(randomChangePercent.toFixed(2)),
        lastUpdated: new Date().toLocaleTimeString()
      });
    }, 500);
  });
};

const MarketAssets = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    // Verificar se há ativos salvos no localStorage
    const savedAssets = localStorage.getItem("selectedAssets");
    if (savedAssets) {
      const symbols = JSON.parse(savedAssets) as string[];
      loadAssetData(symbols);
    } else {
      // Carregar alguns ativos padrão
      loadAssetData(["IBOVESPA", "S&P500", "BTCUSD"]);
    }
  }, []);

  // Carregar dados dos ativos a partir de seus símbolos
  const loadAssetData = async (symbols: string[]) => {
    setIsLoading(true);
    try {
      const assetDataPromises = symbols.map(symbol => fetchAssetData(symbol));
      const assetData = await Promise.all(assetDataPromises);
      setSelectedAssets(assetData);
      
      // Salvar no localStorage
      localStorage.setItem("selectedAssets", JSON.stringify(symbols));
    } catch (error) {
      console.error("Erro ao carregar dados dos ativos:", error);
      toast({
        title: "Erro ao carregar ativos",
        description: "Não foi possível obter os dados dos ativos selecionados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar um novo ativo à lista
  const handleAddAsset = async () => {
    if (!newAsset || selectedAssets.some(asset => asset.symbol === newAsset)) {
      return;
    }

    setIsLoading(true);
    try {
      const assetData = await fetchAssetData(newAsset);
      setSelectedAssets(prev => [...prev, assetData]);
      
      // Atualizar localStorage
      const symbols = [...selectedAssets.map(a => a.symbol), newAsset];
      localStorage.setItem("selectedAssets", JSON.stringify(symbols));
      
      setNewAsset("");
    } catch (error) {
      console.error("Erro ao adicionar ativo:", error);
      toast({
        title: "Erro ao adicionar ativo",
        description: "Não foi possível obter os dados do ativo selecionado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remover um ativo da lista
  const handleRemoveAsset = (symbol: string) => {
    const updatedAssets = selectedAssets.filter(asset => asset.symbol !== symbol);
    setSelectedAssets(updatedAssets);
    
    // Atualizar localStorage
    const symbols = updatedAssets.map(a => a.symbol);
    localStorage.setItem("selectedAssets", JSON.stringify(symbols));
  };

  // Atualizar todos os ativos
  const handleRefreshAll = async () => {
    if (selectedAssets.length === 0) return;
    
    setIsLoading(true);
    try {
      await loadAssetData(selectedAssets.map(a => a.symbol));
      toast({
        title: "Ativos atualizados",
        description: "Os dados dos ativos foram atualizados com sucesso.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Índices e Ativos</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAll} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Valores em tempo real dos principais mercados
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Select value={newAsset} onValueChange={setNewAsset}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um ativo" />
            </SelectTrigger>
            <SelectContent>
              {availableAssets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddAsset} disabled={!newAsset || isLoading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-3 mt-4">
          {selectedAssets.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-md">
                  {asset.symbol.substring(0, 1)}
                </div>
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-xs text-muted-foreground">Último preço</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold">{asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="flex items-center justify-end">
                    {asset.change > 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${asset.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change > 0 ? '+' : ''}{asset.change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({asset.change > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveAsset(asset.symbol)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {selectedAssets.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum ativo selecionado. Adicione ativos para acompanhar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAssets;
