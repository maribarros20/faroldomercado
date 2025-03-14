
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchStockData, StockData } from "@/services/stockService";
import { generateAlerts, AlertData, markAlertAsSeen } from "@/utils/alertUtils";
import StockList from "@/components/market/StockList";
import MarketAlerts from "@/components/market/MarketAlerts";
import StockSelector from "@/components/market/StockSelector";
import StockCardCarousel from "@/components/market/StockCardCarousel";
import MarketSnapshot from "@/components/market/MarketSnapshot";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useQuery } from "@tanstack/react-query";

export default function MarketRadar() {
  const [userStocks, setUserStocks] = useState<StockData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [snapshotStock, setSnapshotStock] = useState<StockData | null>(null);
  const { toast } = useToast();
  const { userId } = useUserProfile();

  // Use React Query for auto-refreshing stock data
  const {
    data: stocks = [],
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: ['stockData'],
    queryFn: fetchStockData,
    staleTime: 1000 * 60 * 5,
    // Consider data stale after 5 minutes
    refetchInterval: 1000 * 60 * 5,
    // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    meta: {
      onError: (err: Error) => {
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
        console.error(err);
      }
    }
  });

  // Handle successful data fetching
  useEffect(() => {
    if (stocks.length > 0) {
      if (userStocks.length === 0) {
        setUserStocks(stocks.slice(0, Math.min(5, stocks.length)));
      }

      // Get the tickers of user's selected stocks
      const userStockTickers = userStocks.map(stock => stock.ticker);

      // Generate alerts based on all stocks, prioritizing user's stocks
      generateAndFilterAlerts(stocks, userStockTickers);
    }
  }, [stocks, userStocks]);

  // Get US stocks (7 magnificas)
  const getUSStocks = () => {
    return stocks.filter(stock => ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"].includes(stock.ticker));
  };

  // Get Brazilian stocks (top stocks)
  const getBrazilianStocks = () => {
    return stocks.filter(stock => ["ITUB4", "BBDC4", "VALE3", "PETR4", "PETR3", "ABEV3", "BBAS3", "B3SA3", "ITSA4"].includes(stock.ticker));
  };

  async function generateAndFilterAlerts(data: StockData[], userStockTickers: string[]) {
    // Generate alerts based on all stocks, prioritizing user's stocks
    const allAlerts = generateAlerts(data, userStockTickers);

    // Filter out alerts the user has already seen
    if (userId) {
      try {
        const {
          data: seenAlerts,
          error
        } = await supabase.from('users_alerts_seen').select('ticker, alert_type').eq('user_id', userId);
        if (!error && seenAlerts) {
          const filteredAlerts = allAlerts.filter(alert => {
            const [ticker, alertType] = alert.id.split('-');
            return !seenAlerts.some(seen => seen.ticker === ticker && seen.alert_type === alertType);
          });
          setAlerts(filteredAlerts);
        } else {
          setAlerts(allAlerts);
        }
      } catch (err) {
        console.error("Error filtering alerts:", err);
        setAlerts(allAlerts);
      }
    } else {
      setAlerts(allAlerts);
    }
  }

  async function loadUserFavorites() {
    if (!userId || stocks.length === 0) return;
    try {
      const {
        data,
        error
      } = await supabase.from('users_favorites').select('ticker, name, exchange').eq('user_id', userId);
      if (!error && data && data.length > 0) {
        // Match the favorites with the full stock data
        const favoritesWithData = data.map(fav => {
          const stockData = stocks.find(s => s.ticker === fav.ticker);
          return stockData || null;
        }).filter(Boolean) as StockData[];
        if (favoritesWithData.length > 0) {
          setUserStocks(favoritesWithData);
        }
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  }

  const addStock = () => {
    const stockToAdd = stocks.find(stock => stock.ticker === selectedStock);
    if (stockToAdd && !userStocks.some(s => s.ticker === stockToAdd.ticker)) {
      setUserStocks(prevStocks => [...prevStocks, stockToAdd]);

      // Also set this as the snapshot stock
      setSnapshotStock(stockToAdd);
    }
  };

  const removeStock = (ticker: string) => {
    setUserStocks(prevStocks => prevStocks.filter(stock => stock.ticker !== ticker));

    // If the removed stock was the snapshot stock, reset to IBOV or first stock
    if (snapshotStock && snapshotStock.ticker === ticker) {
      const ibov = stocks.find(stock => stock.ticker === "IBOV");
      setSnapshotStock(ibov || stocks[0] || null);
    }
  };

  // Format current date
  const getCurrentDate = () => {
    return format(new Date(), "MM/dd/yy");
  };

  useEffect(() => {
    loadUserFavorites();
  }, [userId, stocks.length]);

  // When stocks or selectedStock changes, update snapshotStock
  useEffect(() => {
    if (selectedStock && stocks.length > 0) {
      const stock = stocks.find(s => s.ticker === selectedStock);
      if (stock) {
        setSnapshotStock(stock);
      }
    } else if (stocks.length > 0) {
      // Default to IBOV or the first stock
      const ibov = stocks.find(stock => stock.ticker === "IBOV");
      setSnapshotStock(ibov || stocks[0]);
    }
  }, [selectedStock, stocks]);

  return <div className="space-y-6 pb-6 bg-gray-100 rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0066FF]">Acompanhamento do mercado</h2>
            <p className="text-gray-600">Acompanhe suas ações e principais índices de mercado</p>
            <p className="text-xs text-gray-500">
              Última atualização: {new Date().toLocaleTimeString()} 
              {isRefetching && " (Atualizando...)"}
            </p>
          </div>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="bg-white shadow-md hover:bg-blue-50" disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {error && <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>}

      {/* US Stocks Carousel */}
      <Card className="shadow-lg bg-white border-none">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl text-trade-blue">7 magníficas - EUA</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <StockCardCarousel stocks={getUSStocks()} title="" isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Brazilian Stocks Carousel */}
      <Card className="shadow-lg bg-white border-none">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl text-trade-blue">7 mais - BRA</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <StockCardCarousel stocks={getBrazilianStocks()} title="" isLoading={isLoading} />
        </CardContent>
      </Card>

      <StockSelector stocks={stocks} userStocks={userStocks} selectedStock={selectedStock} onSelectStock={setSelectedStock} onAddStock={addStock} />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Lista de Ativos */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg bg-white border-none">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl text-[#0066FF] flex items-center">Índices e Ativos</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded"></div>)}
                </div> : <StockList stocks={userStocks} onRemoveStock={removeStock} isLoading={isLoading} />}
            </CardContent>
          </Card>
        </div>

        {/* Market Snapshot */}
        <div>
          {snapshotStock && <Card className="shadow-lg bg-white border-none mb-6">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xl text-[#0066FF] flex items-center">{snapshotStock.ticker} Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <MarketSnapshot title="" value={snapshotStock.lastPrice.toFixed(2)} prevClose={snapshotStock.prevCloseD1} open={snapshotStock.openPrice} dayLow={snapshotStock.min10Days} dayHigh={snapshotStock.max10Days} weekLow={snapshotStock.min10Days * 0.9} weekHigh={snapshotStock.max10Days * 1.1} time={snapshotStock.updateTime} date={getCurrentDate()} />
              </CardContent>
            </Card>}

          {/* Alertas */}
          <Card className="shadow-lg bg-white border-none">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl text-[#0066FF] flex items-center">Alertas de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <MarketAlerts alerts={alerts} isLoading={isLoading} onAlertClick={async alert => {
              // Find and set the stock for this alert as the snapshot stock
              const stock = stocks.find(s => s.ticker === alert.ticker);
              if (stock) {
                setSnapshotStock(stock);
              }
            }} onDismissAlert={async alert => {
              if (userId) {
                const [ticker, alertType] = alert.id.split('-');
                await markAlertAsSeen(userId, alert.id, ticker, alertType, alert.message);
                setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id));
                toast({
                  title: "Alerta marcado como visto",
                  description: "Este alerta não será exibido novamente",
                  variant: "default"
                });
              }
            }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
