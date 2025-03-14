
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { 
  BLOOMBERG_RSS_FEED, 
  INFOMONEY_RSS_FEED, 
  VALOR_ECONOMICO_RSS_FEED, 
  CNN_MONEY_RSS_FEED, 
  FORBES_RSS_FEED,
  ALPHAVANTAGE_API_KEY,
  NewsItem
} from "./config.ts";

export async function fetchBloombergNews(): Promise<NewsItem[]> {
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

export async function fetchInfoMoneyNews(): Promise<NewsItem[]> {
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

export async function fetchValorEconomicoNews(): Promise<NewsItem[]> {
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

export async function fetchCnnMoneyNews(): Promise<NewsItem[]> {
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

export async function fetchForbesNews(): Promise<NewsItem[]> {
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

export async function fetchAlphaVantageNews(category: string = 'economy'): Promise<NewsItem[]> {
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
