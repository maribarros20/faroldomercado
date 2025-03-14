
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/services/NewsService";

interface NewsCardProps {
  newsItem: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "";
    }
  };

  // Fallback image handling with visual feedback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Failed to load image for news: ${newsItem.title}`);
    let fallbackImage = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
    
    // Use source-specific fallback
    if (newsItem.source === 'Bloomberg Markets' || newsItem.source === 'Bloomberg Economics') {
      fallbackImage = 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
    } else if (newsItem.source === 'CNN Money') {
      fallbackImage = 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
    } else if (newsItem.source === 'Valor Econômico') {
      fallbackImage = 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
    }
    
    e.currentTarget.src = fallbackImage;
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-muted">
        <img
          src={newsItem.image_url || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop'}
          alt={newsItem.title}
          className="object-cover w-full h-full"
          onError={handleImageError}
        />
        {newsItem.source && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 opacity-90"
          >
            {newsItem.source}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        {newsItem.category && (
          <Badge variant="outline" className="mb-2 self-start">
            {newsItem.category}
          </Badge>
        )}
        <h3 className="text-lg font-semibold mb-2">{newsItem.title}</h3>
        {newsItem.subtitle && (
          <p className="text-sm text-muted-foreground mb-3">{newsItem.subtitle}</p>
        )}
        <p className="text-sm line-clamp-3 mb-4 flex-1">
          {newsItem.content}
        </p>
        <div className="mt-auto">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{newsItem.author || "Farol Investe"}</span>
            <span>{formatDate(newsItem.publication_date || newsItem.created_at)}</span>
          </div>
          <div className="mt-3">
            {newsItem.source_url ? (
              <a
                href={newsItem.source_url}
                className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={12} />
                Ler matéria completa
              </a>
            ) : newsItem.source === 'Farol Investe' && newsItem.id ? (
              <a
                href={`/admin/news-manager/detail/${newsItem.id}`}
                className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink size={12} />
                Ler matéria completa
              </a>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
