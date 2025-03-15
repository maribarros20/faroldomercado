import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './utils/cors.ts';
import { 
  NewsItem, 
  NYTIMES_ECONOMY_RSS_FEED,
  WSJOURNAL_ECONOMY_RSS_FEED,
  decodeHtmlEntities,
  extractImage,
  getDefaultSourceImage
} from './utils/config.ts';
import { 
  fetchBloombergMarketsNews,
  fetchBloombergEconomicsNews,
  fetchCnnMoneyMarketsNews,
  fetchBloombergLineaNews,
  fetchValorEconomicoNews,
  fetchBBCEconomiaNews,
  fetchUOLEconomiaNews,
  fetchFolhaMercadoNews,
  fetchValorInvestingNews,
  fetchCnnMoneyEconomyNews
} from './utils/rss-fetchers.ts';

async function fetchNYTimesEconomyNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(NYTIMES_ECONOMY_RSS_FEED, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FarolInveste/1.0; +http://farolinveste.com)'
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch NY Times Economy news: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const xml = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const items = xmlDoc.querySelectorAll("item");
    
    const result: NewsItem[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        // Extract basic info
        const title = decodeHtmlEntities(item.querySelector("title")?.textContent || "");
        const link = item.querySelector("link")?.textContent || "";
        const description = item.querySelector("description")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const creator = item.querySelector("dc\\:creator")?.textContent || "New York Times";
        
        // Extract media/image with multiple methods
        let image_url = "";
        
        // Try media namespace tags first
        const mediaContent = item.querySelector("media\\:content");
        if (mediaContent) {
          image_url = mediaContent.getAttribute("url") || "";
        }
        
        // Try media:thumbnail
        if (!image_url) {
          const mediaThumbnail = item.querySelector("media\\:thumbnail");
          if (mediaThumbnail) {
            image_url = mediaThumbnail.getAttribute("url") || "";
          }
        }
        
        // Try enclosure tag
        if (!image_url) {
          const enclosure = item.querySelector("enclosure");
          if (enclosure && enclosure.getAttribute("type")?.startsWith("image/")) {
            image_url = enclosure.getAttribute("url") || "";
          }
        }
        
        // If no media content is found, try to find an image in the description
        if (!image_url) {
          image_url = extractImage(description, "New York Times") || "";
        }
        
        // Use NYT logo as fallback if no image is found
        if (!image_url) {
          image_url = getDefaultSourceImage("New York Times");
        }
        
        // Validate image URL
        try {
          if (image_url) new URL(image_url);
        } catch (e) {
          image_url = getDefaultSourceImage("New York Times");
        }
        
        // Get content and clean it
        let content = description;
        // Remove HTML tags but keep the text content
        content = decodeHtmlEntities(content.replace(/<[^>]*>/g, ' ').trim());
        // Clean up extra spaces
        content = content.replace(/\s+/g, ' ');
        
        result.push({
          title,
          content,
          publication_date: pubDate,
          author: creator,
          category: "Economia",
          image_url,
          source: "New York Times",
          source_url: link
        });
      } catch (itemError) {
        console.error(`Error processing NY Times news item: ${itemError.message}`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error("Error fetching NY Times Economy news:", error.message);
    return [];
  }
}

async function fetchWSJournalNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(WSJOURNAL_ECONOMY_RSS_FEED, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FarolInveste/1.0; +http://farolinveste.com)'
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch WSJ news: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const xml = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const items = xmlDoc.querySelectorAll("item");
    
    const result: NewsItem[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        // Extract basic info
        const title = decodeHtmlEntities(item.querySelector("title")?.textContent || "");
        const link = item.querySelector("link")?.textContent || "";
        const description = item.querySelector("description")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const creator = item.querySelector("dc\\:creator")?.textContent || "Wall Street Journal";
        
        // Extract media/image with WSJ specific approach
        let image_url = "";
        
        const mediaContent = item.querySelector("media\\:content");
        if (mediaContent) {
          image_url = mediaContent.getAttribute("url") || "";
        }
        
        if (!image_url) {
          image_url = extractImage(description, "Wall Street Journal") || "";
        }
        
        if (!image_url) {
          image_url = getDefaultSourceImage("Wall Street Journal");
        }
        
        // Validate image URL
        try {
          if (image_url) new URL(image_url);
        } catch (e) {
          image_url = getDefaultSourceImage("Wall Street Journal");
        }
        
        // Get content and clean it
        let content = description;
        content = decodeHtmlEntities(content.replace(/<[^>]*>/g, ' ').trim());
        content = content.replace(/\s+/g, ' ');
        
        result.push({
          title,
          content,
          publication_date: pubDate,
          author: creator,
          category: "Economia",
          image_url,
          source: "Wall Street Journal",
          source_url: link
        });
      } catch (itemError) {
        console.error(`Error processing WSJ news item: ${itemError.message}`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error("Error fetching WSJ news:", error.message);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData = {};
    try {
      requestData = await req.json();
    } catch (e) {
      // No request body or invalid JSON, continue with empty object
    }
    
    const { excludeSources = [] } = requestData;

    // Sempre excluir Reuters
    const sourcesToExclude = [...excludeSources, "Reuters"];

    // Fetch news from all RSS sources with detailed logging
    const results = await Promise.allSettled([
      fetchBloombergMarketsNews(),
      fetchBloombergEconomicsNews(),
      fetchCnnMoneyMarketsNews(),
      fetchCnnMoneyEconomyNews(),
      fetchBloombergLineaNews(),
      fetchValorEconomicoNews(),
      fetchBBCEconomiaNews(),
      fetchUOLEconomiaNews(),
      fetchFolhaMercadoNews(),
      fetchValorInvestingNews(),
      fetchNYTimesEconomyNews(),
      fetchWSJournalNews()
    ]);
    
    // Process results, handling any rejected promises
    const [
      bloombergMarketsResult,
      bloombergEconomicsResult,
      cnnMoneyMarketsResult,
      cnnMoneyEconomyResult,
      bloombergLineaResult,
      valorEconomicoResult,
      bbcEconomiaResult,
      uolEconomiaResult,
      folhaMercadoResult,
      valorInvestingResult,
      nyTimesEconomyResult,
      wsjournalResult
    ] = results;
    
    const bloombergMarketsNews = bloombergMarketsResult.status === 'fulfilled' ? bloombergMarketsResult.value : [];
    const bloombergEconomicsNews = bloombergEconomicsResult.status === 'fulfilled' ? bloombergEconomicsResult.value : [];
    const cnnMoneyMarketsNews = cnnMoneyMarketsResult.status === 'fulfilled' ? cnnMoneyMarketsResult.value : [];
    const cnnMoneyEconomyNews = cnnMoneyEconomyResult.status === 'fulfilled' ? cnnMoneyEconomyResult.value : [];
    const bloombergLineaNews = bloombergLineaResult.status === 'fulfilled' ? bloombergLineaResult.value : [];
    const valorEconomicoNews = valorEconomicoResult.status === 'fulfilled' ? valorEconomicoResult.value : [];
    const bbcEconomiaNews = bbcEconomiaResult.status === 'fulfilled' ? bbcEconomiaResult.value : [];
    const uolEconomiaNews = uolEconomiaResult.status === 'fulfilled' ? uolEconomiaResult.value : [];
    const folhaMercadoNews = folhaMercadoResult.status === 'fulfilled' ? folhaMercadoResult.value : [];
    const valorInvestingNews = valorInvestingResult.status === 'fulfilled' ? valorInvestingResult.value : [];
    const nyTimesEconomyNews = nyTimesEconomyResult.status === 'fulfilled' ? nyTimesEconomyResult.value : [];
    const wsjournalNews = wsjournalResult.status === 'fulfilled' ? wsjournalResult.value : [];

    // Combine all news sources
    let allData: NewsItem[] = [
      ...bloombergMarketsNews,
      ...bloombergEconomicsNews,
      ...cnnMoneyMarketsNews,
      ...cnnMoneyEconomyNews,
      ...bloombergLineaNews,
      ...valorEconomicoNews,
      ...bbcEconomiaNews,
      ...uolEconomiaNews,
      ...folhaMercadoNews,
      ...valorInvestingNews,
      ...nyTimesEconomyNews,
      ...wsjournalNews
    ];

    // Validate all items have the necessary fields
    allData = allData.filter(item => {
      if (!item.title || typeof item.title !== 'string') {
        return false;
      }
      
      if (!item.content || typeof item.content !== 'string') {
        return false;
      }
      
      return true;
    });

    // Fix HTML entities in all news items
    allData = allData.map(item => {
      return {
        ...item,
        title: decodeHtmlEntities(item.title || ''),
        subtitle: item.subtitle ? decodeHtmlEntities(item.subtitle) : undefined,
        content: decodeHtmlEntities(item.content || ''),
        author: item.author ? decodeHtmlEntities(item.author) : undefined
      };
    });

    // Filter news to only include current day and previous day
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    allData = allData.filter(item => {
      try {
        // Try to parse the news date
        const rawDate = item.publication_date;
        if (!rawDate) {
          // If no date, keep the news (consider it new)
          return true;
        }
        
        const itemDate = new Date(rawDate);
        // Check if date is valid
        if (isNaN(itemDate.getTime())) {
          // If date is invalid, keep the news
          return true;
        }
        
        // Check if news is from today or yesterday
        return itemDate >= yesterday;
      } catch (e) {
        // In case of error, keep the news
        return true;
      }
    });

    // Ensure all items have valid image_url and fix any broken URLs
    allData = allData.map(item => {
      // Validate existing image URL
      let validatedImageUrl = '';
      
      if (item.image_url) {
        try {
          new URL(item.image_url);
          validatedImageUrl = item.image_url;
        } catch (e) {
          validatedImageUrl = '';
        }
      }
      
      // If image URL is empty or invalid, try to extract from content
      if (!validatedImageUrl && item.content) {
        const extractedImage = extractImage(item.content, item.source);
        if (extractedImage) {
          try {
            new URL(extractedImage);
            validatedImageUrl = extractedImage;
          } catch (e) {
            // Invalid extracted URL
          }
        }
      }
      
      // If still no valid URL, use source-specific default
      if (!validatedImageUrl) {
        validatedImageUrl = getDefaultSourceImage(item.source);
      }
      
      return {
        ...item,
        image_url: validatedImageUrl
      };
    });

    // Filter to remove news from excluded sources (including Reuters)
    const filteredData = allData.filter(item => {
      return !sourcesToExclude.includes(item.source);
    });

    // Return the filtered news
    return new Response(
      JSON.stringify(filteredData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
