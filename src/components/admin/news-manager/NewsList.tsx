
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import type { NewsItem } from "@/services/NewsService";

interface NewsListProps {
  newsList?: NewsItem[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  refetch: () => void;
}

export const NewsList: React.FC<NewsListProps> = ({
  newsList,
  isLoading,
  onEdit,
  onDelete,
  refetch
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  // Safely handle edit and delete actions
  const handleEdit = (id: string | undefined) => {
    if (id) {
      onEdit(id);
    }
  };

  const handleDelete = (id: string | undefined) => {
    if (id) {
      onDelete(id);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Notícias Publicadas</CardTitle>
        <CardDescription>
          {isLoading 
            ? "Carregando notícias..." 
            : `${newsList?.length || 0} notícias publicadas`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center p-4">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando notícias...</p>
          </div>
        ) : newsList?.length === 0 ? (
          <div className="text-center p-4 border rounded-md border-dashed">
            <p className="text-muted-foreground">Nenhuma notícia publicada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie sua primeira notícia usando o formulário ao lado
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {newsList?.map((news) => (
              <li 
                key={news.id} 
                className={`border rounded-md p-3 hover:bg-muted/50 transition-colors ${
                  news.category === 'Resumo de Mercado' ? 'border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium truncate" title={news.title}>
                      {news.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(news.publication_date || news.created_at)}
                    </p>
                    {news.category && (
                      <span className="inline-block text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 mt-1">
                        {news.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(news.id)}
                      title="Editar"
                      className="hover:bg-[#e6f0ff] hover:text-[#0066FF]"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(news.id)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive hover:bg-[#e6f0ff]"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="text-xs hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        >
          <RefreshCw size={14} className="mr-1" />
          Atualizar Lista
        </Button>
      </CardFooter>
    </Card>
  );
};
