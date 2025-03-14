
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { 
  BLOOMBERG_RSS_FEED, 
  INFOMONEY_RSS_FEED, 
  VALOR_ECONOMICO_RSS_FEED, 
  CNN_MONEY_RSS_FEED, 
  FORBES_RSS_FEED,
  NewsItem
} from "./config.ts";

export async function fetchBloombergNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg news from:", BLOOMBERG_RSS_FEED);
    const res = await fetch(BLOOMBERG_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg news items`);

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
    console.log("Fetching InfoMoney news from:", INFOMONEY_RSS_FEED);
    const res = await fetch(INFOMONEY_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} InfoMoney news items`);

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
    console.log("Fetching Valor Econômico news from:", VALOR_ECONOMICO_RSS_FEED);
    const res = await fetch(VALOR_ECONOMICO_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} Valor Econômico news items`);

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
    console.log("Fetching CNN Money news from:", CNN_MONEY_RSS_FEED);
    const res = await fetch(CNN_MONEY_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} CNN Money news items`);

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
    console.log("Fetching Forbes news from:", FORBES_RSS_FEED);
    const res = await fetch(FORBES_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} Forbes news items`);

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
