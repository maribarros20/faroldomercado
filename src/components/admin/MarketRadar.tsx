
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SHEET_ID = "183-0fe8XPxEaWZ6j7mPc8aoNCknempGt66VBa0CVK-s"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 
const RANGE = "Validação!A6:Q50"; 

interface StockData {
  ticker: string;
  name: string;
  lastPrice: number;
  changePercent: number;
  volume: number;
  updateTime: string;
}

interface AlertData {
  id: string;
  type: "warning" | "danger";
  message: string;
  time: string;
}

async function fetchStockData(): Promise<StockData[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Dados recebidos do Google Sheets:", data);

    if (!data.values || data.values.length < 2) {
      console.error("Nenhum dado encontrado ou formato inesperado.");
      return getMockData(); // Use mock data when real data fails
    }

    // Mapeamos os dados corretamente
    return data.values.slice(1).map((row: any[]) => ({
      ticker: row[0] || "N/A", 
      name: row[2] || "Sem nome", 
      lastPrice: parseFloat(row[4]?.replace(',', '.')) || 0,
      changePercent: parseFloat(row[11]?.replace("%", "")?.replace(',', '.')) || 0,
      volume: parseInt(row[16]?.replace(/\./g, '')) || 0, 
      updateTime: row[13] || "Sem horário"
    }));
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    return getMockData(); // Fallback para dados de exemplo
  }
}

// Dados de exemplo para quando a API falhar
function getMockData(): StockData[] {
  return [
    { ticker: "PETR4", name: "Petrobras PN", lastPrice: 38.42, changePercent: 2.15, volume: 54000000, updateTime: "16:30" },
    { ticker: "VALE3", name: "Vale ON", lastPrice: 63.18, changePercent: -1.32, volume: 48000000, updateTime: "16:30" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", lastPrice: 32.56, changePercent: 0.75, volume: 32000000, updateTime: "16:30" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", lastPrice: 52.94, changePercent: -5.31, volume: 22000000, updateTime: "16:30" },
    { ticker: "WEGE3", name: "WEG ON", lastPrice: 36.45, changePercent: 6.27, volume: 15000000, updateTime: "16:30" },
  ];
}

export default function MarketRadar() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStockData();
      setStocks(data);
      setAlerts(generateAlerts(data));
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const generateAlerts = (stocks: StockData[]): AlertData[] => {
    return stocks.map(stock => {
      if (stock.changePercent > 5) {
        return { 
          id: `${stock.ticker}-high`,
          type: "warning", 
          message: `${stock.name} (${stock.ticker}) subiu ${stock.changePercent.toFixed(2)}%`, 
          time: stock.updateTime 
        };
      }
      if (stock.changePercent < -5) {
        return { 
          id: `${stock.ticker}-low`,
          type: "danger", 
          message: `${stock.name} (${stock.ticker}) caiu ${Math.abs(stock.changePercent).toFixed(2)}%`, 
          time: stock.updateTime 
        };
      }
      return null;
    }).filter((alert): alert is AlertData => alert !== null);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value);
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Último Preço</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead className="hidden md:table-cell">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock.ticker}>
                      <TableCell>
                        <div className="font-medium">{stock.ticker}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(stock.lastPrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
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
                      <TableCell className="hidden md:table-cell">{formatNumber(stock.volume)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Última atualização: {stocks[0]?.updateTime || "Indisponível"}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Alertas de Mercado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p>Nenhum alerta de variação significativa no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 border rounded-md flex gap-3 ${
                      alert.type === "danger" 
                        ? "bg-red-50 border-red-100" 
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >
                    <div className="mt-1">
                      {alert.type === "danger" ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {alert.type === "danger" ? "Queda Acentuada" : "Alta Volatilidade"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
