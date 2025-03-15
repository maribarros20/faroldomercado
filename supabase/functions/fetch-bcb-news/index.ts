
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface BCBNews {
  title: string;
  content: string;
  publication_date: string;
  author?: string;
  category: string;
  image_url?: string;
  source: string;
  source_url: string;
}

// Centralized RSS feed URLs for BCB
const BCB_FEEDS = {
  'Comunicados COPOM': 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/comunicadoscopom',
  'Notícias BCB': 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/noticias?ano=2024',
  'Boletim Focus': 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/focus',
  'Relatório de Inflação': 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/ri'
};

async function fetchRSS(url: string, category: string): Promise<BCBNews[]> {
  console.log(`Buscando RSS de ${category}: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar RSS ${category}: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    
    try {
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      if (!xmlDoc) {
        console.error(`Erro ao parsear XML do RSS ${category}`);
        return [];
      }
      
      const items = xmlDoc.querySelectorAll('item');
      const news: BCBNews[] = [];
      
      items.forEach((item) => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        
        // Skip empty entries
        if (!title || !link) return;
        
        // Decode HTML entities
        const decodedTitle = decodeHtmlEntities(title);
        const decodedDescription = decodeHtmlEntities(description);
        
        news.push({
          title: decodedTitle,
          content: decodedDescription || decodedTitle,
          publication_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          category: category,
          image_url: 'https://www.bcb.gov.br/content/home/img/Logo-BC-transparente.png',
          source: 'Banco Central',
          source_url: link,
        });
      });
      
      console.log(`Obtidas ${news.length} notícias de ${category}`);
      return news;
    } catch (parseError) {
      console.error(`Erro ao processar XML do RSS ${category}:`, parseError);
      
      // Fallback: try parsing as JSON as some BCB feeds might return JSON
      try {
        const jsonData = JSON.parse(xmlText);
        
        if (Array.isArray(jsonData)) {
          const news: BCBNews[] = jsonData.map(item => ({
            title: decodeHtmlEntities(item.title || ''),
            content: decodeHtmlEntities(item.description || item.content || ''),
            publication_date: item.pubDate || item.date || new Date().toISOString(),
            category: category,
            image_url: 'https://www.bcb.gov.br/content/home/img/Logo-BC-transparente.png',
            source: 'Banco Central',
            source_url: item.link || '',
          }));
          
          console.log(`Obtidas ${news.length} notícias de ${category} via JSON fallback`);
          return news;
        }
        
        return [];
      } catch (jsonError) {
        console.error('Falha no fallback JSON:', jsonError);
        return [];
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar RSS ${category}:`, error);
    return [];
  }
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ccedil;': 'ç',
    '&atilde;': 'ã',
    '&otilde;': 'õ',
    '&acirc;': 'â',
    '&ecirc;': 'ê',
    '&ocirc;': 'ô',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ccedil;': 'Ç',
    '&Atilde;': 'Ã',
    '&Otilde;': 'Õ',
    '&Acirc;': 'Â',
    '&Ecirc;': 'Ê',
    '&Ocirc;': 'Ô'
  };
  
  return text.replace(/&[a-z0-9]+;/gi, (entity) => {
    return entities[entity] || entity;
  });
}

// Endpoint para buscar notícias do Banco Central
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando função fetch-bcb-news');
    
    let requestedCategory: string | undefined;
    
    // Se for uma requisição POST, verificar se há categoria específica
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        requestedCategory = body.category;
      } catch (e) {
        // Se não for possível parsear o corpo, ignorar
        console.error('Erro ao parsear corpo da requisição:', e);
      }
    }
    
    // Inicializar array para armazenar todas as notícias
    let allNews: BCBNews[] = [];
    
    // Se uma categoria específica foi solicitada
    if (requestedCategory && BCB_FEEDS[requestedCategory as keyof typeof BCB_FEEDS]) {
      const categoryKey = requestedCategory as keyof typeof BCB_FEEDS;
      const categoryFeed = await fetchRSS(BCB_FEEDS[categoryKey], requestedCategory);
      allNews = categoryFeed;
      console.log(`Retornando ${allNews.length} notícias da categoria ${requestedCategory}`);
    } else {
      // Buscar todas as categorias
      const fetchPromises = Object.entries(BCB_FEEDS).map(([category, url]) => 
        fetchRSS(url, category)
      );
      
      const results = await Promise.all(fetchPromises);
      allNews = results.flat();
      console.log(`Retornando ${allNews.length} notícias de todas as categorias`);
    }
    
    // Ordenar por data (mais recentes primeiro)
    allNews.sort((a, b) => {
      const dateA = new Date(a.publication_date).getTime();
      const dateB = new Date(b.publication_date).getTime();
      return dateB - dateA;
    });
    
    // Verificar se as notícias devem ser persistidas no banco de dados
    let body = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch (e) {
        // Erro ao parsear o corpo
        console.error('Erro ao parsear corpo para persistência:', e);
      }
    }
    
    if (body.persist) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log(`Tentando persistir ${allNews.length} notícias do Banco Central no banco de dados`);
      
      for (const news of allNews) {
        // Verificar se a notícia já existe
        const { data: existingNews } = await supabase
          .from('market_news')
          .select('id')
          .eq('title', news.title)
          .eq('source', 'Banco Central')
          .limit(1);
        
        if (!existingNews || existingNews.length === 0) {
          // Inserir nova notícia
          const { error } = await supabase
            .from('market_news')
            .insert([{
              title: news.title,
              content: news.content,
              publication_date: news.publication_date,
              author: 'Banco Central do Brasil',
              category: news.category,
              image_url: news.image_url,
              source: 'Banco Central',
              source_url: news.source_url,
              created_at: new Date().toISOString()
            }]);
          
          if (error) {
            console.error('Erro ao salvar notícia do Banco Central:', error);
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify(allNews),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Erro na função fetch-bcb-news:', error);
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
