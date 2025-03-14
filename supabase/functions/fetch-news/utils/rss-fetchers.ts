
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { 
  BLOOMBERG_MARKETS_RSS_FEED,
  BLOOMBERG_ECONOMICS_RSS_FEED,
  CNN_MONEY_MARKETS_RSS_FEED,
  BLOOMBERG_LINEA_RSS_FEED,
  VALOR_ECONOMICO_RSS_FEED,
  NewsItem
} from "./config.ts";

// Enhanced function to extract image URLs from content
function extractImageUrl(content: string): string | undefined {
  if (!content) return undefined;
  
  // Check for media:content tags with url attribute
  const mediaRegex = /<media:content[^>]+url="([^">]+)"/i;
  const mediaMatch = content.match(mediaRegex);
  if (mediaMatch && mediaMatch[1]) {
    return mediaMatch[1];
  }

  // Check for enclosure tags with url attribute (common in RSS)
  const enclosureRegex = /<enclosure[^>]+url="([^">]+)"/i;
  const enclosureMatch = content.match(enclosureRegex);
  if (enclosureMatch && enclosureMatch[1]) {
    return enclosureMatch[1];
  }
  
  // Check for image tags
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const imgMatch = content.match(imgRegex);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  // Check for image link in content or description
  const linkImgRegex = /https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/i;
  const linkMatch = content.match(linkImgRegex);
  if (linkMatch) {
    return linkMatch[0];
  }
  
  return undefined;
}

// Better HTML content cleaning function that preserves more text
function cleanHtmlContent(content: string): string {
  if (!content) return '';
  
  // First extract CDATA if present
  const cdataContent = extractFromCDATA(content);
  
  // Replace common HTML entities
  let cleanText = cdataContent
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Remove HTML tags but preserve their content
  cleanText = cleanText.replace(/<[^>]*>/g, ' ');
  
  // Clean up excessive whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
}

// Helper function to extract content from CDATA sections
function extractFromCDATA(content: string): string {
  if (!content) return '';
  
  const cdataRegex = /\<\!\[CDATA\[(.*?)\]\]\>/s;
  const match = content.match(cdataRegex);
  
  return match ? match[1].trim() : content;
}

// Generic function to fetch RSS with comprehensive error handling and retries
async function fetchRSS(url: string, maxRetries = 3): Promise<string> {
  let retries = 0;
  let lastError: Error | null = null;
  
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
      
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response received');
      }
      
      return text;
    } catch (error) {
      lastError = error;
      console.error(`Error fetching ${url} (attempt ${retries + 1}): ${error.message}`);
      retries++;
      
      if (retries >= maxRetries) {
        console.error(`Failed to fetch RSS after ${maxRetries} attempts: ${error.message}`);
        break;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retries * 1000));
    }
  }
  
  throw lastError || new Error(`Failed to fetch RSS after ${maxRetries} attempts`);
}

// Function to create a valid news item with good defaults
function createNewsItem(
  source: string,
  entry: any,
  category: string
): NewsItem {
  // Extract the most important content
  const title = entry.title?.value || 'Sem título';
  
  // Get content from either content or summary
  let rawContent = '';
  if (entry.content?.value) {
    rawContent = entry.content.value;
  } else if (entry.summary?.value) {
    rawContent = entry.summary.value;
  } else if (entry.description?.value) {
    rawContent = entry.description.value;
  }
  
  // Clean the content
  const content = cleanHtmlContent(rawContent);
  
  // Get a subtitle if available, or create one from content
  let subtitle = entry.subtitle?.value || '';
  if (!subtitle && content) {
    // Use first sentence or portion of content as subtitle
    subtitle = content.split('.')[0] + '.';
  }
  
  // Extract publish date
  const pubDate = entry.published || entry.pubDate || entry.date || new Date().toISOString();
  
  // Get author info
  const author = entry.author?.name || source;
  
  // Get the source URL
  const sourceUrl = entry.links?.[0]?.href || entry.link || entry.url || '';
  
  // Extract image URL with fallbacks
  let imageUrl = '';
  
  // First try media object if available
  if (entry.media && entry.media.length > 0) {
    for (const media of entry.media) {
      if (media.url) {
        imageUrl = media.url;
        break;
      }
    }
  }
  
  // If no media, try extracting from content
  if (!imageUrl) {
    imageUrl = extractImageUrl(rawContent) || '';
  }
  
  // If still no image, check for thumbnail
  if (!imageUrl && entry.thumbnail) {
    imageUrl = entry.thumbnail.url || '';
  }
  
  // Create and return the complete news item
  return {
    title,
    subtitle,
    content,
    publication_date: new Date(pubDate).toISOString(),
    author,
    category,
    image_url: imageUrl,
    source,
    source_url: sourceUrl,
  };
}

// Bloomberg Markets RSS Feed
export async function fetchBloombergMarketsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Markets news from:", BLOOMBERG_MARKETS_RSS_FEED);
    const xml = await fetchRSS(BLOOMBERG_MARKETS_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Markets news items`);
    
    return feed.entries.map(entry => {
      return createNewsItem('Bloomberg Markets', entry, 'Mercado de Ações');
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Markets:", error);
    return [];
  }
}

// Bloomberg Economics RSS Feed
export async function fetchBloombergEconomicsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Economics news from:", BLOOMBERG_ECONOMICS_RSS_FEED);
    const xml = await fetchRSS(BLOOMBERG_ECONOMICS_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Economics news items`);
    
    return feed.entries.map(entry => {
      return createNewsItem('Bloomberg Economics', entry, 'Economia');
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Economics:", error);
    return [];
  }
}

// CNN Money Markets RSS Feed
export async function fetchCnnMoneyMarketsNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching CNN Money Markets news from:", CNN_MONEY_MARKETS_RSS_FEED);
    const xml = await fetchRSS(CNN_MONEY_MARKETS_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} CNN Money Markets news items`);
    
    return feed.entries.map(entry => {
      // CNN Money has a specific format
      const imageUrl = extractImageUrl(entry.description?.value || '') || 
                     'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: '',
        content: cleanHtmlContent(entry.description?.value || ''),
        publication_date: new Date(entry.published || new Date()).toISOString(),
        author: entry.author?.name || 'CNN Money',
        category: 'Mercado de Ações',
        image_url: imageUrl,
        source: 'CNN Money',
        source_url: entry.links?.[0]?.href || '',
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da CNN Money Markets:", error);
    return [];
  }
}

// Bloomberg Línea RSS Feed
export async function fetchBloombergLineaNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Bloomberg Línea news from:", BLOOMBERG_LINEA_RSS_FEED);
    const xml = await fetchRSS(BLOOMBERG_LINEA_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Bloomberg Línea news items`);
    
    return feed.entries.map(entry => {
      let imageUrl = '';
      
      // Bloomberg Línea often includes images in media:content
      if (entry.media && entry.media.length > 0) {
        for (const media of entry.media) {
          if (media.url) {
            imageUrl = media.url;
            break;
          }
        }
      }
      
      // If no media found, try to extract from content
      if (!imageUrl) {
        const contentStr = entry.content?.value || entry.description?.value || '';
        imageUrl = extractImageUrl(contentStr) || '';
      }
      
      // If still no image, use default
      if (!imageUrl) {
        imageUrl = 'https://www.bloomberglinea.com/resizer/hYQJgW06pnxUVAc_iEPKWBw-6tM=/1440x0/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/bloomberglinea/UOQI5QZ3SNGLTBV7RFAMLSB5YM.jpg';
      }
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: '',
        content: cleanHtmlContent(entry.content?.value || entry.description?.value || ''),
        publication_date: new Date(entry.published || new Date()).toISOString(),
        author: entry.author?.name || 'Bloomberg Línea',
        category: 'Economia',
        image_url: imageUrl,
        source: 'Bloomberg Línea',
        source_url: entry.links?.[0]?.href || '',
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias da Bloomberg Línea:", error);
    return [];
  }
}

// Valor Econômico RSS Feed
export async function fetchValorEconomicoNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Valor Econômico news from:", VALOR_ECONOMICO_RSS_FEED);
    const xml = await fetchRSS(VALOR_ECONOMICO_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Valor Econômico news items`);

    return feed.entries.map(entry => {
      // Try to find image in content
      let imageUrl = '';
      
      if (entry.media && entry.media.length > 0) {
        imageUrl = entry.media[0].url || '';
      }
      
      if (!imageUrl) {
        const contentStr = entry.content?.value || entry.description?.value || '';
        imageUrl = extractImageUrl(contentStr) || '';
      }
      
      // If no image found, use Valor's logo
      if (!imageUrl) {
        imageUrl = 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
      }
      
      return {
        title: entry.title?.value || 'Sem título',
        subtitle: '',
        content: cleanHtmlContent(entry.content?.value || entry.description?.value || ''),
        publication_date: new Date(entry.published || new Date()).toISOString(),
        author: entry.author?.name || 'Valor Econômico',
        category: 'Economia',
        image_url: imageUrl,
        source: 'Valor Econômico',
        source_url: entry.links?.[0]?.href || '',
      };
    });
  } catch (error) {
    console.error("Erro ao buscar notícias do Valor Econômico:", error);
    return [];
  }
}
