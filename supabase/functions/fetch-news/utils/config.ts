
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
