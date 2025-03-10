
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
  const getCommodityNameDisplay = (key: string) => {
    switch (key) {
      case "BRENT":
        return { name: "Petróleo Brent", icon: <Droplet className="h-4 w-4 text-blue-500" /> };
      case "WTI":
        return { name: "Petróleo WTI", icon: <Droplet className="h-4 w-4 text-blue-600" /> };
      case "IRON_SING":
        return { name: "Minério Ferro (Singapura)", icon: <Mountain className="h-4 w-4 text-orange-500" /> };
      case "IRON_DALIAN":
        return { name: "Minério Ferro (Dalian)", icon: <Mountain className="h-4 w-4 text-orange-600" /> };
      default:
        return { name: key, icon: null };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Commodities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(commodities).map(([key, commodity]) => {
            const { name, icon } = getCommodityNameDisplay(key);
            const isChangePositive = !commodity.change.includes("-");
            
            return (
              <Card key={key} className="border">
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
                  
                  <div className="flex items-center justify-between mt-2">
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
