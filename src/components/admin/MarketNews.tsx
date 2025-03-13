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
  Search, RefreshCw, Filter, Newspaper, Twitter, BarChart3, Building, ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NewsCard } from "./news/NewsCard";
import { Badge } from "@/components/ui/badge";
import { TwitterFeed } from "./twitter/TwitterFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const FINANCE_CATEGORIES = [
  "all",
  "Mercado de Ações",
  "Fundos de Investimento",
  "Renda Fixa",
  "Criptomoedas",
  "Commodities",
  "Economia",
  "Negócios",
  "Resumo de Mercado",
  "Comunicados BCB",
  "Notícias BCB",
  "Comunicados COPOM",
  "Relatório de Inflação",
  "Boletim Focus"
];

const MarketNews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyFinancialNews, setShowOnlyFinancialNews] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("all");
  const { toast } = useToast();

  const {
    data: news,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['market-news', selectedCategory, searchTerm, showOnlyFinancialNews, selectedSource],
    queryFn: async () => {
      const allNews = await fetchAllNews(selectedCategory || undefined, searchTerm || undefined);
      
      let filteredNews = [...allNews];
      
      if (selectedSource !== "all") {
        filteredNews = filteredNews.filter(item => item.source === selectedSource);
      }
      
      if (showOnlyFinancialNews) {
        filteredNews = filteredNews.filter(newsItem => 
          FINANCE_CATEGORIES.includes(newsItem.category || "") || 
          FINANCIAL_NEWS_SOURCES.includes(newsItem.source || "")
        );
      }
      
      return filteredNews.sort((a, b) => {
        const dateA = new Date(a.publication_date || a.created_at || "").getTime();
        const dateB = new Date(b.publication_date || b.created_at || "").getTime();
        return dateB - dateA;
      });
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const {
    data: bcbNews,
    isLoading: isBcbLoading,
    refetch: refetchBcb
  } = useQuery({
    queryKey: ['bcb-news'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-bcb-news');
      
      if (error) {
        console.error("Erro ao buscar notícias do Banco Central:", error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });

  const twitterPosts = React.useMemo(() => {
    if (!news) return [];
    return news.filter(item => item.source === 'Twitter');
  }, [news]);

  const marketSummaries = React.useMemo(() => {
    if (!news) return [];
    return news.filter(item => item.category === 'Resumo de Mercado');
  }, [news]);

  const getBcbNewsByCategory = (category?: string) => {
    if (!bcbNews) return [];
    
    if (category) {
      return bcbNews.filter(item => item.category === category);
    }
    
    return bcbNews;
  };

  const getUniqueSources = () => {
    if (!news) return [];
    
    const sources = new Set(news.map(item => item.source));
    return Array.from(sources);
  };

  const handleRefresh = () => {
    refetch();
    refetchBcb();
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

  const formatMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    
    const formattedContent: JSX.Element[] = [];
    
    lines.forEach((line, i) => {
      const processLinks = (text: string) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          
          parts.push(
            <a 
              key={`link-${i}-${match.index}`}
              href={match[2]} 
              className="text-blue-500 hover:underline"
            >
              {match[1]}
            </a>
          );
          
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }
        
        return parts.length > 1 ? <>{parts}</> : text;
      };
      
      if (line.startsWith('# ')) {
        formattedContent.push(
          <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{processLinks(line.substring(2))}</h1>
        );
      } else if (line.startsWith('## ')) {
        formattedContent.push(
          <h2 key={i} className="text-xl font-bold mt-5 mb-3">{processLinks(line.substring(3))}</h2>
        );
      } else if (line.startsWith('### ')) {
        formattedContent.push(
          <h3 key={i} className="text-lg font-bold mt-4 mb-2">{processLinks(line.substring(4))}</h3>
        );
      } else if (line.startsWith('- ')) {
        formattedContent.push(
          <li key={i} className="ml-6 mb-2">{processLinks(line.substring(2))}</li>
        );
      } else if (line.trim()) {
        formattedContent.push(
          <p key={i} className="mb-4">{processLinks(line)}</p>
        );
      } else {
        formattedContent.push(<br key={i} />);
      }
    });
    
    return formattedContent;
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

      <Tabs defaultValue="all" onValueChange={setViewMode} value={viewMode}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas as notícias</TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <BarChart3 size={14} />
            Resumo do Mercado
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-1">
            <Twitter size={14} />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="bcb" className="flex items-center gap-1">
            <Building size={14} />
            Banco Central
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
        
        <TabsContent value="summary">
          {isLoading ? (
            <Card className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ) : marketSummaries && marketSummaries.length > 0 ? (
            <div className="space-y-6">
              {marketSummaries.map((item, index) => (
                <Card key={`summary-${index}`}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.subtitle}</p>
                    <div className="prose max-w-none">
                      {formatMarkdownContent(item.content)}
                    </div>
                    {item.source_url && (
                      <div className="mt-4">
                        <a
                          href={item.source_url}
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Ler matéria completa
                        </a>
                      </div>
                    )}
                    {item.author && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Autor: {item.author}</p>
                      </div>
                    )}
                    {(item.publication_date || item.created_at) && (
                      <div className="text-sm text-muted-foreground">
                        <p>Data: {new Date(item.publication_date || item.created_at || "").toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhum resumo de mercado disponível para hoje.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="twitter">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <TwitterFeed tweets={twitterPosts} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bcb">
          {isBcbLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bcbNews && bcbNews.length > 0 ? (
            <div className="space-y-6">
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="Comunicados BCB">Comunicados</TabsTrigger>
                  <TabsTrigger value="Notícias BCB">Notícias</TabsTrigger>
                  <TabsTrigger value="Comunicados COPOM">COPOM</TabsTrigger>
                  <TabsTrigger value="Relatório de Inflação">RI</TabsTrigger>
                  <TabsTrigger value="Boletim Focus">Focus</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bcbNews.map((item, index) => (
                      <Card key={`bcb-${index}`}>
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2">{item.category}</Badge>
                          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {item.content}
                          </p>
                          <div className="text-xs text-muted-foreground mb-3">
                            {new Date(item.publication_date).toLocaleDateString('pt-BR')}
                          </div>
                          {item.source_url && (
                            <a
                              href={item.source_url}
                              className="text-xs flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink size={12} />
                              Ver no site do BCB
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                {["Comunicados BCB", "Notícias BCB", "Comunicados COPOM", "Relatório de Inflação", "Boletim Focus"].map(category => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getBcbNewsByCategory(category).map((item, index) => (
                        <Card key={`bcb-cat-${index}`}>
                          <CardContent className="p-4">
                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {item.content}
                            </p>
                            <div className="text-xs text-muted-foreground mb-3">
                              {new Date(item.publication_date).toLocaleDateString('pt-BR')}
                            </div>
                            {item.source_url && (
                              <a
                                href={item.source_url}
                                className="text-xs flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink size={12} />
                                Ver no site do BCB
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {getBcbNewsByCategory(category).length === 0 && (
                        <Card className="col-span-full">
                          <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">
                              Nenhuma notícia encontrada para esta categoria.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhuma notícia do Banco Central encontrada.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => refetchBcb()}
                  className="mt-4"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Buscar notícias do BCB
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketNews;
