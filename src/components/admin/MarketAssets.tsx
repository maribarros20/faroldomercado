
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Asset, fetchAssetData } from "@/utils/assetUtils";
import AssetSelector from "./assets/AssetSelector";
import AssetList from "./assets/AssetList";

const MarketAssets = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    // Check for saved assets in localStorage
    const savedAssets = localStorage.getItem("selectedAssets");
    if (savedAssets) {
      const symbols = JSON.parse(savedAssets) as string[];
      loadAssetData(symbols);
    } else {
      // Load default assets
      loadAssetData(["IBOVESPA", "S&P500", "BTCUSD"]);
    }
  }, []);

  // Load asset data from symbols
  const loadAssetData = async (symbols: string[]) => {
    setIsLoading(true);
    try {
      const assetDataPromises = symbols.map(symbol => fetchAssetData(symbol));
      const assetData = await Promise.all(assetDataPromises);
      setSelectedAssets(assetData);
      
      // Save to localStorage
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

  // Add a new asset to the list
  const handleAddAsset = async () => {
    if (!newAsset || selectedAssets.some(asset => asset.symbol === newAsset)) {
      return;
    }

    setIsLoading(true);
    try {
      const assetData = await fetchAssetData(newAsset);
      setSelectedAssets(prev => [...prev, assetData]);
      
      // Update localStorage
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

  // Remove an asset from the list
  const handleRemoveAsset = (symbol: string) => {
    const updatedAssets = selectedAssets.filter(asset => asset.symbol !== symbol);
    setSelectedAssets(updatedAssets);
    
    // Update localStorage
    const symbols = updatedAssets.map(a => a.symbol);
    localStorage.setItem("selectedAssets", JSON.stringify(symbols));
  };

  // Refresh all assets
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
        <AssetSelector
          newAsset={newAsset}
          setNewAsset={setNewAsset}
          onAddAsset={handleAddAsset}
          isLoading={isLoading}
        />
        
        <AssetList
          assets={selectedAssets}
          onRemoveAsset={handleRemoveAsset}
        />
      </CardContent>
    </Card>
  );
};

export default MarketAssets;
