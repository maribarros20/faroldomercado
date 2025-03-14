
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";
import IndicesTable from "./IndicesTable";
import IndexChartsGrid from "./IndexChartsGrid";
import { useMarketIndices } from "@/hooks/useMarketIndices";

const MarketIndicesPanel: React.FC = () => {
  const { data: indices = [], isLoading, error } = useMarketIndices();
  
  // Filter indices for display - only US, European and international futures
  const displayIndices = indices
    .filter(index => ['SP500', 'DOW', 'NASDAQ', 'EURO_STOXX', 'FTSE100', 'CHINA_A50'].includes(index.key))
    .sort((a, b) => a.name.localeCompare(b.name));

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
          <CardTitle className="text-xl text-[#323232] flex items-center">
            <BarChart4 className="h-6 w-6 mr-2" />
            Índices Futuros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <IndicesTable indices={displayIndices} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Charts for IBOV, VALE3, PETR4, EWZ, BIT_FUT */}
      <IndexChartsGrid indices={indices} />
    </div>
  );
};

export default MarketIndicesPanel;
