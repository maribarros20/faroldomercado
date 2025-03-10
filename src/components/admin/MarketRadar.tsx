
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SHEET_ID = "183-0fe8XPxEaWZ6j7mPc8aoNCknempGt66VBa0CVK-s"; 
const API_KEY = "AIzaSyDaqSSdKtpA5_xWUawCUsgwefmkUDf2y3k"; 
const RANGE = "Validação!A8:Q1500"; 

interface StockData {
  ticker: string;
  exchange: string;
  movingAvg5: number;
  movingAvg20: number;
  max10Days: number;
  min10Days: number;
  openPrice: number;
  prevClose: number;
  avgVolume10Days: number;
  lastPrice: number;
  changePrice: number;
  changePercent: number;
  volume: number;
  name: string;
  updateTime?: string;
}

interface AlertData {
  id: string;
  type: "success" | "info" | "danger";
  message: string;
}

async function fetchStockData(): Promise<StockData[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Dados brutos do Google Sheets:", data);

    if (!data.values || data.values.length < 1) {
      console.error("Nenhum dado encontrado ou formato inesperado.");
      return getMockData(); // Use mock data when real data fails
    }

    // Mapeamos os dados corretamente
    const stocks = data.values.map((row: any[]) => ({
      ticker: row[0] || "N/A", // Coluna A - Código do ativo
      exchange: row[1] || "N/A", // Coluna B - Bolsa
      movingAvg5: parseFloat(row[2]?.replace(',', '.')) || 0, // Coluna C - Média Móvel 5 Dias
      movingAvg20: parseFloat(row[3]?.replace(',', '.')) || 0, // Coluna D - Média Móvel 20 Dias
      max10Days: parseFloat(row[4]?.replace(',', '.')) || 0, // Coluna E - Máxima dos Últimos 10 Dias
      min10Days: parseFloat(row[5]?.replace(',', '.')) || 0, // Coluna F - Mínima dos Últimos 10 Dias
      openPrice: parseFloat(row[6]?.replace(',', '.')) || 0, // Coluna G - Preço de Abertura do Dia
      prevClose: parseFloat(row[7]?.replace(',', '.')) || 0, // Coluna H - Fechamento Anterior
      avgVolume10Days: parseInt(row[8]?.replace(/\./g, '')) || 0, // Coluna I - Volume Médio 10 Dias
      lastPrice: parseFloat(row[9]?.replace(',', '.')) || 0, // Coluna J - Preço Atual
      changePrice: parseFloat(row[10]?.replace(',', '.')) || 0, // Coluna K - Variação de Preço
      changePercent: parseFloat(row[11]?.replace("%", "")?.replace(',', '.')) || 0, // Coluna L - % Variação
      volume: parseInt(row[16]?.replace(/\./g, '')) || 0, // Coluna Q - Volume Negociado
      name: row[17]?.trim() || row[2]?.trim() || "Nome Indefinido", // Coluna R ou C - Nome do Ativo
      updateTime: row[13] || "Sem horário"
    }));

    console.log("Dados processados:", stocks);
    return stocks.filter(stock => stock.ticker && stock.ticker !== "N/A");
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    return getMockData(); // Fallback para dados de exemplo
  }
}

// Dados de exemplo para quando a API falhar
function getMockData(): StockData[] {
  return [
    { ticker: "PETR4", name: "Petrobras PN", exchange: "BVMF", movingAvg5: 36.5, movingAvg20: 35.8, max10Days: 38.2, min10Days: 35.1, openPrice: 37.2, prevClose: 36.9, avgVolume10Days: 45000000, lastPrice: 38.42, changePrice: 1.52, changePercent: 2.15, volume: 54000000, updateTime: "16:30" },
    { ticker: "VALE3", name: "Vale ON", exchange: "BVMF", movingAvg5: 64.2, movingAvg20: 65.5, max10Days: 66.8, min10Days: 62.3, openPrice: 62.9, prevClose: 64.1, avgVolume10Days: 42000000, lastPrice: 63.18, changePrice: -0.92, changePercent: -1.32, volume: 48000000, updateTime: "16:30" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", exchange: "BVMF", movingAvg5: 32.1, movingAvg20: 31.8, max10Days: 33.2, min10Days: 31.1, openPrice: 32.3, prevClose: 32.3, avgVolume10Days: 30000000, lastPrice: 32.56, changePrice: 0.26, changePercent: 0.75, volume: 32000000, updateTime: "16:30" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", exchange: "BVMF", movingAvg5: 55.8, movingAvg20: 54.9, max10Days: 56.2, min10Days: 53.8, openPrice: 54.9, prevClose: 55.9, avgVolume10Days: 25000000, lastPrice: 52.94, changePrice: -2.96, changePercent: -5.31, volume: 22000000, updateTime: "16:30" },
    { ticker: "WEGE3", name: "WEG ON", exchange: "BVMF", movingAvg5: 34.2, movingAvg20: 36.1, max10Days: 36.8, min10Days: 33.9, openPrice: 34.3, prevClose: 34.3, avgVolume10Days: 12000000, lastPrice: 36.45, changePrice: 2.15, changePercent: 6.27, volume: 15000000, updateTime: "16:30" },
  ];
}

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

  const generateAlerts = (stocks: StockData[]): AlertData[] => {
    return stocks.map(stock => {
      let alertMessage: string | null = null;
      let alertType: "success" | "info" | "danger" = "info";
      
      if (stock.movingAvg5 > stock.movingAvg20) {
        alertMessage = `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para cima!`;
        alertType = "success";
      } else if (stock.movingAvg5 < stock.movingAvg20) {
        alertMessage = `${stock.name} (${stock.ticker}) cruzou a Média Móvel de 20 dias para baixo!`;
        alertType = "danger";
      }
      
      if (stock.openPrice > stock.prevClose * 1.02) {
        alertMessage = `${stock.name} (${stock.ticker}) abriu com um gap de alta!`;
        alertType = "info";
      } else if (stock.openPrice < stock.prevClose * 0.98) {
        alertMessage = `${stock.name} (${stock.ticker}) abriu com um gap de baixa!`;
        alertType = "danger";
      }
      
      if (stock.changePercent > 5) {
        alertMessage = `${stock.name} (${stock.ticker}) subiu ${stock.changePercent.toFixed(2)}%`;
        alertType = "success";
      } else if (stock.changePercent < -5) {
        alertMessage = `${stock.name} (${stock.ticker}) caiu ${Math.abs(stock.changePercent).toFixed(2)}%`;
        alertType = "danger";
      }
      
      return alertMessage ? { 
        id: `${stock.ticker}-${alertType}`, 
        type: alertType, 
        message: alertMessage
      } : null;
    }).filter((alert): alert is AlertData => alert !== null);
  };

  const addStock = () => {
    const stockToAdd = stocks.find(stock => stock.ticker === selectedStock);
    if (stockToAdd && !userStocks.some(s => s.ticker === stockToAdd.ticker)) {
      setUserStocks(prevStocks => [...prevStocks, stockToAdd]);
    }
  };

  const removeStock = (ticker: string) => {
    setUserStocks(prevStocks => prevStocks.filter(stock => stock.ticker !== ticker));
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

      <div className="flex flex-wrap gap-4 items-center">
        <div className="w-full md:w-auto">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-full md:w-[250px]">
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
          onClick={addStock} 
          variant="default" 
          disabled={!selectedStock || userStocks.some(s => s.ticker === selectedStock)}
        >
          Adicionar Ativo
        </Button>
      </div>

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
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        Nenhum ativo selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    userStocks.map((stock) => (
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
                        <TableCell>
                          <Button 
                            onClick={() => removeStock(stock.ticker)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Última atualização: {userStocks[0]?.updateTime || "Indisponível"}
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
                        : alert.type === "success"
                        ? "bg-green-50 border-green-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >
                    <div className="mt-1">
                      {alert.type === "danger" ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : alert.type === "success" ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {alert.type === "danger" ? "Queda Acentuada" : 
                         alert.type === "success" ? "Alta Significativa" : "Alta Volatilidade"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
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
