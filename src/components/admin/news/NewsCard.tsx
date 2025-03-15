
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Improved image fallback handling with progressive loading
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getSourceFallbackImage = (source?: string): string => {
    if (!source) return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
    
    switch (source) {
      case 'Bloomberg Markets':
      case 'Bloomberg Economics':
      case 'Bloomberg':
      case 'Bloomberg Línea':
        return 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      case 'CNN Money':
        return 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
      case 'Valor Econômico':
      case 'Valor Investing':
        return 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
      case 'BBC Economia':
      case 'BBC':
        return 'https://ichef.bbci.co.uk/news/640/cpsprodpb/F3C4/production/_123996607_bbcbrasil.png';
      case 'UOL Economia':
      case 'UOL':
        return 'https://conteudo.imguol.com.br/c/home/11/2019/10/30/logo-uol-horizontal-1572447337368_1920x1080.jpg';
      case 'Folha de São Paulo':
        return 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo_Folha_de_S.Paulo.svg';
      case 'New York Times':
      case 'NYTimes':
        return 'https://static01.nyt.com/images/2022/09/12/NYT-METS-1000x1000-1678734279986/NYT-METS-1000x1000-1678734279986-mobileMasterAt3x.jpg';
      case 'Wall Street Journal':
      case 'WSJ':
        return 'https://s.wsj.net/img/meta/wsj-social-share.png';
      default:
        return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
    }
  };

  // Preload image with better error handling
  React.useEffect(() => {
    if (!newsItem.image_url) {
      setImageLoaded(true);
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    
    img.src = newsItem.image_url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [newsItem.image_url]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Decode HTML entities in content
  const decodeHtmlEntities = (text: string): string => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  const displayTitle = decodeHtmlEntities(newsItem.title);
  const displaySubtitle = newsItem.subtitle ? decodeHtmlEntities(newsItem.subtitle) : '';
  const displayContent = decodeHtmlEntities(newsItem.content);

  // Determine the image source based on loading state and errors
  const imageSrc = imageError || !newsItem.image_url 
    ? getSourceFallbackImage(newsItem.source) 
    : (newsItem.image_url || getSourceFallbackImage(newsItem.source));

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-muted">
        {/* Show a loading skeleton while image is loading */}
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 h-full w-full" />
        )}
        
        <img
          src={imageSrc}
          alt={displayTitle}
          className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
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
        <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
        {displaySubtitle && (
          <p className="text-sm text-muted-foreground mb-3">{displaySubtitle}</p>
        )}
        <p className="text-sm line-clamp-3 mb-4 flex-1">
          {displayContent}
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
