
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, BarChart3 } from "lucide-react";

interface NewsManagerHeaderProps {
  handleCreate: () => void;
  handleGenerateMarketSummary: () => void;
  refetch: () => void;
}

export const NewsManagerHeader: React.FC<NewsManagerHeaderProps> = ({
  handleCreate,
  handleGenerateMarketSummary,
  refetch
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Gerenciamento de Notícias</h2>
        <p className="text-muted-foreground">
          Crie e gerencie notícias para os usuários da plataforma
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleCreate} 
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Nova Notícia
        </Button>
        <Button 
          onClick={handleGenerateMarketSummary}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <BarChart3 size={16} />
          Gerar Resumo do Mercado
        </Button>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="flex items-center gap-2 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        >
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </div>
    </div>
  );
};
