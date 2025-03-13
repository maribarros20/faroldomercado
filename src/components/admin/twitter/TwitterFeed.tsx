
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageCircle, Repeat, Heart, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NewsItem } from "@/services/NewsService";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface TwitterFeedProps {
  tweets: NewsItem[];
}

export const TwitterFeed = ({ tweets }: TwitterFeedProps) => {
  if (!tweets || tweets.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhuma publicação do Twitter disponível no momento.</p>
        <p className="text-xs text-muted-foreground mt-2">As publicações aparecerão aqui quando disponíveis da API do Twitter.</p>
      </Card>
    );
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
        return "https://pbs.twimg.com/profile_images/1734739429845327872/V3JsD5Io_400x400.jpg";
      case "Luiz Inácio Lula da Silva":
        return "https://pbs.twimg.com/profile_images/1710640007863353344/DNH94mas_400x400.jpg";
      case "Elon Musk":
        return "https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg";
      case "Fernando Haddad":
        return "https://pbs.twimg.com/profile_images/1674432311520882689/hFyDAZtL_400x400.jpg";
      default:
        return "https://unavatar.io/twitter/farolinveste";
    }
  };

  // Função para gerar cores baseadas no autor
  const getAuthorColor = (author?: string): string => {
    switch (author) {
      case "Donald Trump":
        return "border-red-400 hover:border-red-500";
      case "Luiz Inácio Lula da Silva":
        return "border-red-500 hover:border-red-600";
      case "Elon Musk":
        return "border-blue-400 hover:border-blue-500";
      case "Fernando Haddad":
        return "border-green-500 hover:border-green-600";
      default:
        return "border-blue-400 hover:border-blue-500";
    }
  };

  return (
    <div className="space-y-4 max-h-[700px] overflow-y-auto p-1">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Badge className="mr-2 bg-blue-500 hover:bg-blue-600">X</Badge>
        Últimas atualizações dos líderes
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tweets.map((tweet, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${getAuthorColor(tweet.author)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-blue-100">
                    <AvatarImage src={getProfilePicture(tweet.author)} />
                    <AvatarFallback>{tweet.author?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-base">{tweet.author}</p>
                        <p className="text-sm text-muted-foreground">{getTwitterUsername(tweet.author)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(tweet.publication_date)}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-base whitespace-pre-line">{tweet.content}</p>
                      
                      {tweet.image_url && !tweet.image_url.includes('unavatar.io') && (
                        <div className="mt-4 rounded-lg overflow-hidden">
                          <img 
                            src={tweet.image_url} 
                            alt="Tweet media" 
                            className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            onError={(e) => {
                              console.error("Erro ao carregar imagem:", tweet.image_url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between mt-1 text-muted-foreground">
                      <button className="text-sm flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle size={16} />
                        <span className="hidden sm:inline">Comentar</span>
                      </button>
                      <button className="text-sm flex items-center gap-1 hover:text-green-500 transition-colors">
                        <Repeat size={16} />
                        <span className="hidden sm:inline">Repostar</span>
                      </button>
                      <button className="text-sm flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart size={16} />
                        <span className="hidden sm:inline">Curtir</span>
                      </button>
                      <button className="text-sm flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <Share2 size={16} />
                        <span className="hidden sm:inline">Compartilhar</span>
                      </button>
                      {tweet.source_url && (
                        <a
                          href={tweet.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          <ExternalLink size={16} />
                          <span className="hidden sm:inline">Ver no X</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
