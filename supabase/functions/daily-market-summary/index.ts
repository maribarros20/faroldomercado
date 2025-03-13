
// This edge function is responsible for generating a daily market summary
// It's scheduled to run every day at 6:00 AM

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface Source {
  title: string;
  url: string;
  date: string;
  source: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando geração do resumo diário de mercado');
    
    // Inicializar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Obter notícias recentes para o resumo (últimas 24 horas)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentNews, error: newsError } = await supabase
      .from('market_news')
      .select('*')
      .gte('publication_date', yesterday.toISOString())
      .order('publication_date', { ascending: false });
    
    if (newsError) {
      console.error('Erro ao buscar notícias recentes:', newsError);
      throw new Error('Falha ao buscar notícias para o resumo');
    }
    
    // Verificar se há notícias suficientes
    if (!recentNews || recentNews.length < 3) {
      console.log('Não há notícias suficientes para gerar um resumo. Buscando notícias mais antigas.');
      
      // Buscar as 10 notícias mais recentes independente da data
      const { data: fallbackNews, error: fallbackError } = await supabase
        .from('market_news')
        .select('*')
        .order('publication_date', { ascending: false })
        .limit(10);
      
      if (fallbackError) {
        console.error('Erro ao buscar notícias de fallback:', fallbackError);
        throw new Error('Falha ao buscar notícias para o resumo');
      }
      
      if (!fallbackNews || fallbackNews.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Não há notícias suficientes para gerar um resumo de mercado." 
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Usar as notícias de fallback
      recentNews.push(...fallbackNews);
    }
    
    // Preparar conteúdo das notícias para o resumo
    const newsContent = recentNews.map(news => {
      return `${news.title}:\n${news.content?.substring(0, 500) || ''}`;
    }).join('\n\n');
    
    // Preparar fontes para referência
    const sources: Source[] = recentNews.map(news => ({
      title: news.title || "",
      url: news.source_url || "",
      date: news.publication_date ? new Date(news.publication_date).toLocaleDateString('pt-BR') : "",
      source: news.source || "Farol Investe"
    }));
    
    // Verificar se a chave da API OpenAI está configurada
    if (!OPENAI_API_KEY) {
      console.error('Chave de API do OpenAI não configurada');
      throw new Error('Configuração da API OpenAI ausente');
    }
    
    // Construir a solicitação para o OpenAI incluindo as fontes
    const prompt = `
    Você é um especialista em mercados financeiros. Com base nas seguintes notícias recentes, crie um resumo completo do mercado para hoje.
    
    O resumo deve ser detalhado e abranger vários aspectos do mercado:
    1. Principais índices e sua performance (Ibovespa, S&P 500, etc)
    2. Destaques de ações brasileiras
    3. Mercado de renda fixa (juros, títulos)
    4. Câmbio (real vs. dólar e outras moedas)
    5. Commodities relevantes para o Brasil
    
    Use uma linguagem profissional mas acessível. Formate o texto em Markdown, com seções claramente separadas por títulos.
    Inclua ao final uma seção 'Fontes' listando as referências usadas.
    
    Notícias para análise:
    ${newsContent}
    `;
    
    console.log('Solicitando resumo ao OpenAI...');
    
    // Solicitar resposta do OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista financeiro especializado em criar resumos diários de mercado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API do OpenAI:', errorText);
      throw new Error('Falha na comunicação com a API do OpenAI');
    }
    
    const aiResponse = await response.json();
    let summary = aiResponse.choices[0].message.content;
    
    // Adicionar seção de fontes manualmente ao resumo se não estiver presente
    if (!summary.includes('# Fontes') && !summary.includes('## Fontes')) {
      summary += '\n\n## Fontes\n\n';
      sources.forEach(source => {
        if (source.url) {
          summary += `- [${source.title}](${source.url}) - ${source.source} (${source.date})\n`;
        } else {
          summary += `- ${source.title} - ${source.source} (${source.date})\n`;
        }
      });
    }
    
    // URL para acessar o resumo completo
    const resumoUrl = `${SUPABASE_URL}/storage/v1/object/public/market-summaries/daily-summary-${new Date().toISOString().split('T')[0]}.md`;
    
    // Persistir o resumo no banco de dados
    const { error: insertError } = await supabase
      .from('market_news')
      .insert([
        {
          title: `Resumo do Mercado: ${new Date().toLocaleDateString('pt-BR')}`,
          subtitle: 'Análise das principais movimentações do mercado financeiro',
          content: summary,
          publication_date: new Date().toISOString(),
          category: 'Resumo de Mercado',
          author: 'Farol Investe AI',
          source: 'Farol Investe',
          source_url: resumoUrl,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (insertError) {
      console.error('Erro ao salvar resumo no banco de dados:', insertError);
      throw new Error('Falha ao persistir o resumo no banco de dados');
    }
    
    console.log('Resumo diário de mercado gerado e salvo com sucesso');
    
    // Retornar resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Resumo diário de mercado gerado com sucesso',
        summary: summary.substring(0, 200) + '...'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao gerar resumo diário de mercado:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao gerar resumo',
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
