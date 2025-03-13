
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/services/NewsService";

interface BCBNewsCardProps {
  newsItem: NewsItem;
}

export const BCBNewsCard: React.FC<BCBNewsCardProps> = ({ newsItem }) => {
  return (
    <Card>
      <CardContent className="p-4">
        {newsItem.category && (
          <Badge variant="outline" className="mb-2">
            {newsItem.category}
          </Badge>
        )}
        <h3 className="text-lg font-semibold mb-2">{newsItem.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {newsItem.content}
        </p>
        <div className="text-xs text-muted-foreground mb-3">
          {new Date(newsItem.publication_date || "").toLocaleDateString("pt-BR")}
        </div>
        {newsItem.source_url && (
          <a
            href={newsItem.source_url}
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink size={12} />
            Ver no site do BCB
          </a>
        )}
      </CardContent>
    </Card>
  );
};
