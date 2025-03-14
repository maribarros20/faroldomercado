
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './utils/cors.ts';
import { NewsItem } from './utils/config.ts';
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
      fetchValorInvestingNews()
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
      valorInvestingResult
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
      ...valorInvestingNews
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

    // Filter news to only include current day and previous day
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    console.log(`Filtrando notícias apenas de hoje (${now.toISOString()}) e ontem (${yesterday.toISOString()})`);
    
    allData = allData.filter(item => {
      try {
        const itemDate = new Date(item.publication_date || new Date());
        return itemDate >= yesterday;
      } catch (e) {
        console.warn(`Data inválida para notícia "${item.title}": ${item.publication_date}`);
        return false;
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
            item.image_url = 'https://ichef.bbci.co.uk/news/640/cpsprodpb/F3C4/production/_123996607_bbcbrasil.png';
            break;
          case 'UOL Economia':
            item.image_url = 'https://conteudo.imguol.com.br/c/home/11/2019/10/30/logo-uol-horizontal-1572447337368_1920x1080.jpg';
            break;
          case 'Folha de São Paulo':
            item.image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo_Folha_de_S.Paulo.svg';
            break;
          case 'Valor Investing':
            item.image_url = 'https://valorinveste.globo.com/includes/site_vi_2019/img/logo_valorinveste.svg';
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
