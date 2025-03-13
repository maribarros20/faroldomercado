
import React, { useState, useEffect } from "react";
import { 
  fetchAllNews, NEWS_CATEGORIES, FINANCIAL_NEWS_SOURCES, NewsItem 
} from "@/services/NewsService";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, RefreshCw, Filter, Newspaper, Twitter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NewsCard } from "./news/NewsCard";
import { Badge } from "@/components/ui/badge";
import { TwitterFeed } from "./twitter/TwitterFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Categorias financeiras para filtro
const FINANCE_CATEGORIES = [
  "all",
  "Mercado de Ações",
  "Fundos de Investimento",
  "Renda Fixa",
  "Criptomoedas",
  "Commodities",
  "Economia",
  "Negócios"
];

const MarketNews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyFinancialNews, setShowOnlyFinancialNews] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("all");
  const { toast } = useToast();

  // Buscar notícias usando React Query
  const {
    data: news,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['market-news', selectedCategory, searchTerm, showOnlyFinancialNews, selectedSource],
    queryFn: async () => {
      const allNews = await fetchAllNews(selectedCategory || undefined, searchTerm || undefined);
      
      // Aplicar filtros
      let filteredNews = [...allNews];
      
      // Filtrar por fonte se selecionada
      if (selectedSource !== "all") {
        filteredNews = filteredNews.filter(item => item.source === selectedSource);
      }
      
      // Se o filtro de notícias financeiras estiver ativo, filtrar apenas notícias financeiras
      if (showOnlyFinancialNews) {
        filteredNews = filteredNews.filter(newsItem => 
          // Verificar se a categoria é relacionada a finanças
          FINANCE_CATEGORIES.includes(newsItem.category || "") || 
          // Ou se a fonte é uma fonte financeira conhecida
          FINANCIAL_NEWS_SOURCES.includes(newsItem.source || "")
        );
      }
      
      // Ordenar por data de publicação (mais recentes primeiro)
      return filteredNews.sort((a, b) => {
        const dateA = new Date(a.publication_date || a.created_at || "").getTime();
        const dateB = new Date(b.publication_date || b.created_at || "").getTime();
        return dateB - dateA;
      });
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 15 * 60 * 1000, // Atualizar a cada 15 minutos
  });

  // Filtrar tweets
  const twitterPosts = React.useMemo(() => {
    if (!news) return [];
    return news.filter(item => item.source === 'Twitter');
  }, [news]);

  // Extrair fontes únicas das notícias para o filtro
  const getUniqueSources = () => {
    if (!news) return [];
    
    const sources = new Set(news.map(item => item.source));
    return Array.from(sources);
  };

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

  const toggleFinancialNewsFilter = () => {
    setShowOnlyFinancialNews(!showOnlyFinancialNews);
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
              {FINANCE_CATEGORIES.slice(1).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[200px]">
          <Select
            value={selectedSource}
            onValueChange={setSelectedSource}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fontes</SelectItem>
              {getUniqueSources().map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant={showOnlyFinancialNews ? "default" : "outline"}
          onClick={toggleFinancialNewsFilter}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          {showOnlyFinancialNews ? "Apenas Mercado Financeiro" : "Todas as Notícias"}
        </Button>
      </div>

      {/* Estatísticas de fontes */}
      {news && news.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getUniqueSources().map(source => {
            const count = news.filter(item => item.source === source).length;
            return (
              <Badge 
                key={source} 
                variant={selectedSource === source ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSource(source === selectedSource ? "all" : source)}
              >
                <Newspaper className="h-3 w-3 mr-1" /> {source}: {count}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Abas para visualização de notícias e tweets */}
      <Tabs defaultValue="all" onValueChange={setViewMode} value={viewMode}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas as notícias</TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-1">
            <Twitter size={14} />
            Twitter
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
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
        </TabsContent>
        
        <TabsContent value="twitter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <TwitterFeed tweets={twitterPosts} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketNews;
