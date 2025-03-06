
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Interface para notícias
interface NewsItem {
  id?: string;
  title: string;
  subtitle?: string;
  content: string;
  publication_date?: string;
  author?: string;
  category?: string;
  image_url?: string;
  source: string;
  created_at?: string;
  updated_at?: string;
}

// Função para fazer o fetch das notícias de diferentes fontes
async function fetchExternalNews(): Promise<NewsItem[]> {
  try {
    // Array com várias fontes de notícias para ter mais conteúdo
    const sources = [
      // InfoMoney API (precisaria de uma API key em produção)
      'https://api.exemplo.com/infomoney/noticias',
      // Valor Econômico API (precisaria de uma API key em produção)
      'https://api.exemplo.com/valor/noticias',
      // Usando News API como fonte genérica para demo
      `https://newsapi.org/v2/top-business-headlines?country=br&category=business&apiKey=${Deno.env.get('NEWS_API_KEY') || 'demo'}`,
    ];

    // Simular dados para fins de demonstração
    // Em produção, você usaria APIs reais com chaves válidas
    const mockData: NewsItem[] = [
      {
        title: "Ibovespa sobe 1,5% e fecha acima dos 130 mil pontos",
        subtitle: "Índice foi impulsionado por commodities e pelo cenário internacional positivo",
        content: "O Ibovespa, principal índice da bolsa brasileira, fechou o pregão desta quarta-feira (8) em alta de 1,5%, aos 130.156 pontos, impulsionado pela valorização das commodities no exterior e pelo otimismo com dados econômicos positivos nos Estados Unidos. As ações da Petrobras e da Vale, as mais negociadas do índice, subiram 2,3% e 1,8%, respectivamente.",
        publication_date: new Date().toISOString(),
        author: "Equipe InfoMoney",
        category: "Mercado de Ações",
        image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
        source: "InfoMoney"
      },
      {
        title: "Banco Central mantém Selic em 10,75% ao ano",
        subtitle: "Decisão foi unânime e já era esperada pelo mercado financeiro",
        content: "O Comitê de Política Monetária (Copom) do Banco Central decidiu, por unanimidade, manter a taxa básica de juros (Selic) em 10,75% ao ano. A decisão estava em linha com as expectativas do mercado. Em comunicado, o BC destacou que o cenário externo segue adverso, com os bancos centrais das principais economias determinados a manter uma política monetária contracionista por período prolongado.",
        publication_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Valor Econômico",
        category: "Economia",
        image_url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop",
        source: "Valor Econômico"
      },
      {
        title: "Dólar recua para R$ 5,05 com entrada de fluxo estrangeiro",
        subtitle: "Moeda americana caiu pelo terceiro dia consecutivo",
        content: "O dólar fechou em queda de 0,7% nesta quarta-feira (8), cotado a R$ 5,05 na venda, em dia de forte entrada de fluxo estrangeiro no país. O movimento foi impulsionado pela melhora do clima para emergentes no exterior e por dados positivos da economia brasileira. No ano, a moeda americana acumula queda de 5,3% frente ao real.",
        publication_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Agência Brasil",
        category: "Câmbio",
        image_url: "https://images.unsplash.com/photo-1591033594798-33227a05780d?q=80&w=2069&auto=format&fit=crop",
        source: "Agência Brasil"
      },
      {
        title: "Petrobras anuncia investimentos de R$ 380 bilhões até 2028",
        subtitle: "Plano de investimentos da estatal foi aprovado pelo conselho de administração",
        content: "A Petrobras anunciou nesta terça-feira (7) seu novo plano estratégico para o período de 2024 a 2028, com investimentos previstos de US$ 73 bilhões (cerca de R$ 380 bilhões). Do total, 72% serão destinados à exploração e produção de petróleo e gás, com foco no pré-sal. A companhia também prevê aportes em projetos de transição energética, com R$ 16 bilhões para iniciativas de descarbonização e energias renováveis.",
        publication_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Reuters",
        category: "Negócios",
        image_url: "https://images.unsplash.com/photo-1531403939386-c08a239fbc68?q=80&w=1970&auto=format&fit=crop",
        source: "Reuters"
      },
      {
        title: "PIB do Brasil cresce 0,8% no primeiro trimestre, acima das projeções",
        subtitle: "Resultado superou expectativa do mercado, que era de 0,5%",
        content: "A economia brasileira cresceu 0,8% no primeiro trimestre de 2023, na comparação com os últimos três meses do ano passado, segundo dados divulgados pelo IBGE nesta quarta-feira (8). O resultado ficou acima da mediana das projeções de analistas consultados, que era de alta de 0,5%. Na comparação com o mesmo trimestre de 2022, o PIB teve expansão de 2,3%. O setor de serviços foi o principal responsável pelo desempenho positivo, com alta de 1,2% no período.",
        publication_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        author: "IBGE",
        category: "Economia",
        image_url: "https://images.unsplash.com/photo-1616803140344-7862904e6f2b?q=80&w=2070&auto=format&fit=crop",
        source: "IBGE"
      },
      {
        title: "Bitcoin ultrapassa US$ 65 mil e renova máxima histórica",
        subtitle: "Criptomoeda está em tendência de alta desde o início do ano",
        content: "O Bitcoin ultrapassou a marca de US$ 65 mil nesta quinta-feira (9), renovando sua máxima histórica. A criptomoeda acumula valorização de mais de 50% desde o início do ano, impulsionada pela aprovação dos ETFs de Bitcoin à vista nos Estados Unidos e pela expectativa do próximo 'halving', evento que reduz pela metade a emissão de novos bitcoins, previsto para ocorrer em abril.",
        publication_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        author: "CoinDesk",
        category: "Criptomoedas",
        image_url: "https://images.unsplash.com/photo-1625806335347-4f5f7e8d4a8e?q=80&w=2070&auto=format&fit=crop",
        source: "CoinDesk"
      }
    ];

    return mockData;
  } catch (error) {
    console.error("Erro ao buscar notícias externas:", error);
    return [];
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Apenas permitir GET requests
    if (req.method !== 'GET') {
      throw new Error(`Método ${req.method} não permitido`);
    }

    // Criar cliente Supabase para ler os dados
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar notícias externas
    const externalNews = await fetchExternalNews();

    // Buscar notícias manuais do banco de dados
    const { data: manualNews, error } = await supabase
      .from('market_news')
      .select('*')
      .order('publication_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Formatar notícias manuais para ter o mesmo formato das externas
    const formattedManualNews = manualNews.map(item => ({
      ...item,
      source: 'manual'
    }));

    // Combinar e ordenar por data de publicação (mais recentes primeiro)
    const allNews = [...formattedManualNews, ...externalNews].sort((a, b) => {
      return new Date(b.publication_date || b.created_at || '').getTime() - 
             new Date(a.publication_date || a.created_at || '').getTime();
    });

    // Retornar todas as notícias
    return new Response(
      JSON.stringify({ 
        data: allNews,
        count: allNews.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
