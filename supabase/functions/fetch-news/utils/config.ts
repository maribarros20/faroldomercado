
// RSS feed URLs
export const BLOOMBERG_RSS_FEED = "https://www.bloomberg.com/feed";
export const INFOMONEY_RSS_FEED = "https://www.infomoney.com.br/feed/";
export const VALOR_ECONOMICO_RSS_FEED = "https://valorinveste.globo.com/rss/valor-investe/feed.xml";
export const CNN_MONEY_RSS_FEED = "http://rss.cnn.com/rss/money_news_international.rss";
export const FORBES_RSS_FEED = "https://www.forbes.com/markets/feed/";

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
