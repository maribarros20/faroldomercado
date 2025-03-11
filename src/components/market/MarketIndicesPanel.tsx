
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface MarketIndicesPanelProps {
  indices: {
    ibov: {
      time: string;
      value: string;
      change: string;
      chart?: string[];
    };
    vale3: {
      time: string;
      value: string;
      change: string;
      chart?: string[];
    };
    petr4: {
      time: string;
      value: string;
      change: string;
      chart?: string[];
    };
    bitfut: {
      time: string;
      value: string;
      change: string;
    };
    ewz: {
      time: string;
      value: string;
      change: string;
    };
  };
}

const MarketIndicesPanel: React.FC<MarketIndicesPanelProps> = ({ indices }) => {
  const indexNames: { [key: string]: string } = {
    ibov: "IBOV",
    vale3: "VALE - VALE3",
    petr4: "PETROBRAS - PETR4",
    bitfut: "BIT FUT",
    ewz: "EWZ"
  };

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-[#0066FF]">Principais Índices e Ações</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(indices).map(([key, index]) => (
            <div 
              key={key} 
              className="border rounded-md p-3 transition-all hover:shadow-md"
            >
              <div>
                <h3 className="font-medium">{indexNames[key] || key}</h3>
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{index.time || "Sem horário"}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{index.value}</div>
                <div className={`flex items-center ${
                  index.change.startsWith('+') || parseFloat(index.change.replace('%', '')) > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {index.change.startsWith('+') || parseFloat(index.change.replace('%', '')) > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{index.change}</span>
                </div>
              </div>
              
              {/* Simple line representation for chart data - only display if chart exists */}
              {('chart' in index) && index.chart && Array.isArray(index.chart) && index.chart.length > 0 && (
                <div className="mt-3 h-8 w-full flex items-end">
                  {index.chart.map((value, i) => (
                    <div 
                      key={i}
                      className={`h-${Math.min(Math.ceil(parseFloat(value) / 10), 8)} w-1 mx-px ${
                        index.change.startsWith('+') || parseFloat(index.change.replace('%', '')) > 0 
                          ? 'bg-green-400' 
                          : 'bg-red-400'
                      }`}
                      style={{ 
                        height: `${Math.min(Math.max(parseFloat(value) / 300 * 100, 10), 100)}%`,
                        backgroundColor: index.change.startsWith('+') || parseFloat(index.change.replace('%', '')) > 0 
                          ? '#4ade80' 
                          : '#f87171'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketIndicesPanel;
