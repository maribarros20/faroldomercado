
import React, { useState, useEffect } from "react";
import { fetchMarketData, MarketDataResponse } from "@/services/marketDataService";
import { useToast } from "@/hooks/use-toast";

// Import our new component parts
import MarketHeader from "./MarketHeader";
import MarketLoadingError from "./MarketLoadingError";
import MarketSummaryCards from "./MarketSummaryCards";
import FxCardsWidget from "./FxCardsWidget";
import VixPanel from "./VixPanel";
import MarketAlertWidget from "./MarketAlertWidget";
import MarketAlertPanel from "./MarketAlertPanel";
import EconomicDataWidget from "./EconomicDataWidget";
import BrazilianIndicesCards from "./BrazilianIndicesCards";
import EconomicDataPanel from "./EconomicDataPanel";
import IndicesAndAssetsSection from "./IndicesAndAssetsSection";
import ADRAndCommoditiesSection from "./ADRAndCommoditiesSection";

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

  // Render loading or error state if needed
  if (isLoading && !marketData) {
    return <MarketLoadingError isLoading={true} error={null} onRetry={loadData} />;
  }

  if (error) {
    return <MarketLoadingError isLoading={false} error={error} onRetry={loadData} />;
  }

  if (!marketData) {
    return null;
  }

  // Process market alerts
  const marketAlerts = [];
  if (marketData.economicDataBrazil && marketData.economicDataBrazil.MARKET_ALERT_1) {
    marketAlerts.push(marketData.economicDataBrazil.MARKET_ALERT_1);
  }
  if (marketData.economicDataBrazil && marketData.economicDataBrazil.MARKET_ALERT_2) {
    marketAlerts.push(marketData.economicDataBrazil.MARKET_ALERT_2);
  }

  // Extract currency pairs for FX Cards Widget
  const currencyPairs = {
    DXY: marketData.safetyAssets.DXY || {
      name: "DXY (Dollar Index)",
      time: "",
      value: "0",
      change: "0%"
    },
    USD_BRL: marketData.safetyAssets.USD_BRL || {
      name: "USD/BRL",
      time: "",
      value: "0",
      change: "0%"
    },
    EUR_USD: marketData.safetyAssets.EUR_USD || {
      name: "EUR/USD",
      time: "",
      value: "0",
      change: "0%"
    }
  };

  // Prepare data for Economic Widget
  const economicData = {
    usData: {
      interestRate: marketData.economicDataUS.US_RATE || {
        name: "Taxa de Juros EUA",
        time: "",
        value: "0%",
        change: "0%"
      },
      inflation: marketData.economicDataUS.US_CPI || {
        name: "Inflação EUA (CPI)",
        time: "",
        value: "0%",
        change: "0%",
        monthlyValue: "0%"
      }
    },
    brData: {
      interestRate: marketData.economicDataBrazil.BR_SELIC || {
        name: "Taxa Selic",
        time: "",
        value: "0%",
        change: "0%"
      },
      inflation: marketData.economicDataBrazil.BR_IPCA || {
        name: "Inflação (IPCA)",
        time: "",
        value: "0%",
        change: "0%",
        monthlyValue: "0%"
      }
    }
  };

  return (
    <div className="space-y-6 pb-6 bg-gray-100 rounded-lg p-6">
      {/* Header */}
      <MarketHeader 
        lastUpdate={lastUpdate} 
        isLoading={isLoading} 
        onRefresh={loadData} 
      />

      {/* ADRs and Commodities Summary Cards */}
      <MarketSummaryCards
        adrsCurrent={marketData.adrsCurrent}
        adrsClosing={marketData.adrsClosing}
        adrsAfterMarket={marketData.adrsAfterMarket}
        commodities={marketData.commodities}
      />

      {/* FX Currency Pairs Cards */}
      <FxCardsWidget currencyPairs={currencyPairs} />

      {/* VIX Panel */}
      <VixPanel />

      {/* Market Alert Widget - Show below VIX */}
      <MarketAlertWidget alerts={marketAlerts} />

      {/* Market Alerts */}
      <MarketAlertPanel alerts={marketData.alerts} />

      {/* Economic Data Widget */}
      <EconomicDataWidget 
        usData={economicData.usData}
        brData={economicData.brData}
      />

      {/* Brazilian Market Indices */}
      <BrazilianIndicesCards marketIndices={marketData.marketIndices} />

      {/* DI Futures Panel */}
      <EconomicDataPanel brDiRates={marketData.economicDataBrazil} />

      {/* Two column layout for Indices and Safety Assets */}
      <IndicesAndAssetsSection 
        marketIndices={marketData.marketIndices}
        safetyAssets={marketData.safetyAssets}
      />

      {/* Two column layout for ADRs and Commodities */}
      <ADRAndCommoditiesSection 
        adrs={marketData.adrs}
        commoditiesList={marketData.commoditiesList}
      />
    </div>
  );
};

export default MarketOverviewTab;
