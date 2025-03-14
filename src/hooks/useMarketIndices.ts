
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketIndex {
  key: string;
  name: string;
  time_data: string;
  value: string;
  change_value: string;
  parameter?: string;
  chart?: string[];
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ['marketIndices'],
    queryFn: fetchMarketIndices,
    refetchInterval: 60000, // Refetch every minute
  });
}

async function fetchMarketIndices() {
  console.log("Fetching market indices from Supabase...");
  const { data, error } = await supabase
    .from('market_indices')
    .select('*');
  
  if (error) {
    console.error("Error fetching market indices:", error);
    throw error;
  }

  // Fallback to market data service if no data in database
  if (!data || data.length === 0) {
    console.log("No data in Supabase, falling back to market data service");
    const { fetchMarketData } = await import("@/services/marketDataService");
    const marketData = await fetchMarketData();
    return Object.entries(marketData.marketIndices).map(([key, index]) => ({
      key,
      name: index.name,
      time_data: index.time,
      value: index.value,
      change_value: index.change,
      parameter: index.parameter,
      chart: index.chart
    }));
  }

  return data as MarketIndex[];
}
