
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface FxPair {
  name: string;
  time: string;
  value: string;
  change: string;
  parameter?: string;
}

interface FxCardsWidgetProps {
  currencyPairs: {
    [key: string]: FxPair;
  };
}

const FxCardsWidget: React.FC<FxCardsWidgetProps> = ({ currencyPairs }) => {
  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(currencyPairs).map(([key, pair]) => (
        <Card 
          key={key}
          className={`shadow-md ${
            isNegative(pair.change)
              ? 'border-l-4 border-l-[#ef4444]' 
              : pair.change === '0%'
                ? 'border-l-4 border-l-[#0066FF]' 
                : 'border-l-4 border-l-[#22c55e]'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{pair.name}</h3>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(pair.time)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{pair.value}</div>
              <div className={`flex items-center font-semibold ${
                isNegative(pair.change)
                  ? 'text-[#ef4444]' 
                  : pair.change === '0%'
                    ? 'text-black' 
                    : 'text-[#22c55e]'
              }`}>
                {isNegative(pair.change) ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-1" />
                )}
                {pair.change}
              </div>
            </div>
            
            {pair.parameter && (
              <div className={`mt-2 text-sm ${
                pair.parameter.includes('NEGATIV') 
                  ? 'text-[#ef4444]' 
                  : pair.parameter.includes('POSITIV') 
                    ? 'text-[#22c55e]' 
                    : 'text-gray-600'
              }`}>
                {pair.parameter}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FxCardsWidget;
