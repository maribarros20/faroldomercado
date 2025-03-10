
import React, { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight, Info, Clock, Droplet } from "lucide-react";
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
    <div className="space-y-6 pb-6 bg-[#f4f4f4] rounded-lg p-6">
      <div className="flex justify-between items-center bg-[#323232] p-4 rounded-lg text-white">
        <div>
          <h2 className="text-2xl font-bold">Bem Vindo Faroleiro e Faroleira!</h2>
          <p>Acompanhe os melhores dados para apoio às suas operações</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {new Date().toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'})}
            {' '}
            {lastUpdate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ADRs Current Status Card */}
        <div className="bg-[#323232] rounded-lg p-4 shadow-xl">
          <div className="mb-2 flex justify-between">
            <span className="text-white text-sm">ADR'S</span>
            <span className="text-white text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(marketData.adrsCurrent.time)}
            </span>
          </div>
          <div className="text-gray-300 text-xs mb-1">Hoje e partir da abertura</div>
          <div className={`text-2xl font-bold ${marketData.adrsCurrent.isNegative ? 'text-red-500' : 'text-green-500'}`}>
            {marketData.adrsCurrent.value}
          </div>
          <div className={`text-sm font-medium mt-1 ${marketData.adrsCurrent.isNegative ? 'text-red-500' : 'text-green-500'} uppercase`}>
            {marketData.adrsCurrent.parameter}
          </div>
        </div>

        {/* ADRs Closing Status Card */}
        <div className="bg-[#323232] rounded-lg p-4 shadow-xl">
          <div className="mb-2 flex justify-between">
            <span className="text-white text-sm">ADR'S</span>
            <span className="text-white text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(marketData.adrsClosing.time)}
            </span>
          </div>
          <div className="text-gray-300 text-xs mb-1">Fechamento do dia anterior</div>
          <div className={`text-2xl font-bold ${!marketData.adrsClosing.isPositive ? 'text-red-500' : 'text-green-500'}`}>
            {marketData.adrsClosing.value}
          </div>
          <div className={`text-sm font-medium mt-1 ${!marketData.adrsClosing.isPositive ? 'text-red-500' : 'text-green-500'} uppercase`}>
            {marketData.adrsClosing.parameter}
          </div>
        </div>

        {/* ADRs After Market Status Card */}
        <div className="bg-[#323232] rounded-lg p-4 shadow-xl">
          <div className="mb-2 flex justify-between">
            <span className="text-white text-sm">ADR'S</span>
            <span className="text-white text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(marketData.adrsAfterMarket.time)}
            </span>
          </div>
          <div className="text-gray-300 text-xs mb-1">Pós Mercado do dia anterior</div>
          <div className={`text-2xl font-bold ${!marketData.adrsAfterMarket.isPositive ? 'text-red-500' : 'text-green-500'}`}>
            {marketData.adrsAfterMarket.value}
          </div>
          <div className={`text-sm font-medium mt-1 ${!marketData.adrsAfterMarket.isPositive ? 'text-red-500' : 'text-green-500'} uppercase`}>
            {marketData.adrsAfterMarket.parameter}
          </div>
        </div>

        {/* Commodities Status Card */}
        <div className="bg-[#323232] rounded-lg p-4 shadow-xl">
          <div className="mb-2 flex justify-between">
            <span className="text-white text-sm">COMMODITIES</span>
            <span className="text-white text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(marketData.commodities.time)}
            </span>
          </div>
          <div className="text-gray-300 text-xs mb-1">P. Brent & M.F. Dalian/Singapura</div>
          <div className={`text-2xl font-bold ${marketData.commodities.isNegative ? 'text-red-500' : 'text-green-500'}`}>
            {marketData.commodities.value}
          </div>
          <div className={`text-sm font-medium mt-1 ${marketData.commodities.isNegative ? 'text-red-500' : 'text-green-500'} uppercase`}>
            {marketData.commodities.parameter}
          </div>
        </div>
      </div>

      {/* VIX Panel */}
      <VixPanel vixData={marketData.vix} />

      {/* Market Alerts */}
      <MarketAlertPanel alerts={marketData.alerts} />

      {/* ADR Detail Panel */}
      <ADRPanel adrs={marketData.adrs} />

      {/* Commodities Detail Panel */}
      <CommoditiesPanel commodities={marketData.commoditiesList} />

      <div className="flex justify-end">
        <Button 
          onClick={loadData} 
          variant="outline"
          className="bg-white shadow-md"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar dados
        </Button>
      </div>
    </div>
  );
};

export default MarketOverviewTab;
