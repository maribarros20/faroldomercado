
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './utils/cors.ts';
import { NewsItem } from './utils/config.ts';
import { 
  fetchBloombergNews,
  fetchInfoMoneyNews,
  fetchValorEconomicoNews,
  fetchCnnMoneyNews,
  fetchForbesNews,
  fetchAlphaVantageNews
} from './utils/rss-fetchers.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, excludeSources = [] } = await req.json();
    console.log(`Recebendo request para fetch-news com categoria: ${category}, excluindo fontes: ${excludeSources}`);

    let allData: NewsItem[] = [];

    // Sempre excluir Reuters
    const sourcesToExclude = [...excludeSources, "Reuters"];
    console.log("Fontes a serem excluídas:", sourcesToExclude);

    // Busca notícias do Alpha Vantage (apenas se a categoria for especificada)
    if (category) {
      const alphaVantageNews = await fetchAlphaVantageNews(category);
      allData = [...allData, ...alphaVantageNews];
    } else {
      // Se nenhuma categoria for especificada, busca de todas as fontes RSS
      const [
        bloombergNews,
        infomoneyNews,
        valorEconomicoNews,
        cnnMoneyNews,
        forbesNews
      ] = await Promise.all([
        fetchBloombergNews(),
        fetchInfoMoneyNews(),
        fetchValorEconomicoNews(),
        fetchCnnMoneyNews(),
        fetchForbesNews()
      ]);

      allData = [
        ...allData,
        ...bloombergNews,
        ...infomoneyNews,
        ...valorEconomicoNews,
        ...cnnMoneyNews,
        ...forbesNews
      ];
    }

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
