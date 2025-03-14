
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
    const { excludeSources = [] } = await req.json();
    console.log(`Recebendo request para fetch-news, excluindo fontes: ${excludeSources}`);

    // Sempre excluir Reuters
    const sourcesToExclude = [...excludeSources, "Reuters"];
    console.log("Fontes a serem excluídas:", sourcesToExclude);

    // Fetch news from all RSS sources
    console.log("Iniciando busca de todas as fontes RSS");
    const [
      bloombergMarketsNews,
      bloombergEconomicsNews,
      cnnMoneyMarketsNews,
      bloombergLineaNews,
      valorEconomicoNews
    ] = await Promise.all([
      fetchBloombergMarketsNews(),
      fetchBloombergEconomicsNews(),
      fetchCnnMoneyMarketsNews(),
      fetchBloombergLineaNews(),
      fetchValorEconomicoNews()
    ]);

    // Combine all news sources
    let allData: NewsItem[] = [
      ...bloombergMarketsNews,
      ...bloombergEconomicsNews,
      ...cnnMoneyMarketsNews,
      ...bloombergLineaNews,
      ...valorEconomicoNews
    ];

    console.log(`Total de notícias encontradas: ${allData.length}`);

    // Filtrar para remover notícias das fontes excluídas (incluindo Reuters)
    const filteredData = allData.filter(item => {
      return !sourcesToExclude.includes(item.source);
    });

    console.log(`Total de notícias após filtragem: ${filteredData.length}`);

    // Return the filtered news
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
