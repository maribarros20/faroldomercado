import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

// Configurações
const TWITTER_ACCOUNTS = [
  { username: 'realDonaldTrump', name: 'Donald Trump' },
  { username: 'LulaOficial', name: 'Luiz Inácio Lula da Silva' },
  { username: 'elonmusk', name: 'Elon Musk' },
  { username: 'FernandoHaddad', name: 'Fernando Haddad' }
];

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN') || '1900002471734349824maridofarol';

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

// Função para limpar conteúdo HTML
function cleanContent(content: string): string {
  if (!content) return '';
  
  // Remove HTML tags but keep the content
  const withoutHTML = content.replace(/<[^>]*>?/gm, '');
  
  // Decode HTML entities
  return withoutHTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Função para extrair imagens de tweets
function extractMediaFromTweet(tweet: any): string | null {
  if (tweet.includes?.media && tweet.includes.media.length > 0) {
    return tweet.includes.media[0].url || tweet.includes.media[0].preview_image_url;
  }
  return null;
}

// Função para buscar tweets
async function fetchTwitterPosts(): Promise<NewsItem[]> {
  if (!twitterBearerToken) {
    console.log('Twitter Bearer Token não configurado');
    return [];
  }

  try {
    const newsItems: NewsItem[] = [];
    
    for (const account of TWITTER_ACCOUNTS) {
      try {
        console.log(`Buscando tweets de ${account.name} (@${account.username})`);
        
        // Busca o ID do usuário primeiro
        const userResponse = await fetch(
          `https://api.twitter.com/2/users/by/username/${account.username}`,
          {
            headers: {
              Authorization: `Bearer ${twitterBearerToken}`,
            },
          }
        );
        
        if (!userResponse.ok) {
          console.error(`Erro ao buscar ID do usuário ${account.username}: ${userResponse.statusText}`);
          continue;
        }
        
        const userData = await userResponse.json();
        const userId = userData.data?.id;
        
        if (!userId) {
          console.error(`Não foi possível encontrar ID para o usuário ${account.username}`);
          continue;
        }
        
        // Agora busca os tweets recentes
        const tweetsResponse = await fetch(
          `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&expansions=attachments.media_keys&tweet.fields=created_at,text,entities,public_metrics&media.fields=url,preview_image_url,width,height`,
          {
            headers: {
              Authorization: `Bearer ${twitterBearerToken}`,
            },
          }
        );
        
        if (!tweetsResponse.ok) {
          console.error(`Erro ao buscar tweets de ${account.username}: ${tweetsResponse.statusText}`);
          continue;
        }
        
        const tweetsData = await tweetsResponse.json();
        
        if (!tweetsData.data || tweetsData.data.length === 0) {
          console.log(`Nenhum tweet encontrado para ${account.username}`);
          continue;
        }
        
        // Processa os tweets
        for (const tweet of tweetsData.data) {
          const tweetUrl = `https://twitter.com/${account.username}/status/${tweet.id}`;
          const imageUrl = extractMediaFromTweet(tweetsData) || `https://unavatar.io/twitter/${account.username}`;
          
          // Determinar categorias com base no conteúdo
          let category = 'Mercado de Ações';
          const lowerContent = tweet.text.toLowerCase();
          
          if (lowerContent.includes('economia') || lowerContent.includes('pib') || lowerContent.includes('inflação')) {
            category = 'Economia';
          } else if (lowerContent.includes('bitcoin') || lowerContent.includes('crypto') || lowerContent.includes('ethereum')) {
            category = 'Criptomoedas';
          } else if (lowerContent.includes('petróleo') || lowerContent.includes('ouro') || lowerContent.includes('commodity')) {
            category = 'Commodities';
          }
          
          newsItems.push({
            title: `${account.name} no Twitter`,
            content: tweet.text,
            publication_date: tweet.created_at,
            author: account.name,
            category: category,
            image_url: imageUrl,
            source: 'Twitter',
            source_url: tweetUrl,
          });
        }
        
        console.log(`Obtidos ${tweetsData.data.length} tweets de ${account.name}`);
      } catch (error) {
        console.error(`Erro ao processar tweets de ${account.username}:`, error);
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('Erro ao buscar tweets:', error);
    return [];
  }
}

// Função para buscar notícias da Reuters
async function fetchReutersNews(): Promise<NewsItem[]> {
  try {
    console.log('Buscando notícias da Reuters');
    
    // Simulação de notícias da Reuters (implementação real requer web scraping)
    const newsItems: NewsItem[] = [
      {
        title: 'Mercados globais reagem à decisão do Fed sobre taxas de juros',
        subtitle: 'Investidores ponderam próximos passos após manutenção de taxas',
        content: 'Os mercados financeiros globais reagiram positivamente à decisão do Federal Reserve de manter as taxas de juros inalteradas na reunião desta semana. Analistas projetam possíveis cortes nos próximos meses, dependendo dos dados de inflação.',
        publication_date: new Date().toISOString(),
        author: 'Reuters Markets',
        category: 'Economia',
        image_url: 'https://s3.ap-southeast-1.amazonaws.com/thomson-media-resources/images/logos/tr-new.svg',
        source: 'Reuters',
        source_url: 'https://www.reuters.com/finance/markets',
      },
      {
        title: 'Petróleo sobe após dados de estoques nos EUA',
        subtitle: 'Preços do barril atingem máxima de duas semanas',
        content: 'Os preços do petróleo subiram mais de 2% nesta quarta-feira, após dados mostrarem uma queda inesperada nos estoques de petróleo bruto dos Estados Unidos, indicando uma demanda mais forte do que o esperado no maior consumidor mundial.',
        publication_date: new Date().toISOString(),
        author: 'Reuters Energy',
        category: 'Commodities',
        image_url: 'https://s3.ap-southeast-1.amazonaws.com/thomson-media-resources/images/logos/tr-new.svg',
        source: 'Reuters',
        source_url: 'https://www.reuters.com/finance/commodities',
      }
    ];
    
    return newsItems;
  } catch (error) {
    console.error('Erro ao buscar notícias da Reuters:', error);
    return [];
  }
}

// Função para buscar notícias da Forbes
async function fetchForbesNews(): Promise<NewsItem[]> {
  try {
    console.log('Buscando notícias da Forbes');
    
    // Simulação de notícias da Forbes (implementação real requer web scraping)
    const newsItems: NewsItem[] = [
      {
        title: 'As 10 ações mais promissoras para o segundo semestre',
        subtitle: 'Especialistas apontam oportunidades no mercado de tecnologia e energia renovável',
        content: 'A Forbes consultou diversos especialistas de Wall Street para identificar as ações com maior potencial de valorização para o restante do ano. Empresas de tecnologia e do setor de energia renovável dominam as recomendações.',
        publication_date: new Date().toISOString(),
        author: 'Forbes Money',
        category: 'Mercado de Ações',
        image_url: 'https://cdn.worldvectorlogo.com/logos/forbes-1.svg',
        source: 'Forbes',
        source_url: 'https://www.forbes.com/money',
      },
      {
        title: 'Como diversificar investimentos em um cenário de juros em queda',
        subtitle: 'Guia completo para proteger seu patrimônio',
        content: 'Com a expectativa de redução nas taxas de juros, investidores precisam repensar suas estratégias. A Forbes apresenta um guia completo com alternativas para diversificar investimentos e manter a rentabilidade da carteira.',
        publication_date: new Date().toISOString(),
        author: 'Forbes Advisor',
        category: 'Investimentos',
        image_url: 'https://cdn.worldvectorlogo.com/logos/forbes-1.svg',
        source: 'Forbes',
        source_url: 'https://www.forbes.com/money',
      }
    ];
    
    return newsItems;
  } catch (error) {
    console.error('Erro ao buscar notícias da Forbes:', error);
    return [];
  }
}

// Combinar todas as fontes de notícias
async function fetchAllSocialAndNews(): Promise<NewsItem[]> {
  try {
    // Buscar todas as fontes em paralelo para melhor performance
    const [twitterPosts, reutersNews, forbesNews] = await Promise.all([
      fetchTwitterPosts(),
      fetchReutersNews(),
      fetchForbesNews()
    ]);
    
    // Combinar todas as notícias
    const allNews = [...twitterPosts, ...reutersNews, ...forbesNews];
    
    // Ordenar por data (mais recentes primeiro)
    allNews.sort((a, b) => {
      const dateA = new Date(a.publication_date || '').getTime();
      const dateB = new Date(b.publication_date || '').getTime();
      return dateB - dateA;
    });
    
    console.log(`Total de notícias obtidas: ${allNews.length}`);
    return allNews;
  } catch (error) {
    console.error('Erro ao buscar notícias e redes sociais:', error);
    return [];
  }
}

// Endpoint para buscar notícias de redes sociais e fontes adicionais
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase para ler os dados
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar notícias de redes sociais e fontes adicionais
    const socialAndNews = await fetchAllSocialAndNews();

    // Retornar as notícias
    return new Response(
      JSON.stringify(socialAndNews),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Erro na função fetch-twitter-news:', error);
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
