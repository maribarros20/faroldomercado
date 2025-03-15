
// RSS feed URLs
export const BLOOMBERG_MARKETS_RSS_FEED = "https://feeds.bloomberg.com/markets/news.rss";
export const BLOOMBERG_ECONOMICS_RSS_FEED = "https://feeds.bloomberg.com/economics/news.rss";
export const CNN_MONEY_MARKETS_RSS_FEED = "http://rss.cnn.com/rss/money_markets.rss";
export const CNN_MONEY_ECONOMY_RSS_FEED = "http://rss.cnn.com/rss/money_news_economy.rss";
export const BLOOMBERG_LINEA_RSS_FEED = "https://www.bloomberglinea.com.br/arc/outboundfeeds/sections-feed.xml";
export const VALOR_ECONOMICO_RSS_FEED = "https://pox.globo.com/rss/valor";
export const BBC_ECONOMIA_RSS_FEED = "http://www.bbc.co.uk/portuguese/topicos/economia/";
export const UOL_ECONOMIA_RSS_FEED = "https://rss.uol.com.br/feed/economia.xml";
export const FOLHA_MERCADO_RSS_FEED = "https://feeds.folha.uol.com.br/mercado/rss091.xml";
export const VALOR_INVESTING_RSS_FEED = "https://pox.globo.com/rss/valorinveste";
export const NYTIMES_ECONOMY_RSS_FEED = "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml";
export const WSJOURNAL_ECONOMY_RSS_FEED = "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml";

// News item interface
export interface NewsItem {
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

// Character encoding helper function
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    // Specific for Portuguese characters
    .replace(/&#243;/g, 'ó')
    .replace(/&#231;/g, 'ç')
    .replace(/&#227;/g, 'ã')
    .replace(/&#237;/g, 'í')
    .replace(/&#224;/g, 'à')
    .replace(/&#233;/g, 'é')
    .replace(/&#250;/g, 'ú')
    .replace(/&#234;/g, 'ê')
    .replace(/&#225;/g, 'á')
    .replace(/&#242;/g, 'ò')
    .replace(/&#244;/g, 'ô')
    .replace(/&#226;/g, 'â')
    .replace(/&#236;/g, 'ì')
    .replace(/&#249;/g, 'ù');
}

// Image extraction helper with improved source-specific handling
export function extractImage(content: string, source?: string): string | null {
  if (!content) return null;
  
  // Source-specific extraction patterns
  if (source) {
    // UOL specific extraction
    if (source.includes('UOL')) {
      const uolRegex = /<img[^>]+src="(https:\/\/conteudo\.imguol\.com\.br\/[^">]+)"/i;
      const uolMatch = content.match(uolRegex);
      if (uolMatch && uolMatch[1]) return uolMatch[1];
    } 
    // Folha specific extraction
    else if (source.includes('Folha')) {
      const folhaRegex = /<img[^>]+src="(https:\/\/f\.i\.uol\.com\.br\/[^">]+)"/i;
      const folhaMatch = content.match(folhaRegex);
      if (folhaMatch && folhaMatch[1]) return folhaMatch[1];
    }
    // BBC specific extraction
    else if (source.includes('BBC')) {
      const bbcRegex = /<img[^>]+src="(https:\/\/ichef\.bbci\.co\.uk\/[^">]+)"/i;
      const bbcMatch = content.match(bbcRegex);
      if (bbcMatch && bbcMatch[1]) return bbcMatch[1];
    }
    // NYTimes specific extraction
    else if (source.includes('NYTimes') || source.includes('New York Times')) {
      const nytRegex = /<img[^>]+src="(https:\/\/static01\.nyt\.com\/[^">]+)"/i;
      const nytMatch = content.match(nytRegex);
      if (nytMatch && nytMatch[1]) return nytMatch[1];
    }
    // WSJ specific extraction
    else if (source.includes('Wall Street Journal') || source.includes('WSJ')) {
      const wsjRegex = /<img[^>]+src="(https:\/\/images\.wsj\.net\/[^">]+)"/i;
      const wsjMatch = content.match(wsjRegex);
      if (wsjMatch && wsjMatch[1]) return wsjMatch[1];
    }
  }
  
  // General extraction patterns in priority order
  
  // Try media:content tags with url attribute
  const mediaContentRegex = /<media:content[^>]+url="([^">]+)"/i;
  const mediaContentMatch = content.match(mediaContentRegex);
  if (mediaContentMatch && mediaContentMatch[1]) {
    try {
      new URL(mediaContentMatch[1]);
      return mediaContentMatch[1];
    } catch (e) {
      // Invalid URL, continue to next method
    }
  }
  
  // Try media:thumbnail tags
  const mediaThumbnailRegex = /<media:thumbnail[^>]+url="([^">]+)"/i;
  const mediaThumbnailMatch = content.match(mediaThumbnailRegex);
  if (mediaThumbnailMatch && mediaThumbnailMatch[1]) {
    try {
      new URL(mediaThumbnailMatch[1]);
      return mediaThumbnailMatch[1];
    } catch (e) {
      // Invalid URL, continue to next method
    }
  }
  
  // Try image tags with src attribute
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const imgMatch = content.match(imgRegex);
  if (imgMatch && imgMatch[1]) {
    try {
      new URL(imgMatch[1]);
      return imgMatch[1];
    } catch (e) {
      // Invalid URL, continue to next method
    }
  }
  
  // Try enclosure tags with url attribute (common in RSS)
  const enclosureRegex = /<enclosure[^>]+url="([^">]+)"/i;
  const enclosureMatch = content.match(enclosureRegex);
  if (enclosureMatch && enclosureMatch[1]) {
    try {
      new URL(enclosureMatch[1]);
      return enclosureMatch[1];
    } catch (e) {
      // Invalid URL, continue to next method
    }
  }
  
  // Try og:image meta tags
  const ogImageRegex = /<meta[^>]+property="og:image"[^>]+content="([^">]+)"/i;
  const ogImageMatch = content.match(ogImageRegex);
  if (ogImageMatch && ogImageMatch[1]) {
    try {
      new URL(ogImageMatch[1]);
      return ogImageMatch[1];
    } catch (e) {
      // Invalid URL, continue to next method
    }
  }
  
  // Try direct image URLs
  const urlRegex = /(https?:\/\/[^\s"]+\.(?:jpg|jpeg|gif|png|webp))/i;
  const urlMatch = content.match(urlRegex);
  if (urlMatch && urlMatch[0]) {
    try {
      new URL(urlMatch[0]);
      return urlMatch[0];
    } catch (e) {
      // Invalid URL, continue to next method
    }
  }
  
  return null;
}

// Source-specific default images
export function getDefaultSourceImage(source?: string): string {
  if (!source) return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
  
  switch (source) {
    case 'Bloomberg Markets':
    case 'Bloomberg Economics':
    case 'Bloomberg':
    case 'Bloomberg Línea':
      return 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
    case 'CNN Money':
      return 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
    case 'Valor Econômico':
    case 'Valor Investing':
      return 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
    case 'BBC Economia':
    case 'BBC':
      return 'https://ichef.bbci.co.uk/news/640/cpsprodpb/F3C4/production/_123996607_bbcbrasil.png';
    case 'UOL Economia':
    case 'UOL':
      return 'https://conteudo.imguol.com.br/c/home/11/2019/10/30/logo-uol-horizontal-1572447337368_1920x1080.jpg';
    case 'Folha de São Paulo':
      return 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo_Folha_de_S.Paulo.svg';
    case 'New York Times':
    case 'NYTimes':
      return 'https://static01.nyt.com/images/2022/09/12/NYT-METS-1000x1000-1678734279986/NYT-METS-1000x1000-1678734279986-mobileMasterAt3x.jpg';
    case 'Wall Street Journal':
    case 'WSJ':
      return 'https://s.wsj.net/img/meta/wsj-social-share.png';
    default:
      return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
  }
}
