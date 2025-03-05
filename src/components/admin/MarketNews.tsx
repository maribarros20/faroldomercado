
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Refresh, ExternalLink, TrendingUp, TrendingDown, BarChart2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Interface para os artigos de notícias
interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  sentiment?: "positive" | "negative" | "neutral";
}

// Dados de exemplo para testes
const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Ibovespa sobe e supera os 129 mil pontos com impulso de commodities",
    description: "O principal índice da bolsa brasileira teve uma alta de 0,75% nesta segunda-feira, impulsionado principalmente pelo setor de commodities, com destaque para as ações da Petrobras e da Vale.",
    url: "https://valor.globo.com/financas/noticia/2023/05/15/ibovespa-fecha-em-alta.ghtml",
    source: "Valor Econômico",
    category: "indices",
    publishedAt: "2023-05-15T17:30:00Z",
    sentiment: "positive"
  },
  {
    id: "2",
    title: "Dólar cai para R$ 4,95 com entrada de capital estrangeiro",
    description: "A moeda americana recuou 0,6% frente ao real nesta sessão, encerrando o dia cotada a R$ 4,95 para venda. A queda foi impulsionada pelo aumento do fluxo de capital estrangeiro no país.",
    url: "https://www.infomoney.com.br/mercados/dolar-cai/",
    source: "InfoMoney",
    category: "cambio",
    publishedAt: "2023-05-15T18:45:00Z",
    sentiment: "positive"
  },
  {
    id: "3",
    title: "Banco Central deve manter taxa de juros em 10,5%, preveem economistas",
    description: "Analistas consultados pelo Banco Central no Boletim Focus desta semana mantiveram a expectativa de que a taxa Selic permaneça em 10,5% na próxima reunião do Comitê de Política Monetária.",
    url: "https://www.cnnbrasil.com.br/business/banco-central-deve-manter-taxa-selic/",
    source: "CNN Brasil",
    category: "juros",
    publishedAt: "2023-05-14T14:20:00Z",
    sentiment: "neutral"
  },
  {
    id: "4",
    title: "Petrobras anuncia redução no preço do diesel para distribuidoras",
    description: "A Petrobras anunciou hoje uma redução de R$ 0,13 por litro no preço do diesel vendido às distribuidoras. A medida entra em vigor a partir de amanhã e representa uma queda de 4,2% em relação ao valor atual.",
    url: "https://www.petrobras.com.br/noticias/petrobras-reduz-preco-diesel/",
    source: "Petrobras",
    category: "empresas",
    publishedAt: "2023-05-15T15:00:00Z",
    sentiment: "positive"
  },
  {
    id: "5",
    title: "Inflação nos EUA desacelera e favorece ações em Wall Street",
    description: "O índice de preços ao consumidor nos Estados Unidos desacelerou para 3,8% em abril, abaixo das expectativas de mercado. O resultado animou investidores e impulsionou as ações em Wall Street.",
    url: "https://www.bloomberg.com.br/inflacao-eua-desacelera/",
    source: "Bloomberg",
    category: "internacional",
    publishedAt: "2023-05-15T14:10:00Z",
    sentiment: "positive"
  },
  {
    id: "6",
    title: "Bitcoin recua 2,5% após declarações do presidente do Fed",
    description: "A principal criptomoeda do mundo recuou 2,5% nas últimas 24 horas após declarações do presidente do Federal Reserve sobre possíveis regulamentações mais rígidas para o setor.",
    url: "https://www.coindesk.com/markets/2023/05/15/bitcoin-price-falls/",
    source: "CoinDesk",
    category: "cripto",
    publishedAt: "2023-05-15T16:30:00Z",
    sentiment: "negative"
  },
  {
    id: "7",
    title: "Governo anuncia pacote de incentivos fiscais para pequenas empresas",
    description: "O Ministério da Economia anunciou hoje um pacote de incentivos fiscais para pequenas empresas, que inclui redução de impostos e linhas de crédito especiais. A medida visa estimular a geração de empregos.",
    url: "https://agenciabrasil.ebc.com.br/economia/noticia/2023-05/governo-anuncia-pacote-incentivos/",
    source: "Agência Brasil",
    category: "economia",
    publishedAt: "2023-05-15T12:45:00Z",
    sentiment: "positive"
  },
  {
    id: "8",
    title: "Vale assina acordo para exploração de cobre no Peru",
    description: "A mineradora brasileira Vale assinou um acordo para exploração de uma mina de cobre no Peru, com investimento inicial estimado em US$ 500 milhões. O projeto deve iniciar operações em 2025.",
    url: "https://www.vale.com/noticias/vale-assina-acordo-cobre-peru/",
    source: "Vale",
    category: "empresas",
    publishedAt: "2023-05-15T11:20:00Z",
    sentiment: "positive"
  },
  {
    id: "9",
    title: "Confiança do consumidor cai pelo terceiro mês consecutivo",
    description: "O Índice de Confiança do Consumidor (ICC) caiu 1,5 ponto em maio, atingindo 86,5 pontos, segundo a Fundação Getulio Vargas. Esta é a terceira queda consecutiva do indicador.",
    url: "https://portal.fgv.br/noticias/confianca-consumidor-cai-terceiro-mes-consecutivo",
    source: "FGV",
    category: "economia",
    publishedAt: "2023-05-15T10:00:00Z",
    sentiment: "negative"
  },
  {
    id: "10",
    title: "Produção industrial cresce 0,8% em abril, aponta IBGE",
    description: "A produção industrial brasileira cresceu 0,8% em abril na comparação com março, segundo dados divulgados hoje pelo IBGE. O resultado ficou acima da expectativa do mercado, que era de alta de 0,5%.",
    url: "https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/producao-industrial-cresce/",
    source: "IBGE",
    category: "economia",
    publishedAt: "2023-05-15T09:30:00Z",
    sentiment: "positive"
  }
];

// Indicadores de mercado
const marketIndicators = [
  { name: "IBOVESPA", value: "129.856", change: "+0,75%", trend: "up" },
  { name: "Dólar", value: "R$ 4,95", change: "-0,60%", trend: "down" },
  { name: "Euro", value: "R$ 5,38", change: "-0,45%", trend: "down" },
  { name: "Bitcoin", value: "US$ 58.320", change: "-2,50%", trend: "down" },
  { name: "Selic", value: "10,5%", change: "0,00%", trend: "neutral" },
  { name: "S&P 500", value: "5.240", change: "+0,35%", trend: "up" }
];

const MarketNews = () => {
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simular a busca de notícias (em produção, seria uma chamada à API)
  const fetchNews = async () => {
    setIsLoading(true);
    
    try {
      // Em um ambiente real, seria uma chamada à API
      // const response = await fetch('https://api.example.com/news');
      // const data = await response.json();
      
      // Simulando uma resposta da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Na implementação real, você usaria os dados da API
      setNews(mockNews);
      setLastUpdated(new Date());
      
      toast({
        title: "Notícias atualizadas",
        description: "As notícias do mercado foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as notícias do mercado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar notícias a cada 5 minutos
  useEffect(() => {
    fetchNews();
    
    const interval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar notícias por categoria
  const filteredNews = activeCategory === "all" 
    ? news 
    : news.filter(article => article.category === activeCategory);

  // Formatar data de publicação
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notícias do Mercado Financeiro</h2>
          <p className="text-muted-foreground">
            Acompanhe as principais notícias do mercado financeiro em tempo real
          </p>
        </div>
        <Button 
          onClick={fetchNews} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Refresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
      </div>
      
      {/* Indicadores de mercado */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {marketIndicators.map((indicator, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2">
                  {indicator.name === "IBOVESPA" || indicator.name === "S&P 500" ? (
                    <BarChart2 className="h-6 w-6 text-primary" />
                  ) : indicator.name === "Dólar" || indicator.name === "Euro" ? (
                    <DollarSign className="h-6 w-6 text-primary" />
                  ) : indicator.name === "Bitcoin" ? (
                    <div className="h-6 w-6 flex items-center justify-center text-primary font-bold">₿</div>
                  ) : (
                    <div className="h-6 w-6 flex items-center justify-center text-primary font-bold">%</div>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{indicator.name}</h3>
                <p className="text-xl font-bold">{indicator.value}</p>
                <div className={`flex items-center gap-1 ${
                  indicator.trend === 'up' 
                    ? 'text-green-500' 
                    : indicator.trend === 'down' 
                      ? 'text-red-500' 
                      : 'text-gray-500'
                }`}>
                  {indicator.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : indicator.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : null}
                  <span>{indicator.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filtros de categorias */}
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="indices">Índices</TabsTrigger>
          <TabsTrigger value="cambio">Câmbio</TabsTrigger>
          <TabsTrigger value="juros">Juros</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="economia">Economia</TabsTrigger>
          <TabsTrigger value="internacional">Internacional</TabsTrigger>
          <TabsTrigger value="cripto">Cripto</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Lista de notícias */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">Nenhuma notícia encontrada nesta categoria.</p>
          </div>
        ) : (
          filteredNews.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        article.sentiment === "positive" 
                          ? "bg-green-500" 
                          : article.sentiment === "negative" 
                            ? "bg-red-500" 
                            : "bg-gray-500"
                      }>
                        {article.sentiment === "positive" 
                          ? "Positiva" 
                          : article.sentiment === "negative" 
                            ? "Negativa" 
                            : "Neutra"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{article.source}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold">{article.title}</h3>
                    <p className="text-muted-foreground">{article.description}</p>
                  </div>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketNews;
