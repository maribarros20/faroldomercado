
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Interface para as notícias
interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Função para buscar as notícias (simulada)
  const fetchNews = async () => {
    setIsLoading(true);
    
    try {
      // Simulação de chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados de notícias
      const mockNews: NewsItem[] = [
        {
          title: "Ibovespa fecha em alta de 1,2% com impulso das commodities",
          description: "Índice atingiu 130.156 pontos, maior patamar em três meses, impulsionado por ações de mineradoras e petroleiras",
          url: "#",
          source: "InfoMoney",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop"
        },
        {
          title: "Banco Central mantém taxa Selic em 10,5% ao ano",
          description: "Decisão unânime do Copom surpreendeu analistas que esperavam corte de 0,25 ponto percentual",
          url: "#",
          source: "Valor Econômico",
          publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: "Dólar cai para R$ 5,10 após dados de inflação nos EUA",
          description: "Moeda americana recuou 0,8% com sinais de desaceleração da inflação americana e possível corte de juros pelo Fed",
          url: "#",
          source: "Reuters Brasil",
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          imageUrl: "https://images.unsplash.com/photo-1591033594798-33227a05780d?q=80&w=2069&auto=format&fit=crop"
        },
        {
          title: "Petrobras anuncia novo plano de investimentos de R$ 380 bilhões",
          description: "Estatal pretende ampliar produção no pré-sal e investir em energia renovável nos próximos cinco anos",
          url: "#",
          source: "Agência Brasil",
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: "PIB brasileiro cresce 0,7% no segundo trimestre, acima das expectativas",
          description: "Resultado supera previsão de 0,5% e foi impulsionado pelo setor de serviços e consumo das famílias",
          url: "#",
          source: "G1 Economia",
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          imageUrl: "https://images.unsplash.com/photo-1616803140344-7862904e6f2b?q=80&w=2070&auto=format&fit=crop"
        },
      ];
      
      setNews(mockNews);
      toast({
        title: "Notícias atualizadas",
        description: "As últimas notícias do mercado foram carregadas",
      });
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar notícias ao montar o componente
  useEffect(() => {
    fetchNews();
    
    // Configurar atualização automática a cada 15 minutos
    const interval = setInterval(() => {
      fetchNews();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar notícias baseado no termo de busca
  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatar data relativa
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notícias do Mercado</h2>
          <p className="text-muted-foreground">
            Acompanhe as últimas atualizações do mercado financeiro
          </p>
        </div>
        <Button 
          onClick={fetchNews} 
          variant="outline" 
          disabled={isLoading}
          className="flex items-center gap-2 sm:self-start"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Atualizando...' : 'Atualizar Notícias'}
        </Button>
      </div>
      
      <Input
        placeholder="Pesquisar notícias..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />
      
      <div className="grid gap-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-primary">{item.source}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{getRelativeTime(item.publishedAt)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                    
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary font-semibold"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      Ler mais
                    </Button>
                  </div>
                  
                  {item.imageUrl && (
                    <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Carregando notícias...</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhuma notícia encontrada com o termo "{searchTerm}"</p>
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        As notícias são atualizadas automaticamente a cada 15 minutos
      </div>
    </div>
  );
};

export default MarketNews;
