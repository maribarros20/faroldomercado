
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
import StockCardCarousel from "@/components/market/StockCardCarousel";
import MarketSnapshot from "@/components/market/MarketSnapshot";
import { format } from "date-fns";

export default function MarketRadar() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [userStocks, setUserStocks] = useState<StockData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");

  // Get US stocks (7 magnificas)
  const getUSStocks = () => {
    return stocks.filter(stock => 
      ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"].includes(stock.ticker)
    );
  };

  // Get Brazilian stocks (top stocks)
  const getBrazilianStocks = () => {
    return stocks.filter(stock => 
      ["ITUB4", "BBDC4", "VALE3", "PETR4", "PETR3", "ABEV3", "BBAS3", "B3SA3", "ITSA4"].includes(stock.ticker)
    );
  };

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

  // Get main stock for snapshot (IBOV or first stock)
  const getMainIndex = () => {
    const ibov = stocks.find(stock => stock.ticker === "IBOV");
    return ibov || stocks[0] || {
      ticker: "IBOV",
      lastPrice: 120000,
      prevCloseD1: 121000,
      openPrice: 120500,
      min10Days: 115000,
      max10Days: 125000,
      updateTime: "16:30",
      name: "Ibovespa"
    };
  };

  // Format current date
  const getCurrentDate = () => {
    return format(new Date(), "MM/dd/yy");
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

      {/* US Stocks Carousel */}
      <StockCardCarousel 
        stocks={getUSStocks()}
        title="US Top Stocks (Magnificent 7)"
        isLoading={isLoading}
      />

      {/* Brazilian Stocks Carousel */}
      <StockCardCarousel 
        stocks={getBrazilianStocks()}
        title="Maiores Ações Brasileiras"
        isLoading={isLoading}
      />

      <StockSelector 
        stocks={stocks}
        userStocks={userStocks}
        selectedStock={selectedStock}
        onSelectStock={setSelectedStock}
        onAddStock={addStock}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Lista de Ativos */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Market Snapshot */}
        <div>
          <MarketSnapshot 
            title={`${getMainIndex().ticker} Snapshot`}
            value={getMainIndex().lastPrice.toFixed(2)}
            prevClose={getMainIndex().prevCloseD1}
            open={getMainIndex().openPrice}
            dayLow={getMainIndex().min10Days}
            dayHigh={getMainIndex().max10Days}
            weekLow={getMainIndex().min10Days * 0.9} 
            weekHigh={getMainIndex().max10Days * 1.1}
            time={getMainIndex().updateTime}
            date={getCurrentDate()}
          />

          {/* Alertas */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Alertas de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketAlerts alerts={alerts} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
