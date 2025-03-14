
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
  if (!content) return undefined;
  
  // Try to match img tags
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  
  // If there's a match, return the extracted URL
  if (match && match[1]) {
    return match[1];
  }
  
  // Try to match media:content tags commonly used in RSS
  const mediaRegex = /<media:content[^>]+url="([^">]+)"/i;
  const mediaMatch = content.match(mediaRegex);
  
  return mediaMatch ? mediaMatch[1] : undefined;
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

// Helper function to extract content from CDATA sections
function extractFromCDATA(content: string): string {
  if (!content) return '';
  
  const cdataRegex = /\<\!\[CDATA\[(.*?)\]\]\>/s;
  const match = content.match(cdataRegex);
  
  return match ? match[1].trim() : content;
}

// Generic function to fetch RSS and handle errors with retries
async function fetchRSS(url: string, maxRetries = 3): Promise<string> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Fetching RSS from ${url} (attempt ${retries + 1})`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FarolInveste/1.0; +http://farolinveste.com)'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.text();
    } catch (error) {
      console.error(`Error fetching ${url}: ${error.message}`);
      retries++;
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retries * 1000));
    }
  }
  
  throw new Error(`Failed to fetch RSS after ${maxRetries} attempts`);
}

// Ensure all required fields are present in news items
function validateNewsItem(item: Partial<NewsItem>): NewsItem {
  return {
    title: item.title || 'Sem título',
    subtitle: item.subtitle || '',
    content: item.content || 'Sem conteúdo',
    publication_date: item.publication_date || new Date().toISOString(),
    author: item.author || '',
    category: item.category || 'Notícias',
    image_url: item.image_url || '',
    source: item.source || '',
    source_url: item.source_url || '',
  };
}

export async function fetchBloombergMarketsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Markets news from:", BLOOMBERG_MARKETS_RSS_FEED);
    const xml = await fetchRSS(BLOOMBERG_MARKETS_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Markets news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content or media or use default
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || '') || 
                      'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      
      const cleanContent = cleanHtmlContent(
        extractFromCDATA(entry.content?.value || entry.summary?.value || '')
      );
      
      return validateNewsItem({
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanContent,
        publication_date: entry.published || new Date().toISOString(),
        author: entry.author?.name || 'Bloomberg',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'Bloomberg Markets',
        source_url: entry.links?.[0]?.href || entry.id,
      });
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Markets:", error);
    return [];
  }
}

export async function fetchBloombergEconomicsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Economics news from:", BLOOMBERG_ECONOMICS_RSS_FEED);
    const xml = await fetchRSS(BLOOMBERG_ECONOMICS_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Economics news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content or media or use default
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || '') || 
                      'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      
      const cleanContent = cleanHtmlContent(
        extractFromCDATA(entry.content?.value || entry.summary?.value || '')
      );
      
      return validateNewsItem({
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanContent,
        publication_date: entry.published || new Date().toISOString(),
        author: entry.author?.name || 'Bloomberg',
        category: 'Economia',
        image_url: imageUrl,
        source: 'Bloomberg Economics',
        source_url: entry.links?.[0]?.href || entry.id,
      });
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Economics:", error);
    return [];
  }
}

export async function fetchCnnMoneyMarketsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching CNN Money Markets news from:", CNN_MONEY_MARKETS_RSS_FEED);
    const xml = await fetchRSS(CNN_MONEY_MARKETS_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} CNN Money Markets news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content or use default
      const imageUrl = entry.media?.[0]?.url || 
                      extractImageUrl(entry.content?.value || entry.summary?.value || '') || 
                      'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
      
      const cleanContent = cleanHtmlContent(
        extractFromCDATA(entry.content?.value || entry.summary?.value || '')
      );
      
      return validateNewsItem({
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanContent,
        publication_date: entry.published || new Date().toISOString(),
        author: entry.author?.name || 'CNN Money',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'CNN Money',
        source_url: entry.links?.[0]?.href || entry.id,
      });
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da CNN Money Markets:", error);
    return [];
  }
}

export async function fetchBloombergLineaNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Línea news from:", BLOOMBERG_LINEA_RSS_FEED);
    const xml = await fetchRSS(BLOOMBERG_LINEA_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Línea news items`);

    return feed.entries.map(entry => {
      // For Bloomberg Línea, we need to handle its unique structure
      let imageUrl = entry.media?.[0]?.url || '';
      
      // If no media URL is found, try to extract from content/description
      if (!imageUrl && (entry.content?.value || entry.summary?.value)) {
        imageUrl = extractImageUrl(entry.content?.value || entry.summary?.value || '');
      }
      
      // If still no image, use default
      if (!imageUrl) {
        imageUrl = 'https://www.bloomberglinea.com/resizer/hYQJgW06pnxUVAc_iEPKWBw-6tM=/1440x0/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/bloomberglinea/UOQI5QZ3SNGLTBV7RFAMLSB5YM.jpg';
      }
      
      const cleanContent = cleanHtmlContent(
        extractFromCDATA(entry.content?.value || entry.summary?.value || '')
      );
      
      return validateNewsItem({
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanContent,
        publication_date: entry.published || new Date().toISOString(),
        author: entry.author?.name || 'Bloomberg Línea',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'Bloomberg Línea',
        source_url: entry.links?.[0]?.href || entry.id,
      });
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Línea:", error);
    return [];
  }
}

export async function fetchValorEconomicoNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Valor Econômico news from:", VALOR_ECONOMICO_RSS_FEED);
    const xml = await fetchRSS(VALOR_ECONOMICO_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Valor Econômico news items`);

    return feed.entries.map(entry => {
      // Extract image URL from content or use default
      let imageUrl = entry.media?.[0]?.url || '';
      
      // If no media URL, try to extract from content
      if (!imageUrl && (entry.content?.value || entry.summary?.value)) {
        imageUrl = extractImageUrl(entry.content?.value || entry.summary?.value || '');
      }
      
      // If still no image URL, use default
      if (!imageUrl) {
        imageUrl = 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
      }
      
      const cleanContent = cleanHtmlContent(
        extractFromCDATA(entry.content?.value || entry.summary?.value || '')
      );
      
      return validateNewsItem({
        title: entry.title?.value || 'Sem título',
        subtitle: entry.subtitle?.value || '',
        content: cleanContent,
        publication_date: entry.published || new Date().toISOString(),
        author: entry.author?.name || 'Valor Econômico',
        category: 'Economia',
        image_url: imageUrl,
        source: 'Valor Econômico',
        source_url: entry.links?.[0]?.href || entry.id,
      });
    });
  } catch (error) {
    console.error("Erro ao buscar notícias do Valor Econômico:", error);
    return [];
  }
}
