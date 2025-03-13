
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Line, LineChart } from "recharts";

interface MarketIndex {
  name: string;
  time: string;
  value: string;
  change: string;
  parameter?: string;
  chart?: string[];
}

interface BrazilianIndicesCardsProps {
  marketIndices: {
    [key: string]: MarketIndex;
  };
}

const BrazilianIndicesCards: React.FC<BrazilianIndicesCardsProps> = ({ marketIndices }) => {
  const indexKeys = ['IBOV', 'VALE3', 'PETR4', 'EWZ', 'BIT_FUT'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {indexKeys.map(key => marketIndices[key] && (
        <Card key={key} className={`shadow-md ${
          marketIndices[key].change.includes('-')
            ? 'border-l-4 border-l-[#ef4444]' 
            : marketIndices[key].change === '0%'
              ? 'border-l-4 border-l-[#0066FF]' 
              : 'border-l-4 border-l-[#22c55e]'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{key}</span>
              <span className="text-xs font-normal">{marketIndices[key].time}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">{marketIndices[key].value}</div>
              <div className={`text-xl font-bold ${
                marketIndices[key].change.includes('-')
                  ? 'text-[#ef4444]' 
                  : marketIndices[key].change === '0%'
                    ? 'text-black' 
                    : 'text-[#22c55e]'
              }`}>
                {marketIndices[key].change}
              </div>
            </div>
            {marketIndices[key].chart && (
              <div className="h-16 mt-2 bg-gray-50 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketIndices[key].chart?.map((value, index) => ({
                    time: index,
                    value: parseFloat(value.replace(',', '.')) || 0
                  }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0066FF"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BrazilianIndicesCards;
