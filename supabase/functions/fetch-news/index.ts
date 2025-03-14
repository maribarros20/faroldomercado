
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './utils/cors.ts';
import { NewsItem } from './utils/config.ts';
import { 
  fetchBloombergMarketsNews,
  fetchBloombergEconomicsNews,
  fetchCnnMoneyMarketsNews,
  fetchBloombergLineaNews,
  fetchValorEconomicoNews
} from './utils/rss-fetchers.ts';

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
      fetchBloombergLineaNews(),
      fetchValorEconomicoNews()
    ]);
    
    // Process results, handling any rejected promises
    const [
      bloombergMarketsResult,
      bloombergEconomicsResult,
      cnnMoneyMarketsResult,
      bloombergLineaResult,
      valorEconomicoResult
    ] = results;
    
    const bloombergMarketsNews = bloombergMarketsResult.status === 'fulfilled' ? bloombergMarketsResult.value : [];
    const bloombergEconomicsNews = bloombergEconomicsResult.status === 'fulfilled' ? bloombergEconomicsResult.value : [];
    const cnnMoneyMarketsNews = cnnMoneyMarketsResult.status === 'fulfilled' ? cnnMoneyMarketsResult.value : [];
    const bloombergLineaNews = bloombergLineaResult.status === 'fulfilled' ? bloombergLineaResult.value : [];
    const valorEconomicoNews = valorEconomicoResult.status === 'fulfilled' ? valorEconomicoResult.value : [];
    
    // Log results and validation from each source
    console.log(`Bloomberg Markets: ${bloombergMarketsNews.length} items`);
    console.log(`Bloomberg Economics: ${bloombergEconomicsNews.length} items`);
    console.log(`CNN Money Markets: ${cnnMoneyMarketsNews.length} items`);
    console.log(`Bloomberg Línea: ${bloombergLineaNews.length} items`);
    console.log(`Valor Econômico: ${valorEconomicoNews.length} items`);

    // Log a sample item from each source to verify structure
    if (bloombergMarketsNews.length > 0) {
      console.log("Sample Bloomberg Markets item:", JSON.stringify(bloombergMarketsNews[0], null, 2));
    }
    if (cnnMoneyMarketsNews.length > 0) {
      console.log("Sample CNN Money item:", JSON.stringify(cnnMoneyMarketsNews[0], null, 2));
    }

    // Combine all news sources
    let allData: NewsItem[] = [
      ...bloombergMarketsNews,
      ...bloombergEconomicsNews,
      ...cnnMoneyMarketsNews,
      ...bloombergLineaNews,
      ...valorEconomicoNews
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

    // Ensure all items have image_url
    allData = allData.map(item => {
      if (!item.image_url) {
        // Select appropriate default image based on source
        switch (item.source) {
          case 'Bloomberg Markets':
          case 'Bloomberg Economics':
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
          default:
            item.image_url = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop';
        }
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
