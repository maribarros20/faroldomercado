
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageCircle, Repeat, Heart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NewsItem } from "@/services/NewsService";

interface TwitterFeedProps {
  tweets: NewsItem[];
}

export const TwitterFeed = ({ tweets }: TwitterFeedProps) => {
  if (!tweets || tweets.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMM', 'yyyy • HH:mm", { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "";
    }
  };

  const getTwitterUsername = (author?: string): string => {
    switch (author) {
      case "Donald Trump":
        return "@realDonaldTrump";
      case "Luiz Inácio Lula da Silva":
        return "@LulaOficial";
      case "Elon Musk":
        return "@elonmusk";
      case "Fernando Haddad":
        return "@FernandoHaddad";
      default:
        return "@" + (author || "").toLowerCase().replace(/\s+/g, "");
    }
  };

  const getProfilePicture = (author?: string): string => {
    switch (author) {
      case "Donald Trump":
        return "https://unavatar.io/twitter/realDonaldTrump";
      case "Luiz Inácio Lula da Silva":
        return "https://unavatar.io/twitter/LulaOficial";
      case "Elon Musk":
        return "https://unavatar.io/twitter/elonmusk";
      case "Fernando Haddad":
        return "https://unavatar.io/twitter/FernandoHaddad";
      default:
        return "https://unavatar.io/twitter/farolinveste";
    }
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto p-1">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Badge className="mr-2 bg-blue-400 hover:bg-blue-500">Twitter</Badge>
        Últimas atualizações dos líderes
      </h3>
      
      {tweets.map((tweet, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow overflow-hidden border-l-4 border-blue-400">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border-2 border-blue-100">
                <AvatarImage src={getProfilePicture(tweet.author)} />
                <AvatarFallback>{tweet.author?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{tweet.author}</p>
                    <p className="text-sm text-muted-foreground">{getTwitterUsername(tweet.author)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(tweet.publication_date)}
                  </span>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm whitespace-pre-line">{tweet.content}</p>
                  
                  {tweet.image_url && tweet.image_url.startsWith('http') && !tweet.image_url.includes('unavatar.io') && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img 
                        src={tweet.image_url} 
                        alt="Tweet media" 
                        className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 mt-3 text-muted-foreground">
                  <button className="text-xs flex items-center gap-1 hover:text-blue-500">
                    <MessageCircle size={14} />
                    <span>Comentar</span>
                  </button>
                  <button className="text-xs flex items-center gap-1 hover:text-green-500">
                    <Repeat size={14} />
                    <span>Repostar</span>
                  </button>
                  <button className="text-xs flex items-center gap-1 hover:text-red-500">
                    <Heart size={14} />
                    <span>Curtir</span>
                  </button>
                  {tweet.source_url && (
                    <a
                      href={tweet.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 hover:text-blue-500 ml-auto"
                    >
                      <ExternalLink size={14} />
                      <span>Ver no Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
