
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

export default function MarketRadar() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [userStocks, setUserStocks] = useState<StockData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [snapshotStock, setSnapshotStock] = useState<StockData | null>(null);
  const { toast } = useToast();
  const { userId } = useUserProfile();

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
    loadUserFavorites();
  }, [userId]);

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

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStockData();
      setStocks(data);
      
      // If we don't have user stocks already (from Supabase), 
      // initialize with the first few stocks
      if (userStocks.length === 0) {
        setUserStocks(data.slice(0, Math.min(5, data.length)));
      }
      
      // Generate alerts based on all stocks
      const allAlerts = generateAlerts(data);
      
      // Filter out alerts the user has already seen
      if (userId) {
        const { data: seenAlerts, error } = await supabase
          .from('users_alerts_seen')
          .select('ticker, alert_type')
          .eq('user_id', userId);
          
        if (!error && seenAlerts) {
          const filteredAlerts = allAlerts.filter(alert => {
            const [ticker, alertType] = alert.id.split('-');
            return !seenAlerts.some(
              seen => seen.ticker === ticker && seen.alert_type === alertType
            );
          });
          setAlerts(filteredAlerts);
        } else {
          setAlerts(allAlerts);
        }
      } else {
        setAlerts(allAlerts);
      }
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUserFavorites() {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('users_favorites')
        .select('ticker, name, exchange')
        .eq('user_id', userId);
        
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Acompanhamento da Carteira</h2>
          <p className="text-muted-foreground">Acompanhe suas ações e principais índices de mercado</p>
        </div>
        <Button 
          onClick={loadData} 
          variant="outline"
          className="bg-white"
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
          {snapshotStock && (
            <MarketSnapshot 
              title={`${snapshotStock.ticker} Snapshot`}
              value={snapshotStock.lastPrice.toFixed(2)}
              prevClose={snapshotStock.prevCloseD1}
              open={snapshotStock.openPrice}
              dayLow={snapshotStock.min10Days}
              dayHigh={snapshotStock.max10Days}
              weekLow={snapshotStock.min10Days * 0.9} 
              weekHigh={snapshotStock.max10Days * 1.1}
              time={snapshotStock.updateTime}
              date={getCurrentDate()}
            />
          )}

          {/* Alertas */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Alertas de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketAlerts 
                alerts={alerts} 
                isLoading={isLoading} 
                onAlertClick={async (alert) => {
                  if (userId) {
                    const [ticker, alertType] = alert.id.split('-');
                    await markAlertAsSeen(userId, alert.id, ticker, alertType, alert.message);
                    setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id));
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
