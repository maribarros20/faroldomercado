import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './utils/cors.ts';
import { NewsItem, NYTIMES_ECONOMY_RSS_FEED } from './utils/config.ts';
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
  console.log("Fetching NY Times Economy news from:", NYTIMES_ECONOMY_RSS_FEED);
  
  try {
    const response = await fetch(NYTIMES_ECONOMY_RSS_FEED);
    
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
      
      // Extract basic info
      const title = item.querySelector("title")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "";
      const description = item.querySelector("description")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || "";
      const creator = item.querySelector("dc\\:creator")?.textContent || "New York Times";
      
      // Extract media/image
      let image_url = "";
      const mediaContent = item.querySelector("media\\:content");
      if (mediaContent) {
        image_url = mediaContent.getAttribute("url") || "";
      }
      
      // If no media content is found, try to find an image in the description
      if (!image_url) {
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch.length > 1) {
          image_url = imgMatch[1];
        }
      }
      
      // Use NYT logo as fallback if no image is found
      if (!image_url) {
        image_url = "https://static01.nyt.com/images/2022/09/12/NYT-METS-1000x1000-1678734279986/NYT-METS-1000x1000-1678734279986-mobileMasterAt3x.jpg";
      }
      
      // Get content and clean it
      let content = description;
      // Remove HTML tags but keep the text content
      content = content.replace(/<[^>]*>/g, ' ').trim();
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
    }
    
    console.log(`Successfully fetched ${result.length} articles from NY Times Economy`);
    return result;
    
  } catch (error) {
    console.error("Error fetching NY Times Economy news:", error.message);
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
      console.log("No request body or invalid JSON");
    }
    
    const { excludeSources = [] } = requestData;
    console.log(`Recebendo request para fetch-news, excluindo fontes: ${excludeSources}`);

    // Sempre excluir Reuters
    const sourcesToExclude = [...excludeSources, "Reuters"];
    console.log("Fontes a serem excluídas:", sourcesToExclude);

    // Fetch news from all RSS sources with detailed logging
    console.log("Iniciando busca de todas as fontes RSS");
    
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
      fetchNYTimesEconomyNews()
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
      nyTimesEconomyResult
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
    
    // Log results and validation from each source
    console.log(`Bloomberg Markets: ${bloombergMarketsNews.length} items`);
    console.log(`Bloomberg Economics: ${bloombergEconomicsNews.length} items`);
    console.log(`CNN Money Markets: ${cnnMoneyMarketsNews.length} items`);
    console.log(`CNN Money Economy: ${cnnMoneyEconomyNews.length} items`);
    console.log(`Bloomberg Línea: ${bloombergLineaNews.length} items`);
    console.log(`Valor Econômico: ${valorEconomicoNews.length} items`);
    console.log(`BBC Economia: ${bbcEconomiaNews.length} items`);
    console.log(`UOL Economia: ${uolEconomiaNews.length} items`);
    console.log(`Folha Mercado: ${folhaMercadoNews.length} items`);
    console.log(`Valor Investing: ${valorInvestingNews.length} items`);
    console.log(`NY Times Economy: ${nyTimesEconomyNews.length} items`);

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
      ...nyTimesEconomyNews
    ];

    console.log(`Total de notícias encontradas: ${allData.length}`);

    // Validate all items have the necessary fields
    allData = allData.filter(item => {
      if (!item.title || typeof item.title !== 'string') {
        console.warn('Removing item without valid title');
        return false;
      }
      
      if (!item.content || typeof item.content !== 'string') {
        console.warn(`Removing item "${item.title}" without valid content`);
        return false;
      }
      
      return true;
    });

    // Fix HTML entities in UOL news and other sources
    allData = allData.map(item => {
      if (item.title) {
        // Decode HTML entities
        const decodedTitle = item.title
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/&#243;/g, 'ó')
          .replace(/&#231;/g, 'ç')
          .replace(/&#227;/g, 'ã')
          .replace(/&#237;/g, 'í')
          .replace(/&#224;/g, 'à')
          .replace(/&#233;/g, 'é')
          .replace(/&#250;/g, 'ú')
          .replace(/&#234;/g, 'ê');
        
        item.title = decodedTitle;
      }
      
      if (item.content) {
        // Decode HTML entities in content
        const decodedContent = item.content
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/&#243;/g, 'ó')
          .replace(/&#231;/g, 'ç')
          .replace(/&#227;/g, 'ã')
          .replace(/&#237;/g, 'í')
          .replace(/&#224;/g, 'à')
          .replace(/&#233;/g, 'é')
          .replace(/&#250;/g, 'ú')
          .replace(/&#234;/g, 'ê');
        
        item.content = decodedContent;
      }
      
      return item;
    });

    // Filter news to only include current day and previous day
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    console.log(`Filtrando notícias apenas de hoje (${now.toISOString()}) e ontem (${yesterday.toISOString()})`);
    
    allData = allData.filter(item => {
      try {
        // Tenta parsear a data da notícia
        const rawDate = item.publication_date;
        if (!rawDate) {
          // Se não houver data, mantém a notícia (consideramos como nova)
          console.log(`Notícia sem data: "${item.title}"`);
          return true;
        }
        
        const itemDate = new Date(rawDate);
        // Verifica se a data é válida
        if (isNaN(itemDate.getTime())) {
          console.warn(`Data inválida para notícia "${item.title}": ${rawDate}`);
          // Se a data for inválida, mantém a notícia
          return true;
        }
        
        // Verifica se a notícia é de hoje ou ontem
        const isRecentNews = itemDate >= yesterday;
        if (!isRecentNews) {
          console.log(`Notícia antiga descartada: "${item.title}" com data ${itemDate.toISOString()}`);
        }
        return isRecentNews;
      } catch (e) {
        console.warn(`Erro ao processar data para notícia "${item.title}": ${item.publication_date}`);
        // Em caso de erro, mantém a notícia
        return true;
      }
    });
    
    console.log(`Total de notícias após filtro de data: ${allData.length}`);

    // Ensure all items have image_url
    allData = allData.map(item => {
      if (!item.image_url) {
        // Select appropriate default image based on source
        switch (item.source) {
          case 'Bloomberg Markets':
          case 'Bloomberg Economics':
          case 'Bloomberg':
            item.image_url = 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
            break;
          case 'CNN Money':
            item.image_url = 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
            break;
          case 'Bloomberg Línea':
            item.image_url = 'https://www.bloomberglinea.com/resizer/hYQJgW06pnxUVAc_iEPKWBw-6tM=/1440x0/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/bloomberglinea/UOQI5QZ3SNGLTBV7RFAMLSB5YM.jpg';
            break;
          case 'Valor Econômico':
            item.image_url = 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
            break;
          case 'BBC Economia':
          case 'BBC':
            item.image_url = 'https://ichef.bbci.co.uk/news/640/cpsprodpb/F3C4/production/_123996607_bbcbrasil.png';
            break;
          case 'UOL Economia':
          case 'UOL':
            item.image_url = 'https://conteudo.imguol.com.br/c/home/11/2019/10/30/logo-uol-horizontal-1572447337368_1920x1080.jpg';
            break;
          case 'Folha de São Paulo':
            item.image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo_Folha_de_S.Paulo.svg';
            break;
          case 'Valor Investing':
            item.image_url = 'https://valorinveste.globo.com/includes/site_vi_2019/img/logo_valorinveste.svg';
            break;
          case 'New York Times':
          case 'NYTimes':
            item.image_url = 'https://static01.nyt.com/images/2022/09/12/NYT-METS-1000x1000-1678734279986/NYT-METS-1000x1000-1678734279986-mobileMasterAt3x.jpg';
            break;
          default:
            item.image_url = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
        }
      }
      
      // Validar a URL da imagem
      try {
        new URL(item.image_url);
      } catch (e) {
        console.warn(`URL de imagem inválida para "${item.title}": ${item.image_url}`);
        // Usar imagem de fallback
        item.image_url = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
      }
      
      return item;
    });

    // Filtrar para remover notícias das fontes excluídas (incluindo Reuters)
    const filteredData = allData.filter(item => {
      return !sourcesToExclude.includes(item.source);
    });

    console.log(`Total de notícias após filtragem: ${filteredData.length}`);

    // If we have no news after filtering, log a warning
    if (filteredData.length === 0) {
      console.warn("Nenhuma notícia encontrada após filtragem. Verifique as fontes e filtros.");
    }

    // Return the filtered news with detailed logging
    return new Response(
      JSON.stringify(filteredData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error(`Error in fetch-news: ${error.message}`);
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
