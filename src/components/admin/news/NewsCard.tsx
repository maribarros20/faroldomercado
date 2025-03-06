
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NewsItem, cleanTextContent, getValidImageUrl } from "@/services/NewsService";

interface NewsCardProps {
  newsItem: NewsItem;
}

export const NewsCard = ({ newsItem }: NewsCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "";
    }
  };

  // Garantir que a URL da imagem seja válida
  const imageUrl = getValidImageUrl(newsItem.image_url);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={newsItem.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onError={(e) => {
            // Substituir por imagem padrão em caso de erro
            e.currentTarget.src = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop";
          }}
        />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="mb-2 flex gap-2 flex-wrap">
          {newsItem.category && (
            <Badge variant="secondary">{cleanTextContent(newsItem.category)}</Badge>
          )}
          {newsItem.source && (
            <Badge variant="outline">{cleanTextContent(newsItem.source)}</Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{cleanTextContent(newsItem.title)}</h3>
        {newsItem.subtitle && (
          <p className="text-muted-foreground text-sm mb-2">{cleanTextContent(newsItem.subtitle)}</p>
        )}
        <p className="line-clamp-3 text-sm mb-4">
          {cleanTextContent(newsItem.content)}
        </p>
        <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              {formatDate(newsItem.publication_date || newsItem.created_at)}
            </span>
          </div>
          {newsItem.author && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{cleanTextContent(newsItem.author)}</span>
            </div>
          )}
        </div>
      </CardContent>
      {newsItem.source_url && (
        <CardFooter className="p-4 pt-0">
          <a
            href={newsItem.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink size={12} />
            Ler notícia completa
          </a>
        </CardFooter>
      )}
    </Card>
  );
};
