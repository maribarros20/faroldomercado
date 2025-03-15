
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { NewsItem } from "@/services/NewsService";

interface BCBNewsCardProps {
  newsItem: NewsItem;
}

export const BCBNewsCard: React.FC<BCBNewsCardProps> = ({ newsItem }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Format date in Brazilian Portuguese
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  // Handle image loading
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Get category-specific badge color
  const getBadgeVariant = (category?: string) => {
    switch (category) {
      case "Comunicados COPOM":
        return "destructive";
      case "Boletim Focus":
        return "blue";
      case "Relatório de Inflação":
        return "green";
      case "Notícias BCB":
        return "yellow";
      default:
        return "secondary";
    }
  };

  // Default image for BCB
  const defaultImage = "https://www.bcb.gov.br/content/home/img/Logo-BC-transparente.png";
  const imageSrc = imageError ? defaultImage : (newsItem.image_url || defaultImage);

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-20 bg-blue-50 flex items-center justify-center">
        {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
        
        <img
          src={imageSrc}
          alt="Banco Central do Brasil"
          className={`object-contain h-16 w-auto mx-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        
        {newsItem.category && (
          <Badge 
            variant={getBadgeVariant(newsItem.category) as any}
            className="absolute top-2 right-2 opacity-90"
          >
            {newsItem.category}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-medium mb-3 line-clamp-3">{newsItem.title}</h3>
        
        <p className="text-sm line-clamp-3 mb-4 flex-1 text-gray-600">
          {newsItem.content}
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="flex items-center">
              <Calendar size={12} className="mr-1" />
              {formatDate(newsItem.publication_date || newsItem.created_at)}
            </span>
          </div>
          
          {newsItem.source_url && (
            <a
              href={newsItem.source_url}
              className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={12} />
              Ver no site do BCB
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
