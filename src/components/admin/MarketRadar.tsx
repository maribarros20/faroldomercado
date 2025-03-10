
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchStockData, StockData } from "@/services/stockService";
import { generateAlerts, AlertData } from "@/utils/alertUtils";
import StockList from "@/components/market/StockList";
import MarketAlerts from "@/components/market/MarketAlerts";
import StockSelector from "@/components/market/StockSelector";

export default function MarketRadar() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [userStocks, setUserStocks] = useState<StockData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStockData();
      setStocks(data);
      // Inicialmente carregamos os primeiros 10 ativos ou menos se não houver 10
      setUserStocks(data.slice(0, Math.min(10, data.length))); 
      setAlerts(generateAlerts(data));
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const addStock = () => {
    const stockToAdd = stocks.find(stock => stock.ticker === selectedStock);
    if (stockToAdd && !userStocks.some(s => s.ticker === stockToAdd.ticker)) {
      setUserStocks(prevStocks => [...prevStocks, stockToAdd]);
    }
  };

  const removeStock = (ticker: string) => {
    setUserStocks(prevStocks => prevStocks.filter(stock => stock.ticker !== ticker));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Acompanhamento da Carteira</h2>
          <p className="text-muted-foreground">Acompanhe suas ações e principais índices de mercado</p>
        </div>
        <Button 
          onClick={loadData} 
          variant="refresh"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <StockSelector 
        stocks={stocks}
        userStocks={userStocks}
        selectedStock={selectedStock}
        onSelectStock={setSelectedStock}
        onAddStock={addStock}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Lista de Ativos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Índices e Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : (
              <StockList 
                stocks={userStocks} 
                onRemoveStock={removeStock}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Alertas de Mercado</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketAlerts alerts={alerts} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
