
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MarketHeaderProps {
  lastUpdate: string;
  isLoading: boolean;
  onRefresh: () => void;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ 
  lastUpdate, 
  isLoading, 
  onRefresh 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-[#323232]">Panorama do Mercado</h2>
        <p className="text-gray-600">Visão consolidada de ADRs, Commodities e Indicadores de Volatilidade</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Última atualização: {lastUpdate}
        </span>
        <Button 
          onClick={onRefresh} 
          variant="outline"
          className="bg-white shadow-md hover:bg-blue-50"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
};

export default MarketHeader;
