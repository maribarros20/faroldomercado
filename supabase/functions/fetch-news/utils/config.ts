
// RSS feed URLs
export const BLOOMBERG_MARKETS_RSS_FEED = "https://feeds.bloomberg.com/markets/news.rss";
export const BLOOMBERG_ECONOMICS_RSS_FEED = "https://feeds.bloomberg.com/economics/news.rss";
export const CNN_MONEY_MARKETS_RSS_FEED = "http://rss.cnn.com/rss/money_markets.rss";
export const BLOOMBERG_LINEA_RSS_FEED = "https://www.bloomberglinea.com.br/arc/outboundfeeds/sections-feed.xml";
export const VALOR_ECONOMICO_RSS_FEED = "https://pox.globo.com/rss/valor";

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
