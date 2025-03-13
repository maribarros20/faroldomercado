
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { NewsItem } from "@/services/NewsService";
import { NewsCard } from "./NewsCard";

interface NewsGridProps {
  isLoading?: boolean;
  news?: NewsItem[];
}

export const NewsGrid: React.FC<NewsGridProps> = ({ isLoading, news }) => {
  if (isLoading) {
    return (
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
    );
  }

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhuma notícia encontrada para os filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, index) => (
        <NewsCard key={item.id || `news-${index}`} newsItem={item} />
      ))}
    </div>
  );
};
