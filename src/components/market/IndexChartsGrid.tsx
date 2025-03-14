
import React from "react";
import IndexChartCard from "./IndexChartCard";
import { MarketIndex } from "@/hooks/useMarketIndices";

interface IndexChartsGridProps {
  indices: MarketIndex[];
}

const IndexChartsGrid: React.FC<IndexChartsGridProps> = ({ indices }) => {
  // Parse chart data
  const parseChartData = (chartData: string[] | undefined) => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) return [];
    
    return chartData.map((value, index) => ({
      time: index,
      value: parseFloat(value.replace(',', '.')) || 0
    }));
  };

  // Filter indices for chart display (IBOV, VALE3, PETR4, EWZ, BIT_FUT)
  const chartIndices = indices
    .filter(index => ['IBOV', 'VALE3', 'PETR4', 'EWZ', 'BIT_FUT'].includes(index.key))
    .map(index => ({
      ...index,
      chartData: parseChartData(index.chart)
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chartIndices.map((index, idx) => (
        <IndexChartCard
          key={idx}
          name={index.name}
          time={index.time_data}
          value={index.value}
          change={index.change_value}
          chartData={index.chartData}
        />
      ))}
    </div>
  );
};

export default IndexChartsGrid;
