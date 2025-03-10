
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock, Droplet, Mountain } from "lucide-react";

interface CommoditiesPanelProps {
  commodities: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
    };
  };
}

const CommoditiesPanel: React.FC<CommoditiesPanelProps> = ({ commodities }) => {
  const getCommodityDisplayInfo = (key: string) => {
    switch (key) {
      case "BRENT":
        return { 
          name: "Petróleo Brent", 
          icon: <Droplet className="h-4 w-4 text-blue-500" />,
          description: "Referência para mercados europeus"
        };
      case "WTI":
        return { 
          name: "Petróleo WTI", 
          icon: <Droplet className="h-4 w-4 text-blue-600" />,
          description: "Referência para mercados americanos"
        };
      case "IRON_SING":
        return { 
          name: "Minério Ferro (Singapura)", 
          icon: <Mountain className="h-4 w-4 text-orange-500" />,
          description: "Cotação em Singapura"
        };
      case "IRON_DALIAN":
        return { 
          name: "Minério Ferro (Dalian)", 
          icon: <Mountain className="h-4 w-4 text-orange-600" />,
          description: "Cotação na China"
        };
      default:
        return { name: key, icon: null, description: "" };
    }
  };

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-[#0066FF]">
          <span>Commodities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(commodities).map(([key, commodity]) => {
            const { name, icon, description } = getCommodityDisplayInfo(key);
            const isChangePositive = !commodity.change.includes("-");
            
            return (
              <Card key={key} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      {icon}
                      <span className="ml-1 font-medium">{name}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {commodity.time && (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          {commodity.time}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">{description}</div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{commodity.value}</div>
                    <div className={`flex items-center ${isChangePositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isChangePositive ? (
                        <ArrowUpRight className="h-5 w-5 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 mr-1" />
                      )}
                      <span className="font-medium">{commodity.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommoditiesPanel;
