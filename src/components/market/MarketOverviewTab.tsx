
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketData } from "@/services/marketDataService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import MarketSnapshot from "./MarketSnapshot";
import MarketIndicesPanel from "./MarketIndicesPanel";
import CommoditiesPanel from "./CommoditiesPanel";
import VixPanel from "./VixPanel";
import ADRPanel from "./ADRPanel";
import EconomicDataPanel from "./EconomicDataPanel";
import SafetyAssetsPanel from "./SafetyAssetsPanel";
import EconomicDataWidget from "./EconomicDataWidget";
import MarketAlertWidget from "./MarketAlertWidget";

const MarketOverviewTab: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["marketData"],
    queryFn: fetchMarketData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Erro ao carregar dados do mercado</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  // Get US Rate and CPI data
  const usRate = data.economicDataUS.US_RATE || {
    name: "Taxa de Juros EUA",
    time: "",
    value: "0%",
    change: "0%"
  };

  const usCpi = data.economicDataUS.US_CPI || {
    name: "Inflação EUA (CPI) - Anual",
    time: "",
    value: "0%",
    change: "0%"
  };

  const usCpiMonth = data.economicDataUS.US_CPI_MONTH || {
    name: "Inflação EUA (CPI) - Mensal",
    time: "",
    value: "0%",
    change: "0%"
  };

  // Get BR SELIC and IPCA data
  const brSelic = data.economicDataBrazil.BR_SELIC || {
    name: "Taxa Selic",
    time: "",
    value: "0%",
    change: "0%"
  };

  const brIpca = data.economicDataBrazil.BR_IPCA || {
    name: "Inflação (IPCA) - Anual",
    time: "",
    value: "0%",
    change: "0%"
  };

  const brIpcaMonth = data.economicDataBrazil.BR_IPCA_MONTH || {
    name: "Inflação (IPCA) - Mensal",
    time: "",
    value: "0%",
    change: "0%"
  };

  // Extract data for MarketSnapshot
  const snapshotData = {
    title: "Market Overview",
    value: data.marketIndices.IBOV?.value || "0",
    prevClose: parseFloat(data.marketIndices.IBOV?.prevClose || "0"),
    open: parseFloat(data.marketIndices.IBOV?.open || "0"),
    dayLow: parseFloat(data.marketIndices.IBOV?.dayLow || "0"),
    dayHigh: parseFloat(data.marketIndices.IBOV?.dayHigh || "0"),
    weekLow: parseFloat(data.marketIndices.IBOV?.weekLow || "0"),
    weekHigh: parseFloat(data.marketIndices.IBOV?.weekHigh || "0"),
    time: data.marketIndices.IBOV?.time || "",
    date: data.marketIndices.IBOV?.date || ""
  };

  return (
    <div className="space-y-6 p-4">
      <MarketSnapshot {...snapshotData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VixPanel />
        <MarketAlertWidget alerts={data.alerts} />
      </div>

      <EconomicDataWidget 
        usRate={usRate} 
        usCpi={usCpi}
        usCpiMonth={usCpiMonth}
        brSelic={brSelic} 
        brIpca={brIpca}
        brIpcaMonth={brIpcaMonth}
        brDiRates={data.economicDataBrazil}
      />

      <Tabs defaultValue="market-indices" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="market-indices">Índices Futuros</TabsTrigger>
          <TabsTrigger value="di-rates">DI Futuros</TabsTrigger>
          <TabsTrigger value="safety-assets">Ativos de Segurança</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="adrs">ADRs</TabsTrigger>
        </TabsList>

        <TabsContent value="market-indices">
          <MarketIndicesPanel />
        </TabsContent>

        <TabsContent value="di-rates">
          <EconomicDataPanel brDiRates={data.economicDataBrazil} />
        </TabsContent>

        <TabsContent value="safety-assets">
          <SafetyAssetsPanel assets={data.safetyAssets} />
        </TabsContent>

        <TabsContent value="commodities">
          <CommoditiesPanel commodities={data.commoditiesList} />
        </TabsContent>

        <TabsContent value="adrs">
          <ADRPanel adrs={data.adrs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketOverviewTab;
