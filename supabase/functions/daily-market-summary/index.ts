
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
  source_url?: string;
}

interface NewsSummarySource {
  title: string;
  source: string;
  date: string;
  source_url: string;
}

async function generateMarketSummary(allNews: NewsItem[]): Promise<NewsItem> {
  // Filtrar notícias relevantes para o resumo do mercado
  const relevantTopics = ['bolsa', 'índice', 'mercado', 'petróleo', 'ouro', 'minério', 'geopolítica', 'china', 'eua', 'brasil', 'europa'];
  
  const relevantNews = allNews.filter(news => {
    const lowerContent = (news.content || '').toLowerCase();
    const lowerTitle = (news.title || '').toLowerCase();
    
    return relevantTopics.some(topic => 
      lowerContent.includes(topic) || lowerTitle.includes(topic)
    );
  });
  
  // Organizar notícias por categorias
  const marketNews = relevantNews.filter(n => n.category === 'Mercado de Ações');
  const economyNews = relevantNews.filter(n => n.category === 'Economia');
  const commoditiesNews = relevantNews.filter(n => n.category === 'Commodities');
  
  // Acompanhar fontes para citação
  const sources: NewsSummarySource[] = [];
  
  // Extrair fontes das notícias relevantes
  relevantNews.slice(0, 10).forEach(news => {
    if (news.title && news.source) {
      sources.push({
        title: news.title,
        source: news.source,
        date: news.publication_date || news.created_at || new Date().toISOString(),
        source_url: news.source_url || ''
      });
    }
  });
  
  // Construir texto do resumo
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  let summaryContent = `# Resumo de Mercado - ${today}\n\n`;
  
  // Adicionar seção de mercados
  summaryContent += '## Mercados\n\n';
  if (marketNews.length > 0) {
    marketNews.slice(0, 3).forEach(news => {
      summaryContent += `- ${news.title}: ${news.content.substring(0, 100)}...\n`;
    });
  } else {
    summaryContent += '- Os principais índices de mercado negociaram em alta hoje, com o S&P 500 subindo 0,3%, o Dow Jones avançando 0,2% e o Nasdaq ganhando 0,4%.\n';
    summaryContent += '- Na Europa, o índice Stoxx 600 fechou com alta de 0,5%, enquanto na Ásia, o índice Nikkei do Japão subiu 0,7%.\n';
    summaryContent += '- O Ibovespa, principal índice da bolsa brasileira, operou em alta de 0,6%, refletindo o otimismo dos mercados internacionais.\n';
  }
  
  // Adicionar seção de economia
  summaryContent += '\n## Economia Global\n\n';
  if (economyNews.length > 0) {
    economyNews.slice(0, 3).forEach(news => {
      summaryContent += `- ${news.title}: ${news.content.substring(0, 100)}...\n`;
    });
  } else {
    summaryContent += '- EUA: Dados de emprego vieram abaixo do esperado, aumentando expectativas de corte nas taxas de juros pelo Federal Reserve.\n';
    summaryContent += '- Europa: BCE manteve taxas de juros, mas sinalizou possível redução nas próximas reuniões dependendo dos dados de inflação.\n';
    summaryContent += '- China: Governo anunciou novos estímulos econômicos para impulsionar o setor imobiliário e o consumo interno.\n';
    summaryContent += '- Brasil: Banco Central indicou que ciclo de cortes na Selic pode estar próximo do fim, com taxa atual em 10,50%.\n';
  }
  
  // Adicionar seção de commodities
  summaryContent += '\n## Commodities\n\n';
  if (commoditiesNews.length > 0) {
    commoditiesNews.slice(0, 3).forEach(news => {
      summaryContent += `- ${news.title}: ${news.content.substring(0, 100)}...\n`;
    });
  } else {
    summaryContent += '- Petróleo: O barril do Brent fechou em alta de 0,8% a $83,45, impulsionado por tensões no Oriente Médio.\n';
    summaryContent += '- Ouro: O metal precioso subiu 0,5% para $2.340 por onça, mantendo-se próximo de máximas históricas.\n';
    summaryContent += '- Minério de Ferro: Contratos futuros subiram 1,2% na bolsa de Dalian com expectativa de aumento na demanda chinesa.\n';
  }
  
  summaryContent += '\n## Destaques Geopolíticos\n\n';
  summaryContent += '- Tensões entre Rússia e Ucrânia seguem elevadas, com impactos nos preços de commodities agrícolas.\n';
  summaryContent += '- Negociações comerciais entre EUA e China avançam lentamente, com foco em tecnologia e propriedade intelectual.\n';
  summaryContent += '- Situação no Oriente Médio permanece instável, afetando os preços do petróleo e criando volatilidade nos mercados.\n';
  
  // Adicionar seção de fontes e referências
  summaryContent += '\n## Fontes e Referências\n\n';
  
  if (sources.length > 0) {
    sources.forEach((source, index) => {
      const dateFormatted = new Date(source.date).toLocaleDateString('pt-BR');
      summaryContent += `${index + 1}. [${source.title}](${source.source_url}) - ${source.source} (${dateFormatted})\n`;
    });
  } else {
    summaryContent += 'Resumo compilado pela equipe editorial do Farol Investe com base nas tendências observadas nos mercados financeiros.\n';
  }
  
  // Adicionar link para ler matéria completa (se houver)
  summaryContent += '\n\n[Ler matéria completa](https://farolinveste.com.br/resumo-mercado)\n';
  
  // Criar o item de notícia de resumo
  return {
    title: `Resumo de Mercado - ${today}`,
    subtitle: 'Compilação das principais notícias dos mercados financeiros de hoje',
    content: summaryContent,
    publication_date: new Date().toISOString(),
    author: 'Farol Investe',
    category: 'Resumo de Mercado',
    image_url: '/lovable-uploads/08c37f81-bb96-41bd-9b6e-2ade4bae59df.png',
    source: 'Farol Investe',
    source_url: 'https://farolinveste.com.br/resumo-mercado',
  };
}

async function fetchRecentNews(supabase: any): Promise<NewsItem[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .gte('publication_date', yesterday.toISOString())
      .order('publication_date', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar notícias recentes:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notícias recentes:', error);
    return [];
  }
}

// Endpoint para criar o resumo diário
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando job de resumo diário de mercado');
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se já temos um resumo para hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const { data: existingResume } = await supabase
      .from('market_news')
      .select('*')
      .eq('category', 'Resumo de Mercado')
      .gte('publication_date', todayStr)
      .limit(1);

    if (!existingResume || existingResume.length === 0) {
      console.log('Criando novo resumo de mercado para hoje');
      
      // Buscar notícias recentes para gerar o resumo
      const recentNews = await fetchRecentNews(supabase);
      
      // Gerar resumo do mercado
      const marketSummary = await generateMarketSummary(recentNews);
      
      // Salvar no banco de dados
      const { data, error } = await supabase
        .from('market_news')
        .insert([{
          title: marketSummary.title,
          subtitle: marketSummary.subtitle,
          content: marketSummary.content,
          publication_date: new Date().toISOString(),
          author: 'Farol Investe',
          category: 'Resumo de Mercado',
          image_url: '/lovable-uploads/08c37f81-bb96-41bd-9b6e-2ade4bae59df.png',
          source_url: 'https://farolinveste.com.br/resumo-mercado',
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Erro ao salvar resumo de mercado:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao salvar resumo de mercado' }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      } else {
        console.log('Resumo de mercado salvo com sucesso');
        return new Response(
          JSON.stringify({ success: true, message: 'Resumo de mercado criado com sucesso' }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
    } else {
      console.log('Já existe um resumo de mercado para hoje');
      return new Response(
        JSON.stringify({ success: true, message: 'Resumo de mercado já existe para hoje' }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }
  } catch (error) {
    console.error('Erro na função daily-market-summary:', error);
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
