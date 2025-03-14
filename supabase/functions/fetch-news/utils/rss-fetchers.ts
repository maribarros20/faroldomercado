import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { 
  BLOOMBERG_MARKETS_RSS_FEED,
  BLOOMBERG_ECONOMICS_RSS_FEED,
  CNN_MONEY_MARKETS_RSS_FEED,
  CNN_MONEY_ECONOMY_RSS_FEED,
  BLOOMBERG_LINEA_RSS_FEED,
  VALOR_ECONOMICO_RSS_FEED,
  BBC_ECONOMIA_RSS_FEED,
  UOL_ECONOMIA_RSS_FEED,
  FOLHA_MERCADO_RSS_FEED,
  VALOR_INVESTING_RSS_FEED,
  NewsItem,
  decodeHtmlEntities,
  extractImage,
  getDefaultSourceImage
} from "./config.ts";

// Enhanced function to clean HTML content
function cleanHtmlContent(content: string): string {
  if (!content) return '';
  
  // First extract CDATA if present
  const cdataContent = extractFromCDATA(content);
  
  // Decode HTML entities
  let cleanText = decodeHtmlEntities(cdataContent);
  
  // Remove script and style tags with their content
  cleanText = cleanText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  cleanText = cleanText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  
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

// Function to get a clean date for news filtering
function getCleanDate(date: string | Date | undefined): Date {
  if (!date) return new Date();
  
  try {
    // Try to parse the date string
    const parsedDate = new Date(date);
    
    // Check if it's a valid date
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date: ${date}, using current date instead`);
      return new Date();
    }
    
    return parsedDate;
  } catch (e) {
    console.warn(`Error parsing date ${date}: ${e.message}`);
    return new Date();
  }
}

// Function to filter news by date (only keep current day and previous day)
function filterByFreshness(newsItems: NewsItem[]): NewsItem[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  console.log(`Filtering news for only today and yesterday (after ${yesterday.toISOString()})`);
  
  const filtered = newsItems.filter(item => {
    try {
      const itemDate = getCleanDate(item.publication_date);
      const isFresh = itemDate >= yesterday;
      
      if (!isFresh) {
        console.log(`Skipping old news from ${itemDate.toISOString()}: ${item.title}`);
      }
      
      return isFresh;
    } catch (e) {
      console.warn(`Error filtering news item: ${e.message}`);
      return false;
    }
  });
  
  console.log(`Kept ${filtered.length} fresh news items out of ${newsItems.length}`);
  return filtered;
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
        },
        timeout: 10000 // 10 seconds timeout
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
    imageUrl = extractImage(rawContent, source) || '';
  }
  
  // If still no image, check for thumbnail
  if (!imageUrl && entry.thumbnail) {
    imageUrl = entry.thumbnail.url || '';
  }
  
  // Try to find image in enclosures
  if (!imageUrl && entry.enclosures && entry.enclosures.length > 0) {
    for (const enclosure of entry.enclosures) {
      if (enclosure.type && enclosure.type.startsWith('image/') && enclosure.url) {
        imageUrl = enclosure.url;
        break;
      }
    }
  }
  
  // If still no valid image URL, use source default
  if (!imageUrl) {
    imageUrl = getDefaultSourceImage(source);
  }
  
  // Validate URL
  try {
    new URL(imageUrl);
  } catch (e) {
    console.warn(`Invalid image URL for article "${title}": ${imageUrl}`);
    imageUrl = getDefaultSourceImage(source);
  }
  
  // Ensure text fields are properly decoded
  const cleanTitle = decodeHtmlEntities(title);
  const cleanSubtitle = decodeHtmlEntities(subtitle);
  const cleanAuthor = decodeHtmlEntities(author);
  
  // Create and return the complete news item
  return {
    title: cleanTitle,
    subtitle: cleanSubtitle,
    content,
    publication_date: new Date(pubDate).toISOString(),
    author: cleanAuthor,
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
    
    const newsItems = feed.entries.map(entry => {
      return createNewsItem('Bloomberg Markets', entry, 'Mercado de Ações');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
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
    
    const newsItems = feed.entries.map(entry => {
      return createNewsItem('Bloomberg Economics', entry, 'Economia');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
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
    
    const newsItems = feed.entries.map(entry => {
      // CNN Money has a specific format, handled by our generic createNewsItem
      return createNewsItem('CNN Money', entry, 'Mercado de Ações');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias da CNN Money Markets:", error);
    return [];
  }
}

// CNN Money Economy RSS Feed
export async function fetchCnnMoneyEconomyNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching CNN Money Economy news from:", CNN_MONEY_ECONOMY_RSS_FEED);
    const xml = await fetchRSS(CNN_MONEY_ECONOMY_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} CNN Money Economy news items`);
    
    const newsItems = feed.entries.map(entry => {
      return createNewsItem('CNN Money', entry, 'Economia');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias da CNN Money Economy:", error);
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
    
    const newsItems = feed.entries.map(entry => {
      return createNewsItem('Bloomberg Línea', entry, 'Economia');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
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

    const newsItems = feed.entries.map(entry => {
      return createNewsItem('Valor Econômico', entry, 'Economia');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias do Valor Econômico:", error);
    return [];
  }
}

// BBC Economia RSS Feed - Fixed to handle their specific format
export async function fetchBBCEconomiaNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching BBC Economia news from:", BBC_ECONOMIA_RSS_FEED);
    const xml = await fetchRSS(BBC_ECONOMIA_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} BBC Economia news items`);

    const newsItems = feed.entries.map(entry => {
      // BBC feeds have specific format, but createNewsItem handles it well
      return createNewsItem('BBC Economia', entry, 'Economia');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias da BBC Economia:", error);
    return [];
  }
}

// UOL Economia RSS Feed - With enhanced encoding and image handling
export async function fetchUOLEconomiaNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching UOL Economia news from:", UOL_ECONOMIA_RSS_FEED);
    const xml = await fetchRSS(UOL_ECONOMIA_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} UOL Economia news items`);

    const newsItems = feed.entries.map(entry => {
      const item = createNewsItem('UOL Economia', entry, 'Economia');
      
      // Additional UOL-specific processing for character encoding
      item.title = decodeHtmlEntities(item.title);
      item.content = decodeHtmlEntities(item.content);
      if (item.subtitle) {
        item.subtitle = decodeHtmlEntities(item.subtitle);
      }
      
      return item;
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias da UOL Economia:", error);
    return [];
  }
}

// Folha Mercado RSS Feed
export async function fetchFolhaMercadoNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Folha Mercado news from:", FOLHA_MERCADO_RSS_FEED);
    const xml = await fetchRSS(FOLHA_MERCADO_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Folha Mercado news items`);

    const newsItems = feed.entries.map(entry => {
      return createNewsItem('Folha de São Paulo', entry, 'Mercado');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias da Folha Mercado:", error);
    return [];
  }
}

// Valor Investing RSS Feed
export async function fetchValorInvestingNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching Valor Investing news from:", VALOR_INVESTING_RSS_FEED);
    const xml = await fetchRSS(VALOR_INVESTING_RSS_FEED);
    
    const feed = await parseFeed(xml);
    console.log(`Successfully fetched ${feed.entries.length} Valor Investing news items`);

    const newsItems = feed.entries.map(entry => {
      return createNewsItem('Valor Investing', entry, 'Investimentos');
    });
    
    // Filter for freshness - only current day and one day prior
    return filterByFreshness(newsItems);
  } catch (error) {
    console.error("Erro ao buscar notícias do Valor Investing:", error);
    return [];
  }
}
