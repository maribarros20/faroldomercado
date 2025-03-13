
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MarketIndex {
  key: string;
  name: string;
  time_data: string;
  value: string;
  change_value: string;
  parameter?: string;
  chart?: string[];
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

const MarketIndicesPanel: React.FC = () => {
  const { data: indices = [], isLoading, error } = useQuery({
    queryKey: ['marketIndices'],
    queryFn: fetchMarketIndices,
    refetchInterval: 60000, // Refetch every minute
  });
  
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  // Parse chart data
  const parseChartData = (chartData: string[] | undefined) => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) return [];
    
    return chartData.map((value, index) => ({
      time: index,
      value: parseFloat(value.replace(',', '.')) || 0
    }));
  };

  // Clean display names by removing "Índices Futuros" prefix
  const getDisplayName = (name: string) => {
    return name.replace(/^Índices Futuros\s+/i, '');
  };

  // Filter indices for display - only US, European and international futures
  const displayIndices = indices
    .filter(index => ['SP500', 'DOW', 'NASDAQ', 'EURO_STOXX', 'FTSE100', 'CHINA_A50'].includes(index.key))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Create array of charts to show: IBOV, VALE3, PETR4, EWZ, BIT_FUT
  const chartIndices = indices
    .filter(index => ['IBOV', 'VALE3', 'PETR4', 'EWZ', 'BIT_FUT'].includes(index.key))
    .map(index => ({
      ...index,
      chartData: parseChartData(index.chart)
    }));

  if (isLoading) {
    return <div className="p-4 text-center">Carregando dados do mercado...</div>;
  }

  if (error) {
    console.error("Error loading market indices:", error);
    return <div className="p-4 text-center text-red-500">Erro ao carregar dados do mercado</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-white">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl text-[#0066FF] flex items-center">
            <BarChart4 className="h-6 w-6 mr-2" />
            Índices Futuros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Nome do ativo</TableHead>
                <TableHead className="text-right font-semibold">Horário</TableHead>
                <TableHead className="text-right font-semibold">Valor</TableHead>
                <TableHead className="text-right font-semibold">Variação</TableHead>
                <TableHead className="text-right font-semibold">Parâmetro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayIndices.length > 0 ? (
                displayIndices.map((index, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{getDisplayName(index.name)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-gray-500 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(index.time_data)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{index.value}</TableCell>
                    <TableCell 
                      className={`text-right font-medium ${
                        isNegative(index.change_value) 
                          ? 'text-[#ef4444]' 
                          : index.change_value === '0%' || index.change_value === '0.00%' 
                            ? 'text-black' 
                            : 'text-[#22c55e]'
                      }`}
                    >
                      {index.change_value}
                    </TableCell>
                    <TableCell 
                      className={`text-right text-sm ${
                        index.parameter?.includes('NEGATIV') 
                          ? 'text-[#ef4444]' 
                          : index.parameter?.includes('POSITIV') 
                            ? 'text-[#22c55e]' 
                            : 'text-gray-600'
                      }`}
                    >
                      {index.parameter || ""}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* VIX panel should be here, but it's already created separately */}

      {/* Charts for IBOV, VALE3, PETR4, EWZ, BIT_FUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartIndices.map((index, idx) => (
          <Card 
            key={idx} 
            className={`shadow-sm border-l-4 ${
              isNegative(index.change_value) 
                ? 'border-l-[#ef4444]' 
                : index.change_value === '0%' || index.change_value === '0.00%' 
                  ? 'border-l-[#0066FF]' 
                  : 'border-l-[#22c55e]'
            }`}
          >
            <CardHeader className="py-2 px-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">{getDisplayName(index.name)}</CardTitle>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(index.time_data)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">{index.value}</span>
                <span className={`text-xl font-medium ${
                  isNegative(index.change_value) 
                    ? 'text-[#ef4444]' 
                    : index.change_value === '0%' || index.change_value === '0.00%' 
                      ? 'text-black' 
                      : 'text-[#22c55e]'
                }`}>
                  {isNegative(index.change_value) ? (
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                  )}
                  {index.change_value}
                </span>
              </div>
              
              <div className="h-36">
                {index.chartData && index.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={index.chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0066FF"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                        formatter={(value) => [`${value}`, index.name]}
                        labelFormatter={() => ''}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Sem dados do gráfico
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketIndicesPanel;
