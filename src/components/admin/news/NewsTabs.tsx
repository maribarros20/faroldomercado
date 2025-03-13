
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Twitter, Building, RefreshCw, ExternalLink } from "lucide-react";
import type { NewsItem } from "@/services/NewsService";
import { NewsGrid } from "./NewsGrid";
import { NewsCard } from "./NewsCard";
import { TwitterFeed } from "../twitter/TwitterFeed";

interface NewsTabsProps {
  viewMode: string;
  setViewMode: (value: string) => void;
  isLoading: boolean;
  isBcbLoading: boolean;
  news: NewsItem[] | undefined;
  marketSummaries: NewsItem[];
  twitterPosts: NewsItem[];
  bcbNews: NewsItem[] | undefined;
  refetchBcb: () => void;
  formatMarkdownContent: (content: string) => JSX.Element[];
  getBcbNewsByCategory: (category?: string) => NewsItem[];
}

export const NewsTabs: React.FC<NewsTabsProps> = ({
  viewMode,
  setViewMode,
  isLoading,
  isBcbLoading,
  news,
  marketSummaries,
  twitterPosts,
  bcbNews,
  refetchBcb,
  formatMarkdownContent,
  getBcbNewsByCategory,
}) => {
  return (
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
          <NewsGrid isLoading={true} />
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
                      <p>
                        Data:{" "}
                        {new Date(
                          item.publication_date || item.created_at || ""
                        ).toLocaleDateString("pt-BR")}
                      </p>
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
                        <Badge variant="outline" className="mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {item.content}
                        </p>
                        <div className="text-xs text-muted-foreground mb-3">
                          {new Date(item.publication_date).toLocaleDateString(
                            "pt-BR"
                          )}
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

              {[
                "Comunicados BCB",
                "Notícias BCB",
                "Comunicados COPOM",
                "Relatório de Inflação",
                "Boletim Focus",
              ].map((category) => (
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
                            {new Date(item.publication_date).toLocaleDateString(
                              "pt-BR"
                            )}
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
              <Button variant="outline" onClick={() => refetchBcb()} className="mt-4">
                <RefreshCw size={16} className="mr-2" />
                Buscar notícias do BCB
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

// Missing Badge import
import { Badge } from "@/components/ui/badge";
