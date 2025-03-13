
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, BarChart3 } from "lucide-react";

interface NewsStatsProps {
  newsCount: number;
  categoryNewsCount: Record<string, number>;
}

export const NewsStats: React.FC<NewsStatsProps> = ({ 
  newsCount, 
  categoryNewsCount 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Notícias</p>
              <h3 className="text-2xl font-bold">{newsCount}</h3>
            </div>
            <Newspaper className="h-8 w-8 text-blue-500 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resumos de Mercado</p>
              <h3 className="text-2xl font-bold">{categoryNewsCount['Resumo de Mercado'] || 0}</h3>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      {/* Espaço para adicionar mais cards de estatísticas conforme necessário */}
    </div>
  );
};
