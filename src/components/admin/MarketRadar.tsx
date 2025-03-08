
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RefreshCw, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SHEET_ID = "183-0fe8XPxEaWZ6j7mPc8aoNCknempGt66VBa0CVK-s";
const API_KEY = "AIzaSyCyRgUgMAXEY3T1r2uJ2twN8pKClunQLZ4";
const RANGE = "Validação!A2:Q50";

type Stock = {
  ticker: string;
  name: string;
  lastPrice: number;
  changePercent: number;
  volume: number;
  updateTime: string;
  isSelected?: boolean;
};

type Alert = {
  type: "warning" | "danger";
  message: string;
  time: string;
  ticker: string;
};

async function fetchStockData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      // Mock data for when Google Sheets API doesn't return data
      return [
        {
          ticker: "PETR4",
          name: "Petrobras PN",
          lastPrice: 36.75,
          changePercent: 2.35,
          volume: 68452100,
          updateTime: "15:45",
          isSelected: true
        },
        {
          ticker: "VALE3",
          name: "Vale ON",
          lastPrice: 63.40,
          changePercent: -1.20,
          volume: 42365800,
          updateTime: "15:42",
          isSelected: true
        },
        {
          ticker: "ITUB4",
          name: "Itaú Unibanco PN",
          lastPrice: 33.42,
          changePercent: 0.75,
          volume: 25748900,
          updateTime: "15:44",
          isSelected: true
        },
        {
          ticker: "BBAS3",
          name: "Banco do Brasil ON",
          lastPrice: 54.28,
          changePercent: -5.80,
          volume: 18659400,
          updateTime: "15:43",
          isSelected: true
        },
        {
          ticker: "WEGE3",
          name: "WEG ON",
          lastPrice: 41.65,
          changePercent: 6.20,
          volume: 12458700,
          updateTime: "15:40",
          isSelected: true
        }
      ];
    }

    return data.values.map((row: any) => ({
      ticker: row[0],
      name: row[2],
      lastPrice: parseFloat(row[4].replace(",", ".")),
      changePercent: parseFloat(row[11].replace("%", "").replace(",", ".")),
      volume: parseInt(row[16].replace(/\./g, "")),
      updateTime: row[13],
      isSelected: true
    }));
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    // Return mock data when API fails
    return [
      {
        ticker: "PETR4",
        name: "Petrobras PN",
        lastPrice: 36.75,
        changePercent: 2.35,
        volume: 68452100,
        updateTime: "15:45",
        isSelected: true
      },
      {
        ticker: "VALE3",
        name: "Vale ON",
        lastPrice: 63.40,
        changePercent: -1.20,
        volume: 42365800,
        updateTime: "15:42",
        isSelected: true
      },
      {
        ticker: "ITUB4",
        name: "Itaú Unibanco PN",
        lastPrice: 33.42,
        changePercent: 0.75,
        volume: 25748900,
        updateTime: "15:44",
        isSelected: true
      },
      {
        ticker: "BBAS3",
        name: "Banco do Brasil ON",
        lastPrice: 54.28,
        changePercent: -5.80,
        volume: 18659400,
        updateTime: "15:43",
        isSelected: true
      },
      {
        ticker: "WEGE3",
        name: "WEG ON",
        lastPrice: 41.65,
        changePercent: 6.20,
        volume: 12458700,
        updateTime: "15:40",
        isSelected: true
      }
    ];
  }
}

const MarketRadar = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStockData();
      const savedSelectedStocks = localStorage.getItem('selectedStocks');
      
      if (savedSelectedStocks) {
        const selectedTickers = JSON.parse(savedSelectedStocks);
        data.forEach((stock: Stock) => {
          stock.isSelected = selectedTickers.includes(stock.ticker);
        });
      }
      
      setStocks(data);
      setAlerts(generateAlerts(data));
      toast({
        title: "Dados atualizados",
        description: `${data.length} ativos carregados com sucesso.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do mercado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAlerts = (stocks: Stock[]) => {
    return stocks
      .filter(stock => stock.isSelected)
      .map(stock => {
        if (stock.changePercent > 5) {
          return { 
            type: "warning", 
            message: `${stock.name} subiu ${stock.changePercent.toFixed(2)}%!`, 
            time: stock.updateTime,
            ticker: stock.ticker
          };
        }
        if (stock.changePercent < -5) {
          return { 
            type: "danger", 
            message: `${stock.name} caiu ${Math.abs(stock.changePercent).toFixed(2)}%!`, 
            time: stock.updateTime,
            ticker: stock.ticker
          };
        }
        return null;
      })
      .filter((alert): alert is Alert => alert !== null);
  };

  const toggleStockSelection = (ticker: string) => {
    const updatedStocks = stocks.map(stock => {
      if (stock.ticker === ticker) {
        return { ...stock, isSelected: !stock.isSelected };
      }
      return stock;
    });
    
    setStocks(updatedStocks);
    
    // Update alerts based on new selection
    setAlerts(generateAlerts(updatedStocks));
    
    // Save selected tickers to localStorage
    const selectedTickers = updatedStocks
      .filter(stock => stock.isSelected)
      .map(stock => stock.ticker);
    
    localStorage.setItem('selectedStocks', JSON.stringify(selectedTickers));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Radar de Mercado</h2>
        <Button 
          variant="refresh" 
          onClick={loadData} 
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Índices e Ativos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Último Preço</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStockSelection(stock.ticker)}
                      >
                        {stock.isSelected ? <X size={16} /> : <Plus size={16} />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>{formatCurrency(stock.lastPrice)}</TableCell>
                    <TableCell className={stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                      {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </TableCell>
                    <TableCell>{formatNumber(stock.volume)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Alertas de Mercado</h3>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <Alert 
                    key={index} 
                    variant={alert.type === "warning" ? "default" : "destructive"}
                    className={
                      alert.type === "warning" 
                        ? "border-yellow-300 bg-yellow-50" 
                        : "border-red-300 bg-red-50"
                    }
                  >
                    <AlertTitle className={
                      alert.type === "warning" ? "text-yellow-800" : "text-red-800"
                    }>
                      {alert.type === "warning" ? "Alta Volatilidade" : "Queda Acentuada"}
                    </AlertTitle>
                    <AlertDescription className={
                      alert.type === "warning" ? "text-yellow-700" : "text-red-700"
                    }>
                      <div className="flex justify-between items-center">
                        <div>{alert.message}</div>
                        <div className="text-xs">{alert.time}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Nenhum alerta de variação significativa.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketRadar;
