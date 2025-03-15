
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, MessageCircle, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NewsItem } from "@/services/NewsService";

interface TwitterFeedProps {
  tweets?: NewsItem[];
}

export const TwitterFeed: React.FC<TwitterFeedProps> = ({ tweets = [] }) => {
  if (!tweets || tweets.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Sem tweets disponíveis</h3>
            <p className="text-muted-foreground mb-4">
              Não há tweets do Twitter para exibir no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="space-y-4">
      {tweets.map((tweet, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {tweet.image_url ? (
                  <AvatarImage src={tweet.image_url} />
                ) : (
                  <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023.svg" />
                )}
                <AvatarFallback>
                  {tweet.author?.substring(0, 2) || "TW"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{tweet.author || "Twitter User"}</div>
                <div className="text-xs text-muted-foreground">
                  @{tweet.author?.replace(/\s+/g, "").toLowerCase() || "twitter"} · {formatDate(tweet.publication_date || tweet.created_at)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm">{tweet.content}</p>
            {tweet.category && (
              <Badge variant="outline" className="mt-2">
                {tweet.category}
              </Badge>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between border-t">
            <div className="flex gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{Math.floor(Math.random() * 20)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{Math.floor(Math.random() * 100)}</span>
              </div>
            </div>
            {tweet.source_url && (
              <a
                href={tweet.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver no Twitter
              </a>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
