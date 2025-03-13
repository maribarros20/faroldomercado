
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Clock, BarChart4 } from "lucide-react";

interface MarketSummaryCardsProps {
  adrsCurrent: {
    time: string;
    value: string;
    parameter: string;
    isNegative: boolean;
  };
  adrsClosing: {
    time: string;
    value: string;
    parameter: string;
    isPositive: boolean;
  };
  adrsAfterMarket: {
    time: string;
    value: string;
    parameter: string;
    isPositive: boolean;
  };
  commodities: {
    time: string;
    value: string;
    parameter: string;
    isNegative: boolean;
  };
}

const MarketSummaryCards: React.FC<MarketSummaryCardsProps> = ({
  adrsCurrent,
  adrsClosing,
  adrsAfterMarket,
  commodities,
}) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* ADRs Current Status Card */}
      <Card className={`border-l-4 shadow-lg ${
        adrsCurrent.isNegative
          ? 'border-l-[#ef4444]' 
          : adrsCurrent.value === '0%'
            ? 'border-l-[#0066FF]' 
            : 'border-l-[#22c55e]'
      } bg-white`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <Landmark className="h-5 w-5 mr-2 text-[#0066FF]" />
              ADRs Atual
            </span>
            <span className="text-sm font-normal flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              {formatTime(adrsCurrent.time)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {adrsCurrent.value}
            </div>
            <div className={`text-2xl font-bold ${
              adrsCurrent.isNegative
                ? 'text-[#ef4444]' 
                : adrsCurrent.value === '0%'
                  ? 'text-black' 
                  : 'text-[#22c55e]'
            }`}>
              {adrsCurrent.parameter}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ADRs Closing Status Card */}
      <Card className={`border-l-4 shadow-lg ${
        !adrsClosing.isPositive
          ? 'border-l-[#ef4444]' 
          : adrsClosing.value === '0%'
            ? 'border-l-[#0066FF]' 
            : 'border-l-[#22c55e]'
      } bg-white`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <Landmark className="h-5 w-5 mr-2 text-[#0066FF]" />
              ADRs Fechamento
            </span>
            <span className="text-sm font-normal flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              {formatTime(adrsClosing.time)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {adrsClosing.value}
            </div>
            <div className={`text-2xl font-bold ${
              !adrsClosing.isPositive
                ? 'text-[#ef4444]' 
                : adrsClosing.value === '0%'
                  ? 'text-black' 
                  : 'text-[#22c55e]'
            }`}>
              {adrsClosing.parameter}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ADRs After Market Status Card */}
      <Card className={`border-l-4 shadow-lg ${
        !adrsAfterMarket.isPositive
          ? 'border-l-[#ef4444]' 
          : adrsAfterMarket.value === '0%'
            ? 'border-l-[#0066FF]' 
            : 'border-l-[#22c55e]'
      } bg-white`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <Landmark className="h-5 w-5 mr-2 text-[#0066FF]" />
              ADRs After Market
            </span>
            <span className="text-sm font-normal flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              {formatTime(adrsAfterMarket.time)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {adrsAfterMarket.value}
            </div>
            <div className={`text-2xl font-bold ${
              !adrsAfterMarket.isPositive
                ? 'text-[#ef4444]' 
                : adrsAfterMarket.value === '0%'
                  ? 'text-black' 
                  : 'text-[#22c55e]'
            }`}>
              {adrsAfterMarket.parameter}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commodities Status Card */}
      <Card className={`border-l-4 shadow-lg ${
        commodities.isNegative
          ? 'border-l-[#ef4444]' 
          : commodities.value === '0%'
            ? 'border-l-[#0066FF]' 
            : 'border-l-[#22c55e]'
      } bg-white`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <BarChart4 className="h-5 w-5 mr-2 text-[#0066FF]" />
              Commodities
            </span>
            <span className="text-sm font-normal flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              {formatTime(commodities.time)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {commodities.value}
            </div>
            <div className={`text-2xl font-bold ${
              commodities.isNegative
                ? 'text-[#ef4444]' 
                : commodities.value === '0%'
                  ? 'text-black' 
                  : 'text-[#22c55e]'
            }`}>
              {commodities.parameter}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSummaryCards;
