
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NEWS_CATEGORIES, FINANCIAL_NEWS_SOURCES, fetchAllNews } from "@/services/NewsService";
import type { NewsItem } from "@/services/NewsService";

// Import refactored components
import { MarketNewsHeader } from "./news/MarketNewsHeader";
import { NewsSearchFilters } from "./news/NewsSearchFilters";
import { NewsSourceBadges } from "./news/NewsSourceBadges";
import { NewsTabs } from "./news/NewsTabs";
import { formatMarkdownContent } from "./news/utils/formatMarkdown";
import { FINANCE_CATEGORIES, BCB_CATEGORIES } from "./news/constants";

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
          FINANCIAL_NEWS_SOURCES.includes(newsItem.source || "") ||
          BCB_CATEGORIES.includes(newsItem.category || "")
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
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao serviço de notícias do Banco Central.",
          variant: "destructive"
        });
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

  // Função para filtrar notícias do BCB por categoria
  const getBcbNewsByCategory = (category?: string) => {
    if (!bcbNews) return [];
    
    if (category) {
      return bcbNews.filter(item => item.category === category);
    }
    
    return bcbNews;
  };

  const getUniqueSources = () => {
    if (!news) return [];
    
    const sources = new Set(news.map(item => item.source).filter(Boolean));
    return Array.from(sources) as string[];
  };

  const getNewsCountBySource = () => {
    if (!news) return {};
    
    return news.reduce((acc: Record<string, number>, item) => {
      if (item.source) {
        acc[item.source] = (acc[item.source] || 0) + 1;
      }
      return acc;
    }, {});
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

  const handleSourceSelect = (source: string) => {
    setSelectedSource(source);
  };

  if (isError) {
    return (
      <div className="w-full">
        <div className="text-center p-6">
          <p className="text-destructive mb-4">Erro ao carregar notícias</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const uniqueSources = getUniqueSources();
  const newsCounts = getNewsCountBySource();

  return (
    <div className="space-y-6">
      <MarketNewsHeader handleRefresh={handleRefresh} />

      <NewsSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        showOnlyFinancialNews={showOnlyFinancialNews}
        toggleFinancialNewsFilter={toggleFinancialNewsFilter}
        handleSearch={handleSearch}
        uniqueSources={uniqueSources}
        financeCategories={FINANCE_CATEGORIES}
      />

      <NewsSourceBadges
        sources={uniqueSources}
        newsCounts={newsCounts}
        selectedSource={selectedSource}
        onSourceSelect={handleSourceSelect}
      />

      <NewsTabs
        viewMode={viewMode}
        setViewMode={setViewMode}
        isLoading={isLoading}
        isBcbLoading={isBcbLoading}
        news={news}
        marketSummaries={marketSummaries}
        twitterPosts={twitterPosts}
        bcbNews={bcbNews}
        refetchBcb={refetchBcb}
        formatMarkdownContent={formatMarkdownContent}
        getBcbNewsByCategory={getBcbNewsByCategory}
      />
    </div>
  );
};

export default MarketNews;
