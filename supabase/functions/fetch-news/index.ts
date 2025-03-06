import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Interfaces
interface NewsItem {
  id?: string;
  title: string;
  subtitle?: string;
  content: string;
  publication_date?: string;
  author?: string;
  category?: string;
  image_url?: string;
  source: string;
  source_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Function to clean CDATA tags and HTML entities
function cleanContent(content: string): string {
  // Remove CDATA tags
  const withoutCDATA = content.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
  
  // Remove HTML tags but keep the content
  const withoutHTML = withoutCDATA.replace(/<[^>]*>?/gm, '');
  
  // Decode HTML entities
  return withoutHTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Função para extrair imagem do conteúdo HTML
function extractImageFromContent(content: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  return match ? match[1] : null;
}

// Função para buscar notícias do RSS da Infomoney
async function fetchInfoMoneyRSS(): Promise<NewsItem[]> {
  try {
    const response = await fetch('https://www.infomoney.com.br/feed/');
    
    if (!response.ok) {
      console.error(`Erro ao buscar RSS da InfoMoney: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    // Parsing manual simplificado para RSS
    const news = parseRSS(xml, {
      source: 'InfoMoney',
      defaultCategory: 'Mercado de Ações'
    });
    
    return news;
  } catch (error) {
    console.error('Erro ao processar RSS da InfoMoney:', error);
    return [];
  }
}

// Função para buscar notícias do RSS do Valor Econômico
async function fetchValorEconomicoRSS(): Promise<NewsItem[]> {
  try {
    const response = await fetch('https://valor.globo.com/rss/valor');
    
    if (!response.ok) {
      console.error(`Erro ao buscar RSS do Valor Econômico: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    // Parsing manual simplificado para RSS
    const news = parseRSS(xml, {
      source: 'Valor Econômico',
      defaultCategory: 'Economia'
    });
    
    return news;
  } catch (error) {
    console.error('Erro ao processar RSS do Valor Econômico:', error);
    return [];
  }
}

// Função simplificada para parse de RSS
function parseRSS(xml: string, options: { source: string, defaultCategory: string }): NewsItem[] {
  try {
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const linkRegex = /<link>([\s\S]*?)<\/link>/;
    const descriptionRegex = /<description>([\s\S]*?)<\/description>/;
    const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
    const creatorRegex = /<dc:creator>([\s\S]*?)<\/dc:creator>/;
    const categoryRegex = /<category>([\s\S]*?)<\/category>/;
    
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];
      
      // Extrair informações e limpar CDATA tags
      let title = (itemContent.match(titleRegex) || [])[1] || 'Sem título';
      let link = (itemContent.match(linkRegex) || [])[1] || '';
      let description = (itemContent.match(descriptionRegex) || [])[1] || 'Sem conteúdo';
      const pubDate = (itemContent.match(pubDateRegex) || [])[1] || new Date().toISOString();
      let creator = (itemContent.match(creatorRegex) || [])[1] || options.source;
      let category = (itemContent.match(categoryRegex) || [])[1] || options.defaultCategory;
      
      // Clean all content from CDATA and HTML tags
      title = cleanContent(title);
      link = cleanContent(link);
      description = cleanContent(description);
      creator = cleanContent(creator);
      category = cleanContent(category);
      
      // Extrair imagem do conteúdo
      const imageUrl = extractImageFromContent(description);
      
      items.push({
        title: title,
        subtitle: title,
        content: description,
        publication_date: new Date(pubDate).toISOString(),
        author: creator,
        category: category,
        image_url: imageUrl,
        source: options.source,
        source_url: link
      });
    }
    
    return items;
  } catch (error) {
    console.error('Erro ao parsear RSS:', error);
    return [];
  }
}

// Função para buscar notícias da API Alpha Vantage (notícias financeiras)
async function fetchAlphaVantageNews(): Promise<NewsItem[]> {
  try {
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      console.error('API Key não configurada para Alpha Vantage');
      return [];
    }
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Erro na API Alpha Vantage: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data || !data.feed) {
      console.error('Formato de resposta inválido da Alpha Vantage');
      return [];
    }
    
    return data.feed.map((item: any) => ({
      title: item.title || 'Sem título',
      subtitle: item.summary,
      content: item.summary || 'Sem conteúdo disponível',
      publication_date: item.time_published || new Date().toISOString(),
      author: item.authors?.[0] || 'Alpha Vantage',
      category: item.category || 'Mercado de Ações',
      image_url: item.banner_image || null,
      source: item.source || 'Alpha Vantage',
      source_url: item.url,
    }));
  } catch (error) {
    console.error('Erro ao buscar notícias da Alpha Vantage:', error);
    return [];
  }
}

// Backup de notícias para exibição quando houver problemas com as APIs externas
function getBackupNews(): NewsItem[] {
  const currentDate = new Date().toISOString();
  return [
    {
      title: "Mercados globais reagem à decisão do FED sobre taxas de juros",
      subtitle: "Reserva Federal mantém taxas inalteradas, mas sinaliza possíveis cortes em 2024",
      content: "Os mercados financeiros globais reagiram positivamente à decisão do Federal Reserve de manter as taxas de juros inalteradas na reunião desta quarta-feira. O presidente do Fed, Jerome Powell, indicou que o banco central americano pode começar a reduzir as taxas em 2024, dependendo dos dados de inflação e emprego nos próximos meses.",
      publication_date: currentDate,
      author: "Bloomberg News",
      category: "Economia",
      image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
      source: "Bloomberg",
      source_url: "https://www.bloomberg.com/news/articles/2023-12-13/fed-keeps-rates-steady-signals-three-2024-cuts-as-inflation-eases",
    },
    {
      title: "Petrobras anuncia novo plano de investimentos para 2024-2028",
      subtitle: "Estatal prevê investir US$ 102 bilhões em cinco anos, com foco em exploração e produção",
      content: "A Petrobras divulgou nesta quinta-feira seu plano estratégico para o período de 2024 a 2028, com investimentos previstos de US$ 102 bilhões. Segundo a companhia, 72% desse valor será destinado à área de exploração e produção, principalmente em projetos do pré-sal. A empresa também prevê aportes significativos em transição energética, com US$ 16 bilhões para iniciativas de descarbonização e energias renováveis.",
      publication_date: currentDate,
      author: "Reuters",
      category: "Negócios",
      image_url: "https://images.unsplash.com/photo-1531403939386-c08a239fbc68?q=80&w=1970&auto=format&fit=crop",
      source: "Reuters",
      source_url: "https://www.reuters.com/business/energy/petrobras-unveils-102-billion-capex-plan-2024-2028-2023-11-23/",
    },
    {
      title: "IPCA de novembro fica abaixo das expectativas e alivia pressão sobre Banco Central",
      subtitle: "Inflação oficial do país avançou 0,28% no mês, abaixo da projeção de 0,30% do mercado",
      content: "O IPCA (Índice Nacional de Preços ao Consumidor Amplo) de novembro registrou alta de 0,28%, ficando abaixo das expectativas do mercado, que previam avanço de 0,30%. No acumulado de 12 meses, a inflação está em 4,35%, dentro do teto da meta estabelecida pelo Conselho Monetário Nacional para 2023. O resultado alivia a pressão sobre o Banco Central e fortalece a expectativa de que a taxa Selic seja mantida em 11,25% na última reunião do Copom deste ano.",
      publication_date: currentDate,
      author: "Valor Econômico",
      category: "Economia",
      image_url: "https://images.unsplash.com/photo-1616803140344-7862904e6f2b?q=80&w=2070&auto=format&fit=crop",
      source: "Valor Econômico",
      source_url: "https://valor.globo.com/brasil/noticia/2023/12/12/ipca-de-novembro-fica-em-028percent-abaixo-das-expectativas.ghtml",
    },
    {
      title: "Bitcoin ultrapassa US$ 44 mil e renova máxima do ano",
      subtitle: "Criptomoeda está em alta com expectativa de aprovação de ETFs à vista nos EUA",
      content: "O Bitcoin ultrapassou a marca de US$ 44 mil nesta terça-feira, atingindo sua maior cotação em 2023. A criptomoeda acumula valorização de mais de 160% no ano, impulsionada principalmente pela expectativa de que a Securities and Exchange Commission (SEC) dos Estados Unidos aprove em breve os primeiros ETFs (fundos negociados em bolsa) de Bitcoin à vista no país.",
      publication_date: currentDate,
      author: "CoinDesk",
      category: "Criptomoedas",
      image_url: "https://images.unsplash.com/photo-1625806335347-4f5f7e8d4a8e?q=80&w=2070&auto=format&fit=crop",
      source: "CoinDesk",
      source_url: "https://www.coindesk.com/markets/2023/12/05/bitcoin-tops-44k-for-first-time-since-april-2022/",
    },
    {
      title: "Ibovespa encerra em alta e supera os 130 mil pontos",
      subtitle: "Índice foi impulsionado por ações de bancos e commodities",
      content: "O Ibovespa, principal índice da bolsa brasileira, fechou em alta de 1,2% nesta quarta-feira, aos 130.842 pontos, maior patamar desde julho. O movimento foi impulsionado pelo bom desempenho das ações de bancos e empresas ligadas a commodities, como Vale e Petrobras. Investidores reagiram positivamente aos sinais do Federal Reserve sobre possíveis cortes de juros no próximo ano e a dados econômicos positivos divulgados no Brasil.",
      publication_date: currentDate,
      author: "InfoMoney",
      category: "Mercado de Ações",
      image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
      source: "InfoMoney",
      source_url: "https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-sobe-mais-de-1-e-fecha-acima-dos-130-mil-pontos/",
    }
  ];
}

// Função principal para buscar notícias de todas as fontes
async function fetchAllExternalNews(category?: string): Promise<NewsItem[]> {
  try {
    // Buscar notícias de todas as fontes em paralelo
    const [infoMoneyNews, valorEconomicoNews, alphaVantageNews] = await Promise.all([
      fetchInfoMoneyRSS(),
      fetchValorEconomicoRSS(),
      fetchAlphaVantageNews()
    ]);
    
    // Combinar todas as notícias
    let allNews = [...infoMoneyNews, ...valorEconomicoNews, ...alphaVantageNews];
    
    // Se não houver notícias (por problemas nas APIs), usar backup
    if (allNews.length === 0) {
      console.log('Usando notícias de backup devido a falhas nas APIs');
      allNews = getBackupNews();
    }
    
    // Filtrar por categoria, se especificada
    if (category) {
      allNews = allNews.filter(news => 
        news.category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Ordenar por data (mais recentes primeiro)
    allNews.sort((a, b) => {
      const dateA = new Date(a.publication_date || '').getTime();
      const dateB = new Date(b.publication_date || '').getTime();
      return dateB - dateA;
    });
    
    return allNews;
  } catch (error) {
    console.error('Erro ao buscar notícias externas:', error);
    // Em caso de erro, retornar backup
    return getBackupNews();
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Apenas permitir GET e POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      throw new Error(`Método ${req.method} não permitido`);
    }

    // Criar cliente Supabase para ler os dados
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter categoria do body se for POST
    let category: string | undefined;
    if (req.method === 'POST') {
      const body = await req.json();
      category = body.category;
    }

    // Buscar notícias externas
    const externalNews = await fetchAllExternalNews(category);

    // Buscar notícias manuais do banco de dados
    const { data: manualNews, error } = await supabase
      .from('market_news')
      .select('*')
      .order('publication_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Formatar notícias manuais para ter o mesmo formato das externas
    const formattedManualNews = manualNews ? manualNews.map(item => ({
      ...item,
      source: 'manual'
    })) : [];

    // Combinar e ordenar por data de publicação (mais recentes primeiro)
    const allNews = [...formattedManualNews, ...externalNews].sort((a, b) => {
      return new Date(b.publication_date || b.created_at || '').getTime() - 
             new Date(a.publication_date || a.created_at || '').getTime();
    });

    // Limitar a 100 resultados para não sobrecarregar
    const limitedNews = allNews.slice(0, 100);

    // Retornar todas as notícias
    return new Response(
      JSON.stringify(limitedNews),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Erro na função fetch-news:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
