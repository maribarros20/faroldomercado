
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

interface EconomicDataPanelProps {
  economicData: {
    us: {
      interestRate: {
        value: string;
        date: string;
      };
      inflation: {
        value: string;
        date: string;
        comment: string;
      };
    };
    brazil: {
      interestRate: {
        value: string;
        date: string;
      };
      inflation: {
        value: string;
        date: string;
        comment: string;
      };
    };
  };
}

const EconomicDataPanel: React.FC<EconomicDataPanelProps> = ({ economicData }) => {
  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-[#0066FF]">Dados Econômicos</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* US Economic Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-800 p-1 rounded mr-2">
                <DollarSign className="h-5 w-5" />
              </span>
              Dados Econômicos Estados Unidos
            </h3>
            
            {/* Interest Rate */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Taxa de Juros (SELIC)</span>
                <span className="text-sm flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {economicData.us.interestRate.date}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">{economicData.us.interestRate.value}</div>
            </div>
            
            {/* Inflation */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Inflação (CPI)</span>
                <span className="text-sm flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {economicData.us.inflation.date}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">{economicData.us.inflation.value}</div>
              {economicData.us.inflation.comment && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {economicData.us.inflation.comment}
                </div>
              )}
            </div>
          </div>
          
          {/* Brazil Economic Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <span className="bg-green-100 text-green-800 p-1 rounded mr-2">
                <TrendingUp className="h-5 w-5" />
              </span>
              Dados Econômicos Brasil
            </h3>
            
            {/* Interest Rate */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Taxa de Juros (SELIC)</span>
                <span className="text-sm flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {economicData.brazil.interestRate.date}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">{economicData.brazil.interestRate.value}</div>
            </div>
            
            {/* Inflation */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Inflação (IPCA)</span>
                <span className="text-sm flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {economicData.brazil.inflation.date}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">{economicData.brazil.inflation.value}</div>
              {economicData.brazil.inflation.comment && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {economicData.brazil.inflation.comment}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataPanel;
