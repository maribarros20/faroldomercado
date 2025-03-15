
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

// Interfaces
export interface NewsItem {
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

// RSS feed URLs
export const NYTIMES_ECONOMY_RSS_FEED = "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml";
export const WSJOURNAL_ECONOMY_RSS_FEED = "https://feeds.a.dj.com/rss/RSSEconomics.xml";
export const BLOOMBERG_MARKETS_RSS_FEED = "https://feeds.bloomberg.com/markets/news.rss";
export const BLOOMBERG_ECONOMICS_RSS_FEED = "https://feeds.bloomberg.com/economics/news.rss";
export const CNN_MONEY_MARKETS_RSS_FEED = "http://rss.cnn.com/rss/money_markets.rss";
export const CNN_MONEY_ECONOMY_RSS_FEED = "http://rss.cnn.com/rss/money_news_economy.rss";
export const BLOOMBERG_LINEA_RSS_FEED = "https://www.bloomberglinea.com/feed/";
export const VALOR_ECONOMICO_RSS_FEED = "https://valor.globo.com/rss/financas/";
export const BBC_ECONOMIA_RSS_FEED = "https://feeds.bbci.co.uk/portuguese/rss.xml";
export const UOL_ECONOMIA_RSS_FEED = "https://economia.uol.com.br/rss/ultnot/index.xml";
export const FOLHA_MERCADO_RSS_FEED = "https://feeds.folha.uol.com.br/mercado/rss091.xml";
export const VALOR_INVESTING_RSS_FEED = "https://br.investing.com/rss/news.rss";

// Function to decode HTML entities
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&atilde;/g, 'ã')
    .replace(/&otilde;/g, 'õ');
}

// Improved function to extract images from content
export function extractImage(content: string, source?: string): string | null {
  if (!content) return null;
  
  // Try to find an image tag
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const imgMatch = content.match(imgRegex);
  
  if (imgMatch && imgMatch[1]) {
    const imageUrl = imgMatch[1].trim();
    
    // Validate the URL
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      console.warn(`Invalid image URL in content: ${imageUrl}`);
    }
  }
  
  // Try to find a figure tag
  const figureRegex = /<figure[^>]*>[\s\S]*?<img[^>]+src="([^">]+)"[\s\S]*?<\/figure>/i;
  const figureMatch = content.match(figureRegex);
  
  if (figureMatch && figureMatch[1]) {
    const imageUrl = figureMatch[1].trim();
    
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      console.warn(`Invalid image URL in figure: ${imageUrl}`);
    }
  }
  
  return null;
}

// New advanced function to extract image from RSS item
export function extractImageFromItem(item: Element): string | null {
  let imageUrl = null;

  // 1. Try to extract from <media:content>
  if (!imageUrl) {
    const mediaContent = item.querySelector("media\\:content, content");
    imageUrl = mediaContent ? mediaContent.getAttribute("url") : null;
  }

  // 2. Try to extract from <enclosure>
  if (!imageUrl) {
    const enclosure = item.querySelector("enclosure");
    imageUrl = enclosure && enclosure.getAttribute("type")?.startsWith("image/") 
      ? enclosure.getAttribute("url") 
      : null;
  }

  // 3. Try to extract from <media:thumbnail>
  if (!imageUrl) {
    const thumbnail = item.querySelector("media\\:thumbnail");
    imageUrl = thumbnail ? thumbnail.getAttribute("url") : null;
  }

  // 4. If still not found, try to extract from <description> or <content:encoded>
  if (!imageUrl) {
    const description = item.querySelector("description")?.textContent || 
                        item.querySelector("content\\:encoded")?.textContent;
    if (description) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }
  }

  // Validate the URL
  if (imageUrl) {
    try {
      new URL(imageUrl);
    } catch (e) {
      console.warn(`Invalid image URL extracted: ${imageUrl}`);
      imageUrl = null;
    }
  }

  return imageUrl;
}

// Function to get a default image for a news source
export function getDefaultSourceImage(source?: string): string {
  const defaultImages = {
    "Bloomberg Markets": "https://assets.bbhub.io/media/sites/1/2014/05/logo.png",
    "Bloomberg Economics": "https://assets.bbhub.io/media/sites/1/2014/05/logo.png",
    "Bloomberg": "https://assets.bbhub.io/media/sites/1/2014/05/logo.png",
    "Bloomberg Línea": "https://www.bloomberglinea.com/resizer/xA3v4S_mpcJFKHXgxH3KBwfwgm0=/filters:format(webp):quality(75):focal(1920x1080:1930x1090)/cloudfront-us-east-1.images.arcpublishing.com/bloomberglinea/X5T6PVIUCNEC5BPKC66SCKQP44.jpg",
    "CNN Money": "https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png",
    "Valor Econômico": "https://valor.globo.com/content/themes/valorstatic/img/valor-bg-2021-11.svg",
    "BBC Economia": "https://m.files.bbci.co.uk/modules/bbc-morph-news-waf-page-meta/5.2.0/bbc_news_logo.png",
    "UOL Economia": "https://conteudo.imguol.com.br/c/home/layout/mobile/v1/logo-uol.png",
    "Folha de São Paulo": "https://f.i.uol.com.br/hunting/folha/1/common/logo-folha-facebook.jpg",
    "Valor Investing": "https://i-invdn-com.investing.com/logos/investing-logo-social.jpg",
    "New York Times": "https://static01.nyt.com/images/icons/t_logo_291_black.png",
    "Wall Street Journal": "https://s.wsj.net/media/wsj_apple-touch-icon-180x180.png",
    "Twitter": "https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023.svg",
    "Farol Investe": "/lovable-uploads/08c37f81-bb96-41bd-9b6e-2ade4bae59df.png"
  };
  
  // Get source-specific image or use a fallback
  return defaultImages[source] || "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop";
}
