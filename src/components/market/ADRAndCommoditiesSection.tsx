
import React from "react";
import ADRPanel from "./ADRPanel";
import CommoditiesPanel from "./CommoditiesPanel";

interface ADRAndCommoditiesSectionProps {
  adrs: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      prevChange: string;
      afterChange: string;
    };
  };
  commoditiesList: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const ADRAndCommoditiesSection: React.FC<ADRAndCommoditiesSectionProps> = ({ 
  adrs, 
  commoditiesList 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ADR Detail Panel */}
      <ADRPanel adrs={adrs} />

      {/* Commodities Detail Panel */}
      <CommoditiesPanel commodities={commoditiesList} />
    </div>
  );
};

export default ADRAndCommoditiesSection;
