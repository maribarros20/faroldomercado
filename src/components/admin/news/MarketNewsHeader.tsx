
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MarketNewsHeaderProps {
  handleRefresh: () => void;
}

export const MarketNewsHeader: React.FC<MarketNewsHeaderProps> = ({ handleRefresh }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Notícias do Mercado</h2>
        <p className="text-muted-foreground">
          Fique por dentro das últimas notícias do mercado financeiro
        </p>
      </div>
      <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
        <RefreshCw size={16} />
        Atualizar
      </Button>
    </div>
  );
};
