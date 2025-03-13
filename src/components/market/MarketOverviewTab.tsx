import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  BarChart4, 
  LineChart as LineChartIcon, 
  DollarSign, 
  Activity, 
  Landmark,
  GlobeLock,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMarketData, MarketDataResponse } from "@/services/marketDataService";
import VixPanel from "@/components/market/VixPanel";
import MarketAlertPanel from "@/components/market/MarketAlertPanel";
import ADRPanel from "@/components/market/ADRPanel";
import CommoditiesPanel from "@/components/market/CommoditiesPanel";
import MarketIndicesPanel from "@/components/market/MarketIndicesPanel";
import SafetyAssetsPanel from "@/components/market/SafetyAssetsPanel";
import EconomicDataPanel from "@/components/market/EconomicDataPanel";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, Line, LineChart, XAxis, YAxis } from "recharts";

const MarketOverviewTab: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMarketData();
      setMarketData(data);
      setLastUpdate(new Date().toLocaleTimeString());
      
      toast({
        title: "Dados atualizados",
        description: "Informações de mercado foram atualizadas com sucesso.",
        variant: "default"
      });
    } catch (err) {
      console.error("Error loading market data:", err);
      setError("Falha ao carregar os dados. Tente novamente mais tarde.");
      
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up refresh interval (5 minutes)
    const intervalId = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  if (isLoading && !marketData) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-16 bg-gray-100 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-gray-100 rounded-md"></div>
          <div className="h-32 bg-gray-100 rounded-md"></div>
          <div className="h-32 bg-gray-100 rounded-md"></div>
          <div className="h-32 bg-gray-100 rounded-md"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded-md"></div>
        <div className="h-32 bg-gray-100 rounded-md"></div>
        <div className="h-96 bg-gray-100 rounded-md"></div>
        <div className="h-96 bg-gray-100 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-600">Erro</h3>
            <div className="text-sm text-red-500">{error}</div>
            <Button 
              onClick={loadData} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return null;
  }

  return (
    <div className="space-y-6 pb-6 bg-gray-100 rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0066FF]">Panorama do Mercado</h2>
          <p className="text-gray-600">Visão consolidada de ADRs, Commodities e Indicadores de Volatilidade</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Última atualização: {lastUpdate}
          </span>
          <Button 
            onClick={loadData} 
            variant="outline"
            className="bg-white shadow-md hover:bg-blue-50"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* ADRs and Commodities Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ADRs Current Status Card */}
        <Card className={`border-l-4 shadow-lg ${marketData.adrsCurrent.isNegative ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-[#0066FF]" />
                ADRs Atual
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.adrsCurrent.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {marketData.adrsCurrent.value}
              </div>
              <div className={`text-2xl font-bold ${marketData.adrsCurrent.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {marketData.adrsCurrent.parameter}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ADRs Closing Status Card */}
        <Card className={`border-l-4 shadow-lg ${!marketData.adrsClosing.isPositive ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-[#0066FF]" />
                ADRs Fechamento
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.adrsClosing.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {marketData.adrsClosing.value}
              </div>
              <div className={`text-2xl font-bold ${!marketData.adrsClosing.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                {marketData.adrsClosing.parameter}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ADRs After Market Status Card */}
        <Card className={`border-l-4 shadow-lg ${!marketData.adrsAfterMarket.isPositive ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-[#0066FF]" />
                ADRs After Market
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.adrsAfterMarket.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {marketData.adrsAfterMarket.value}
              </div>
              <div className={`text-2xl font-bold ${!marketData.adrsAfterMarket.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                {marketData.adrsAfterMarket.parameter}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commodities Status Card */}
        <Card className={`border-l-4 shadow-lg ${marketData.commodities.isNegative ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-[#0066FF]" />
                Commodities
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.commodities.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {marketData.commodities.value}
              </div>
              <div className={`text-2xl font-bold ${marketData.commodities.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {marketData.commodities.parameter}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIX Panel */}
      <VixPanel />

      {/* Brazilian Market Indices - Row of Cards - Moved below VIX */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {marketData.marketIndices && marketData.marketIndices.IBOV && (
          <Card className={`shadow-md ${marketData.marketIndices.IBOV.change.includes('-') ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>IBOV</span>
                <span className="text-xs font-normal">{marketData.marketIndices.IBOV.time}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">{marketData.marketIndices.IBOV.value}</div>
                <div className={`text-xl font-bold ${marketData.marketIndices.IBOV.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.marketIndices.IBOV.change}
                </div>
              </div>
              {marketData.marketIndices.IBOV.chart && (
                <div className="h-16 mt-2 bg-gray-50 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData.marketIndices.IBOV.chart?.map((value, index) => ({
                      time: index,
                      value: parseFloat(value.replace(',', '.')) || 0
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={marketData.marketIndices.IBOV.change.includes('-') ? '#ef4444' : '#22c55e'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['auto', 'auto']} hide={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {marketData.marketIndices && marketData.marketIndices.VALE3 && (
          <Card className={`shadow-md ${marketData.marketIndices.VALE3.change.includes('-') ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>VALE3</span>
                <span className="text-xs font-normal">{marketData.marketIndices.VALE3.time}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">{marketData.marketIndices.VALE3.value}</div>
                <div className={`text-xl font-bold ${marketData.marketIndices.VALE3.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.marketIndices.VALE3.change}
                </div>
              </div>
              {marketData.marketIndices.VALE3.chart && (
                <div className="h-16 mt-2 bg-gray-50 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData.marketIndices.VALE3.chart?.map((value, index) => ({
                      time: index,
                      value: parseFloat(value.replace(',', '.')) || 0
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={marketData.marketIndices.VALE3.change.includes('-') ? '#ef4444' : '#22c55e'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['auto', 'auto']} hide={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {marketData.marketIndices && marketData.marketIndices.PETR4 && (
          <Card className={`shadow-md ${marketData.marketIndices.PETR4.change.includes('-') ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>PETR4</span>
                <span className="text-xs font-normal">{marketData.marketIndices.PETR4.time}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">{marketData.marketIndices.PETR4.value}</div>
                <div className={`text-xl font-bold ${marketData.marketIndices.PETR4.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.marketIndices.PETR4.change}
                </div>
              </div>
              {marketData.marketIndices.PETR4.chart && (
                <div className="h-16 mt-2 bg-gray-50 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData.marketIndices.PETR4.chart?.map((value, index) => ({
                      time: index,
                      value: parseFloat(value.replace(',', '.')) || 0
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={marketData.marketIndices.PETR4.change.includes('-') ? '#ef4444' : '#22c55e'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['auto', 'auto']} hide={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {marketData.marketIndices && marketData.marketIndices.EWZ && (
          <Card className={`shadow-md ${marketData.marketIndices.EWZ.change.includes('-') ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>EWZ</span>
                <span className="text-xs font-normal">{marketData.marketIndices.EWZ.time}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">{marketData.marketIndices.EWZ.value}</div>
                <div className={`text-xl font-bold ${marketData.marketIndices.EWZ.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.marketIndices.EWZ.change}
                </div>
              </div>
              {marketData.marketIndices.EWZ.chart && (
                <div className="h-16 mt-2 bg-gray-50 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData.marketIndices.EWZ.chart?.map((value, index) => ({
                      time: index,
                      value: parseFloat(value.replace(',', '.')) || 0
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={marketData.marketIndices.EWZ.change.includes('-') ? '#ef4444' : '#22c55e'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['auto', 'auto']} hide={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {marketData.marketIndices && marketData.marketIndices.BIT_FUT && (
          <Card className={`shadow-md ${marketData.marketIndices.BIT_FUT.change.includes('-') ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>BIT FUT</span>
                <span className="text-xs font-normal">{marketData.marketIndices.BIT_FUT.time}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">{marketData.marketIndices.BIT_FUT.value}</div>
                <div className={`text-xl font-bold ${marketData.marketIndices.BIT_FUT.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.marketIndices.BIT_FUT.change}
                </div>
              </div>
              {marketData.marketIndices.BIT_FUT.chart && (
                <div className="h-16 mt-2 bg-gray-50 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData.marketIndices.BIT_FUT.chart?.map((value, index) => ({
                      time: index,
                      value: parseFloat(value.replace(',', '.')) || 0
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={marketData.marketIndices.BIT_FUT.change.includes('-') ? '#ef4444' : '#22c55e'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['auto', 'auto']} hide={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Two column layout for Market Indices and Safety Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Indices */}
        <Card className="shadow-lg bg-white">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-xl text-[#0066FF] flex items-center">
              <BarChart4 className="h-6 w-6 mr-2" />
              Índices de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Índice</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                  <TableHead className="text-right font-semibold">Variação</TableHead>
                  <TableHead className="text-right font-semibold">Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketData.marketIndices && Object.entries(marketData.marketIndices)
                  .filter(([key]) => ['SP500', 'DOW', 'NASDAQ', 'EURO_STOXX', 'FTSE100', 'CHINA_A50'].includes(key))
                  .map(([key, index]) => (
                    <TableRow key={key} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index.name}</TableCell>
                      <TableCell className="text-right">{index.value}</TableCell>
                      <TableCell 
                        className={`text-right font-medium ${index.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {index.change}
                      </TableCell>
                      <TableCell className="text-right text-gray-500 text-sm">{formatTime(index.time)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Safety Assets */}
        <Card className="shadow-lg bg-white">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-xl text-[#0066FF] flex items-center">
              <ShieldCheck className="h-6 w-6 mr-2" />
              Ativos de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Ativo</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                  <TableHead className="text-right font-semibold">Variação</TableHead>
                  <TableHead className="text-right font-semibold">Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketData.safetyAssets && Object.entries(marketData.safetyAssets).map(([key, asset]) => (
                  <TableRow key={key} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-right">{asset.value}</TableCell>
                    <TableCell 
                      className={`text-right font-medium ${asset.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {asset.change}
                    </TableCell>
                    <TableCell className="text-right text-gray-500 text-sm">{formatTime(asset.time)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Market Alerts */}
      <MarketAlertPanel alerts={marketData.alerts} />

      {/* Two column layout for ADRs and Commodities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ADR Detail Panel */}
        <ADRPanel adrs={marketData.adrs} />

        {/* Commodities Detail Panel */}
        <CommoditiesPanel commodities={marketData.commoditiesList} />
      </div>

      {/* Economic Data - Split US and BR Data */}
      <Card className="shadow-lg bg-white">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl text-[#0066FF] flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            Dados Econômicos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* US Economic Data */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Estados Unidos</h3>
              <div className="space-y-4">
                {marketData.economicDataUS && Object.entries(marketData.economicDataUS).map(([key, data]) => (
                  <div key={key} className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{data.name}</div>
                      {data.parameter && (
                        <div className="text-sm text-gray-600 mt-1">{data.parameter}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{data.value}</div>
                      <div className="text-sm text-gray-500">{formatTime(data.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Brazil Economic Data */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Brasil</h3>
              <div className="space-y-4">
                {marketData.economicDataBrazil && Object.entries(marketData.economicDataBrazil).map(([key, data]) => (
                  <div key={key} className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{data.name}</div>
                      {data.parameter && (
                        <div className="text-sm text-gray-600 mt-1">{data.parameter}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{data.value}</div>
                      <div className="text-sm text-gray-500">{formatTime(data.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverviewTab;
