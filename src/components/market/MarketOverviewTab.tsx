
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMarketData, MarketDataResponse } from "@/services/marketDataService";
import VixPanel from "@/components/market/VixPanel";
import MarketAlertPanel from "@/components/market/MarketAlertPanel";
import ADRPanel from "@/components/market/ADRPanel";
import CommoditiesPanel from "@/components/market/CommoditiesPanel";
import { useToast } from "@/hooks/use-toast";

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ADRs Current Status Card */}
        <Card className={`border-l-4 shadow-lg ${marketData.adrsCurrent.isNegative ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#0066FF]" />
                ADRs Atual
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.adrsCurrent.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {marketData.adrsCurrent.isNegative ? (
                <TrendingDown className="h-10 w-10 text-red-500 mr-3" />
              ) : (
                <TrendingUp className="h-10 w-10 text-green-500 mr-3" />
              )}
              <div>
                <div className={`text-3xl font-bold ${marketData.adrsCurrent.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.adrsCurrent.value}
                </div>
                <div className="text-sm font-medium mt-1 text-[#323232]">
                  {marketData.adrsCurrent.parameter}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ADRs Closing Status Card */}
        <Card className={`border-l-4 shadow-lg ${!marketData.adrsClosing.isPositive ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#0066FF]" />
                ADRs Fechamento
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.adrsClosing.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {!marketData.adrsClosing.isPositive ? (
                <TrendingDown className="h-10 w-10 text-red-500 mr-3" />
              ) : (
                <TrendingUp className="h-10 w-10 text-green-500 mr-3" />
              )}
              <div>
                <div className={`text-3xl font-bold ${!marketData.adrsClosing.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.adrsClosing.value}
                </div>
                <div className="text-sm font-medium mt-1 text-[#323232]">
                  {marketData.adrsClosing.parameter}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ADRs After Market Status Card */}
        <Card className={`border-l-4 shadow-lg ${!marketData.adrsAfterMarket.isPositive ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#0066FF]" />
                ADRs After Market
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.adrsAfterMarket.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {!marketData.adrsAfterMarket.isPositive ? (
                <TrendingDown className="h-10 w-10 text-red-500 mr-3" />
              ) : (
                <TrendingUp className="h-10 w-10 text-green-500 mr-3" />
              )}
              <div>
                <div className={`text-3xl font-bold ${!marketData.adrsAfterMarket.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.adrsAfterMarket.value}
                </div>
                <div className="text-sm font-medium mt-1 text-[#323232]">
                  {marketData.adrsAfterMarket.parameter}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commodities Status Card */}
        <Card className={`border-l-4 shadow-lg ${marketData.commodities.isNegative ? 'border-l-red-500' : 'border-l-green-500'} bg-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#0066FF]" />
                Commodities
              </span>
              <span className="text-sm font-normal flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatTime(marketData.commodities.time)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {marketData.commodities.isNegative ? (
                <TrendingDown className="h-10 w-10 text-red-500 mr-3" />
              ) : (
                <TrendingUp className="h-10 w-10 text-green-500 mr-3" />
              )}
              <div>
                <div className={`text-3xl font-bold ${marketData.commodities.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                  {marketData.commodities.value}
                </div>
                <div className="text-sm font-medium mt-1 text-[#323232]">
                  {marketData.commodities.parameter}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIX Panel */}
      <VixPanel vixData={marketData.vix} />

      {/* Market Alerts */}
      <MarketAlertPanel alerts={marketData.alerts} />

      {/* ADR Detail Panel */}
      <ADRPanel adrs={marketData.adrs} />

      {/* Commodities Detail Panel */}
      <CommoditiesPanel commodities={marketData.commoditiesList} />
    </div>
  );
};

export default MarketOverviewTab;
