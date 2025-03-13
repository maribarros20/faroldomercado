
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock } from "lucide-react";

interface EconomicData {
  name: string;
  time: string;
  value: string;
  change: string;
  parameter?: string;
}

interface EconomicDataPanelProps {
  usTreasuryRates: {
    [key: string]: EconomicData;
  };
  brDiRates: {
    [key: string]: EconomicData;
  };
}

const EconomicDataPanel: React.FC<EconomicDataPanelProps> = ({ usTreasuryRates, brDiRates }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  // Sort DI rates by term ascending
  const sortedDiRates = Object.entries(brDiRates)
    .sort(([keyA], [keyB]) => {
      const yearA = parseInt(keyA.match(/\d+/)?.[0] || "0");
      const yearB = parseInt(keyB.match(/\d+/)?.[0] || "0");
      return yearA - yearB;
    })
    .map(([_, data]) => data);

  // Sort US Treasury rates by term ascending
  const sortedUSRates = Object.entries(usTreasuryRates)
    .sort(([keyA], [keyB]) => {
      const yearA = parseInt(keyA.match(/\d+/)?.[0] || "0");
      const yearB = parseInt(keyB.match(/\d+/)?.[0] || "0");
      return yearA - yearB;
    })
    .map(([_, data]) => data);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          Taxas de Juros & DI
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* US Treasury Rates */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Estados Unidos (Treasury)</h3>
            <div className="space-y-4">
              {sortedUSRates.map((data, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{data.name}</div>
                    {data.parameter && (
                      <div className={`text-sm mt-1 ${
                        data.parameter.includes('NEGATIV') 
                          ? 'text-[#ef4444]' 
                          : data.parameter.includes('POSITIV') 
                            ? 'text-[#22c55e]' 
                            : 'text-gray-600'
                      }`}>
                        {data.parameter}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{data.value}</div>
                    <div className={`text-lg font-medium ${
                      isNegative(data.change)
                        ? 'text-[#ef4444]' 
                        : data.change === '0%' || data.change === '0.00%' 
                          ? 'text-black' 
                          : 'text-[#22c55e]'
                    }`}>
                      {data.change}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(data.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Brazil DI Rates */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Brasil (Taxas DI)</h3>
            <div className="space-y-4">
              {sortedDiRates.map((data, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{data.name}</div>
                    {data.parameter && (
                      <div className={`text-sm mt-1 ${
                        data.parameter.includes('NEGATIV') 
                          ? 'text-[#ef4444]' 
                          : data.parameter.includes('POSITIV') 
                            ? 'text-[#22c55e]' 
                            : 'text-gray-600'
                      }`}>
                        {data.parameter}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{data.value}</div>
                    <div className={`text-lg font-medium ${
                      isNegative(data.change)
                        ? 'text-[#ef4444]' 
                        : data.change === '0%' || data.change === '0.00%' 
                          ? 'text-black' 
                          : 'text-[#22c55e]'
                    }`}>
                      {data.change}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(data.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataPanel;
