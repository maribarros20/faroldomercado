import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";

const BLOOMBERG_RSS_FEED = "https://www.bloomberg.com/feeds/markets/europe.xml";
const INFOMONEY_RSS_FEED = "https://www.infomoney.com.br/feed/";
const VALOR_ECONOMICO_RSS_FEED = "https://valor.globo.com/rss/";
const CNN_MONEY_RSS_FEED = "http://rss.cnn.com/rss/money_latest.rss";
const FORBES_RSS_FEED = "https://www.forbes.com/markets/feed/";
const ALPHAVANTAGE_API_KEY = Deno.env.get("ALPHAVANTAGE_API_KEY");

interface NewsItem {
  title: string;
  subtitle?: string;
  content: string;
  publication_date?: string;
  author?: string;
  category?: string;
  image_url?: string;
  source?: string;
  source_url?: string;
}

async function fetchBloombergNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(BLOOMBERG_RSS_FEED);
    const xml = await res.text();
    const feed = await parseFeed(xml);

    return feed.entries.map(entry => ({
      title: entry.title?.value || 'Sem título',
      content: entry.summary?.value || '',
      publication_date: entry.published,
      source_url: entry.id,
      source: 'Bloomberg',
      image_url: 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png',
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg:", error);
    return [];
  }
}

async function fetchInfoMoneyNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(INFOMONEY_RSS_FEED);
    const xml = await res.text();
    const feed = await parseFeed(xml);

    return feed.entries.map(entry => ({
      title: entry.title?.value || 'Sem título',
      content: entry.summary?.value || '',
      publication_date: entry.published,
      source_url: entry.id,
      source: 'InfoMoney',
      image_url: 'https://www.infomoney.com.br/wp-content/themes/infomoney/assets/img/logo-infomoney.png',
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias da InfoMoney:", error);
    return [];
  }
}

async function fetchValorEconomicoNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(VALOR_ECONOMICO_RSS_FEED);
    const xml = await res.text();
    const feed = await parseFeed(xml);

    return feed.entries.map(entry => ({
      title: entry.title?.value || 'Sem título',
      content: entry.summary?.value || '',
      publication_date: entry.published,
      source_url: entry.id,
      source: 'Valor Econômico',
      image_url: 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png',
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias do Valor Econômico:", error);
    return [];
  }
}

async function fetchCnnMoneyNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(CNN_MONEY_RSS_FEED);
    const xml = await res.text();
    const feed = await parseFeed(xml);

    return feed.entries.map(entry => ({
      title: entry.title?.value || 'Sem título',
      content: entry.summary?.value || '',
      publication_date: entry.published,
      source_url: entry.id,
      source: 'CNN Money',
      image_url: 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png',
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias da CNN Money:", error);
    return [];
  }
}

async function fetchForbesNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(FORBES_RSS_FEED);
    const xml = await res.text();
    const feed = await parseFeed(xml);

    return feed.entries.map(entry => ({
      title: entry.title?.value || 'Sem título',
      content: entry.summary?.value || '',
      publication_date: entry.published,
      source_url: entry.id,
      source: 'Forbes',
      image_url: 'https://cdn.worldvectorlogo.com/logos/forbes-1.svg',
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias da Forbes:", error);
    return [];
  }
}

async function fetchAlphaVantageNews(category: string = 'economy'): Promise<NewsItem[]> {
  if (!ALPHAVANTAGE_API_KEY) {
    console.warn("Chave da API Alpha Vantage não configurada.");
    return [];
  }

  const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=CRYPTO:BTC&topics=${category}&apikey=${ALPHAVANTAGE_API_KEY}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.feed) {
      return data.feed.map(item => ({
        title: item.title || 'Sem título',
        content: item.summary || '',
        publication_date: item.time_published,
        source_url: item.url,
        source: 'Alpha Vantage',
        image_url: item.banner_image || undefined,
      }));
    } else {
      console.warn("Nenhuma notícia encontrada na Alpha Vantage para a categoria:", category);
      return [];
    }
  } catch (error) {
    console.error("Erro ao buscar notícias da Alpha Vantage:", error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, excludeSources = [] } = await req.json();
    console.log(`Recebendo request para fetch-news com categoria: ${category}, excluindo fontes: ${excludeSources}`);

    let allData: NewsItem[] = [];

    // Busca notícias do Alpha Vantage (apenas se a categoria for especificada)
    if (category) {
      const alphaVantageNews = await fetchAlphaVantageNews(category);
      allData = [...allData, ...alphaVantageNews];
    } else {
      // Se nenhuma categoria for especificada, busca de todas as fontes RSS
      const [
        bloombergNews,
        infomoneyNews,
        valorEconomicoNews,
        cnnMoneyNews,
        forbesNews
      ] = await Promise.all([
        fetchBloombergNews(),
        fetchInfoMoneyNews(),
        fetchValorEconomicoNews(),
        fetchCnnMoneyNews(),
        fetchForbesNews()
      ]);

      allData = [
        ...allData,
        ...bloombergNews,
        ...infomoneyNews,
        ...valorEconomicoNews,
        ...cnnMoneyNews,
        ...forbesNews
      ];
    }

    // Add a filter to remove news from excluded sources
    const filteredData = allData.filter(item => {
      if (excludeSources.length === 0) return true;
      return !excludeSources.includes(item.source);
    });

    // Get timestamp for the response
    const timestamp = new Date().toISOString();
    
    // Return the filtered news
    return new Response(
      JSON.stringify(filteredData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error(`Error in fetch-news: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
