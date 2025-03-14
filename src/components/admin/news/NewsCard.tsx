
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/services/NewsService";

interface NewsCardProps {
  newsItem: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  // Improved image fallback handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    console.warn(`Failed to load image for news: ${newsItem.title}`);
    
    let fallbackImage = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
    
    // Use source-specific fallback
    if (newsItem.source === 'Bloomberg Markets' || newsItem.source === 'Bloomberg Economics') {
      fallbackImage = 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
    } else if (newsItem.source === 'CNN Money') {
      fallbackImage = 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
    } else if (newsItem.source === 'Valor Econômico') {
      fallbackImage = 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
    } else if (newsItem.source === 'BBC Economia') {
      fallbackImage = 'https://ichef.bbci.co.uk/news/640/cpsprodpb/F3C4/production/_123996607_bbcbrasil.png';
    } else if (newsItem.source === 'UOL Economia') {
      fallbackImage = 'https://conteudo.imguol.com.br/c/home/11/2019/10/30/logo-uol-horizontal-1572447337368_1920x1080.jpg';
    } else if (newsItem.source === 'Folha de São Paulo') {
      fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo_Folha_de_S.Paulo.svg';
    } else if (newsItem.source === 'Valor Investing') {
      fallbackImage = 'https://valorinveste.globo.com/includes/site_vi_2019/img/logo_valorinveste.svg';
    }
    
    e.currentTarget.src = fallbackImage;
    e.currentTarget.onload = () => setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-muted">
        {/* Show a loading skeleton while image is loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse"></div>
        )}
        
        <img
          src={newsItem.image_url || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop'}
          alt={newsItem.title}
          className={`object-cover w-full h-full transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
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
