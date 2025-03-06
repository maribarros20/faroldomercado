
import React, { useState } from "react";
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
  Search, RefreshCw, Filter 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NewsCard } from "./news/NewsCard";

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
  const { toast } = useToast();

  // Buscar notícias usando React Query
  const {
    data: news,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['market-news', selectedCategory, searchTerm, showOnlyFinancialNews],
    queryFn: async () => {
      const allNews = await fetchAllNews(selectedCategory || undefined, searchTerm || undefined);
      
      // Se o filtro de notícias financeiras estiver ativo, filtrar apenas notícias financeiras
      if (showOnlyFinancialNews) {
        return allNews.filter(newsItem => 
          // Verificar se a categoria é relacionada a finanças
          FINANCE_CATEGORIES.includes(newsItem.category || "") || 
          // Ou se a fonte é uma fonte financeira conhecida
          FINANCIAL_NEWS_SOURCES.includes(newsItem.source || "")
        );
      }
      
      return allNews;
    },
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

        <Button 
          variant={showOnlyFinancialNews ? "default" : "outline"}
          onClick={toggleFinancialNewsFilter}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          {showOnlyFinancialNews ? "Apenas Mercado Financeiro" : "Todas as Notícias"}
        </Button>
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

export default MarketNews;
