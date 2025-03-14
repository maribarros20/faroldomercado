
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { 
  BLOOMBERG_MARKETS_RSS_FEED,
  BLOOMBERG_ECONOMICS_RSS_FEED,
  CNN_MONEY_MARKETS_RSS_FEED,
  BLOOMBERG_LINEA_RSS_FEED,
  VALOR_ECONOMICO_RSS_FEED,
  NewsItem
} from "./config.ts";

// Helper function to extract image URL from content
function extractImageUrl(content: string): string | undefined {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  return match ? match[1] : undefined;
}

// Helper function to clean HTML content
function cleanHtmlContent(content: string): string {
  if (!content) return '';
  // Remove HTML tags
  return content.replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function fetchBloombergMarketsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Markets news from:", BLOOMBERG_MARKETS_RSS_FEED);
    const res = await fetch(BLOOMBERG_MARKETS_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Markets news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content if available
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || '') || 
                      'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanHtmlContent(entry.content?.value || entry.summary?.value || ''),
        publication_date: entry.published,
        author: entry.author?.name || 'Bloomberg',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'Bloomberg Markets',
        source_url: entry.id || entry.links?.[0]?.href,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Markets:", error);
    return [];
  }
}

export async function fetchBloombergEconomicsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Economics news from:", BLOOMBERG_ECONOMICS_RSS_FEED);
    const res = await fetch(BLOOMBERG_ECONOMICS_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Economics news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content if available
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || '') || 
                      'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanHtmlContent(entry.content?.value || entry.summary?.value || ''),
        publication_date: entry.published,
        author: entry.author?.name || 'Bloomberg',
        category: 'Economia',
        image_url: imageUrl,
        source: 'Bloomberg Economics',
        source_url: entry.id || entry.links?.[0]?.href,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Economics:", error);
    return [];
  }
}

export async function fetchCnnMoneyMarketsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching CNN Money Markets news from:", CNN_MONEY_MARKETS_RSS_FEED);
    const res = await fetch(CNN_MONEY_MARKETS_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} CNN Money Markets news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content if available
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || entry.summary?.value || '') || 
                      'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanHtmlContent(entry.content?.value || entry.summary?.value || ''),
        publication_date: entry.published,
        author: entry.author?.name || 'CNN Money',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'CNN Money',
        source_url: entry.id || entry.links?.[0]?.href,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da CNN Money Markets:", error);
    return [];
  }
}

export async function fetchBloombergLineaNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Línea news from:", BLOOMBERG_LINEA_RSS_FEED);
    const res = await fetch(BLOOMBERG_LINEA_RSS_FEED);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const xml = await res.text();
    const feed = await parseFeed(xml);
    
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Línea news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content if available
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || '') || 
                      'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanHtmlContent(entry.content?.value || entry.summary?.value || ''),
        publication_date: entry.published,
        author: entry.author?.name || 'Bloomberg Línea',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'Bloomberg Línea',
        source_url: entry.id || entry.links?.[0]?.href,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Línea:", error);
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

    return feed.entries.map(entry => {
      // Extract image URL from content if available
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || entry.summary?.value || '') || 
                      'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanHtmlContent(entry.content?.value || entry.summary?.value || ''),
        publication_date: entry.published,
        author: entry.author?.name || 'Valor Econômico',
        category: 'Economia',
        image_url: imageUrl,
        source: 'Valor Econômico',
        source_url: entry.id || entry.links?.[0]?.href,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias do Valor Econômico:", error);
    return [];
  }
}
