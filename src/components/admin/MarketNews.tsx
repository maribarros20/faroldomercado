
import React, { useState } from "react";
import { fetchAllNews, NEWS_CATEGORIES, NewsItem, cleanTextContent } from "@/services/NewsService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, Calendar, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

const MarketNews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();

  // Buscar notícias usando React Query
  const {
    data: news,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['market-news', selectedCategory, searchTerm],
    queryFn: () => fetchAllNews(selectedCategory || undefined, searchTerm || undefined),
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 15 * 60 * 1000, // Atualizar a cada 15 minutos
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Atualizando notícias",
      description: "Buscando as notícias mais recentes do mercado financeiro.",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center p-6">
            <p className="text-destructive mb-4">Erro ao carregar notícias</p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar notícias..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="w-full md:w-[200px]">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {NEWS_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : news && news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <NewsCard key={item.id || `news-${index}`} newsItem={item} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Nenhuma notícia encontrada para os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente de card de notícia
const NewsCard = ({ newsItem }: { newsItem: NewsItem }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "";
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {newsItem.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={newsItem.image_url}
            alt={newsItem.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              // Substituir por imagem padrão em caso de erro
              e.currentTarget.src = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop";
            }}
          />
        </div>
      )}
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="mb-2 flex gap-2">
          {newsItem.category && (
            <Badge variant="secondary">{cleanTextContent(newsItem.category)}</Badge>
          )}
          {newsItem.source && newsItem.source !== "manual" && (
            <Badge variant="outline">{cleanTextContent(newsItem.source)}</Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{cleanTextContent(newsItem.title)}</h3>
        {newsItem.subtitle && (
          <p className="text-muted-foreground text-sm mb-2">{cleanTextContent(newsItem.subtitle)}</p>
        )}
        <p className="line-clamp-3 text-sm mb-4">
          {cleanTextContent(newsItem.content)}
        </p>
        <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              {formatDate(newsItem.publication_date || newsItem.created_at)}
            </span>
          </div>
          {newsItem.author && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{cleanTextContent(newsItem.author)}</span>
            </div>
          )}
        </div>
      </CardContent>
      {newsItem.source_url && (
        <CardFooter className="p-4 pt-0">
          <a
            href={newsItem.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink size={12} />
            Ler notícia completa
          </a>
        </CardFooter>
      )}
    </Card>
  );
};

export default MarketNews;
