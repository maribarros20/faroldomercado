
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitySquare, Clock } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VixData {
  curr_value: string;
  curr_change: string;
  curr_time: string;
  curr_value_parameter: string;
  curr_change_parameter: string;
  closing_value: string;
  closing_change: string;
  closing_time_data: string;
  opening_value: string;
  opening_change: string;
  opening_time_data: string;
  opening_change_parameter: string;
  tendency_time_data: string;
  tendency_parameter: string;
  chart_data: string[];
}

async function fetchVixData() {
  console.log("Fetching VIX data from Supabase...");
  const { data, error } = await supabase
    .from('vix_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching VIX data:", error);
    throw error;
  }

  // Fallback to market data service if no data in database
  if (!data) {
    console.log("No data in Supabase, falling back to market data service");
    const { fetchMarketData } = await import("@/services/marketDataService");
    const marketData = await fetchMarketData();
    return {
      curr_value: marketData.vix.currentValue,
      curr_change: marketData.vix.currentChange,
      curr_time: marketData.vix.currentTime,
      curr_value_parameter: marketData.vix.currentValueParameter,
      curr_change_parameter: marketData.vix.currentChangeParameter,
      closing_value: marketData.vix.closingValue,
      closing_change: marketData.vix.closingChange,
      closing_time_data: marketData.vix.closingTime,
      opening_value: marketData.vix.openingValue,
      opening_change: marketData.vix.openingChange,
      opening_time_data: marketData.vix.openingTime,
      opening_change_parameter: marketData.vix.openingChangeParameter,
      tendency_time_data: marketData.vix.tendencyTime,
      tendency_parameter: marketData.vix.tendencyParameter,
      chart_data: marketData.vix.chartData,
    };
  }

  return data as VixData;
}

const VixPanel: React.FC = () => {
  const { data: vixData, isLoading, error } = useQuery({
    queryKey: ['vixData'],
    queryFn: fetchVixData,
    refetchInterval: 60000, // Refetch every minute
  });

  const parseChartData = (chartData: string[] | undefined) => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) return [];
    
    return chartData.map((value, index) => ({
      time: index,
      value: parseFloat(value.replace(',', '.').replace('%', '')) || 0
    }));
  };

  if (isLoading) {
    return <div className="p-4 text-center">Carregando dados do VIX...</div>;
  }

  if (error || !vixData) {
    console.error("Error loading VIX data:", error);
    return <div className="p-4 text-center text-red-500">Erro ao carregar dados do VIX</div>;
  }

  const chartData = parseChartData(vixData.chart_data);
  const isCurrentNegative = vixData.curr_change.includes('-');
  const isClosingNegative = vixData.closing_change.includes('-');
  const isOpeningNegative = vixData.opening_change.includes('-');

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <ActivitySquare className="h-6 w-6 mr-2" />
          VIX (CBOE Volatility Index)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column: VIX Stats */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current VIX */}
              <Card className={`border-l-4 ${isCurrentNegative ? 'border-l-[#22c55e]' : vixData.curr_change === '0%' ? 'border-l-[#0066FF]' : 'border-l-[#ef4444]'} shadow-sm`}>
                <CardHeader className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">VIX Atual</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {vixData.curr_time || "Sem horário"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold">
                      {vixData.curr_value}
                    </div>
                    <div className={`text-xl font-medium ${isCurrentNegative ? 'text-[#22c55e]' : vixData.curr_change === '0%' ? 'text-black' : 'text-[#ef4444]'}`}>
                      {vixData.curr_change}
                    </div>
                  </div>
                  <div className={`text-sm mt-2 w-full ${vixData.curr_value_parameter.includes('NEGATIV') ? 'text-[#ef4444]' : vixData.curr_value_parameter.includes('POSITIV') ? 'text-[#22c55e]' : 'text-gray-600'}`}>
                    {vixData.curr_value_parameter}
                  </div>
                  <div className={`text-sm mt-1 w-full ${vixData.curr_change_parameter.includes('NEGATIV') ? 'text-[#ef4444]' : vixData.curr_change_parameter.includes('POSITIV') ? 'text-[#22c55e]' : 'text-gray-600'}`}>
                    {vixData.curr_change_parameter}
                  </div>
                </CardContent>
              </Card>
              
              {/* Closing VIX */}
              <Card className={`border-l-4 ${isClosingNegative ? 'border-l-[#22c55e]' : vixData.closing_change === '0%' ? 'border-l-[#0066FF]' : 'border-l-[#ef4444]'} shadow-sm`}>
                <CardHeader className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">VIX Fechamento</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {vixData.closing_time_data || "Sem data"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold">{vixData.closing_value}</div>
                    <div className={`text-xl font-medium ${isClosingNegative ? 'text-[#22c55e]' : vixData.closing_change === '0%' ? 'text-black' : 'text-[#ef4444]'}`}>
                      {vixData.closing_change}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Opening VIX */}
              <Card className={`border-l-4 ${isOpeningNegative ? 'border-l-[#22c55e]' : vixData.opening_change === '0%' ? 'border-l-[#0066FF]' : 'border-l-[#ef4444]'} shadow-sm`}>
                <CardHeader className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">VIX Abertura</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {vixData.opening_time_data || "Sem data"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold">{vixData.opening_value}</div>
                    <div className={`text-xl font-medium ${isOpeningNegative ? 'text-[#22c55e]' : vixData.opening_change === '0%' ? 'text-black' : 'text-[#ef4444]'}`}>
                      {vixData.opening_change}
                    </div>
                  </div>
                  <div className={`text-sm mt-2 w-full ${vixData.opening_change_parameter.includes('NEGATIV') ? 'text-[#ef4444]' : vixData.opening_change_parameter.includes('POSITIV') ? 'text-[#22c55e]' : 'text-gray-600'}`}>
                    {vixData.opening_change_parameter}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* VIX Trend Information */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Tendência</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {vixData.tendency_time_data || "Sem horário"}
                </span>
              </div>
              <div className={`text-sm bg-gray-50 p-2 rounded ${vixData.tendency_parameter.includes('NEGATIV') ? 'text-[#ef4444]' : vixData.tendency_parameter.includes('POSITIV') ? 'text-[#22c55e]' : 'text-gray-700'}`}>
                {vixData.tendency_parameter}
              </div>
            </div>
          </div>
          
          {/* Right Column: Chart */}
          <div className="md:col-span-5 h-40 md:h-auto">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0066FF" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }} 
                  formatter={(value) => [`${value}`, 'VIX']}
                  labelFormatter={() => ''}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VixPanel;
