
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id?: string;
  title: string;
  subtitle?: string;
  content: string;
  publication_date?: string;
  author?: string;
  category?: string;
  image_url?: string;
  source?: string; // Para diferenciar entre notícias manuais e da API
  source_url?: string; // URL original da notícia
  created_at?: string;
  updated_at?: string;
}

// Categorias de notícias
export const NEWS_CATEGORIES = [
  "Mercado de Ações",
  "Fundos de Investimento", 
  "Renda Fixa",
  "Criptomoedas",
  "Commodities",
  "Economia",
  "Negócios",
  "Tecnologia",
  "Internacional"
];

// Função para limpar texto de tags CDATA e HTML
export const cleanTextContent = (text?: string): string => {
  if (!text) return '';
  
  // Remove CDATA tags
  const withoutCDATA = text.replace(/(\[CDATA\[|\]\]>)/g, '');
  
  // Remove HTML tags but preserve content
  const withoutHTML = withoutCDATA.replace(/<[^>]*>?/gm, '');
  
  // Decode HTML entities
  return withoutHTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
};

// Função para buscar notícias manuais do Supabase
export const fetchManualNews = async (): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .order('publication_date', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar notícias manuais:", error);
      return [];
    }
    
    return data ? data.map(item => ({
      ...item,
      title: cleanTextContent(item.title),
      subtitle: cleanTextContent(item.subtitle),
      content: cleanTextContent(item.content),
      author: cleanTextContent(item.author),
      category: cleanTextContent(item.category),
      source: 'manual'
    })) : [];
  } catch (error) {
    console.error("Erro ao buscar notícias manuais:", error);
    return [];
  }
};

// Função para buscar notícias de APIs externas e RSS feeds
export const fetchExternalNews = async (category?: string): Promise<NewsItem[]> => {
  try {
    // Chamada para a edge function que lida com as integrações externas
    const { data, error } = await supabase.functions.invoke('fetch-news', {
      body: { category }
    });
    
    if (error) {
      console.error("Erro ao buscar notícias externas:", error);
      return [];
    }
    
    // Garantir que todo o conteúdo esteja limpo de tags CDATA e HTML
    return data ? data.map((item: NewsItem) => ({
      ...item,
      title: cleanTextContent(item.title),
      subtitle: cleanTextContent(item.subtitle),
      content: cleanTextContent(item.content),
      author: cleanTextContent(item.author),
      category: cleanTextContent(item.category)
    })) : [];
  } catch (error) {
    console.error("Erro ao buscar notícias externas:", error);
    return [];
  }
};

// Buscar todas as notícias (manuais + APIs + RSS)
export const fetchAllNews = async (
  category?: string, 
  search?: string
): Promise<NewsItem[]> => {
  try {
    const [manualNews, externalNews] = await Promise.all([
      fetchManualNews(),
      fetchExternalNews(category)
    ]);
    
    // Combinar e ordenar por data de publicação (mais recentes primeiro)
    let allNews = [...manualNews, ...externalNews].sort((a, b) => {
      return new Date(b.publication_date || b.created_at || '').getTime() - 
             new Date(a.publication_date || a.created_at || '').getTime();
    });
    
    // Filtrar por categoria se especificada
    if (category && category !== 'all') {
      allNews = allNews.filter(news => 
        news.category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Filtrar por termo de busca se especificado
    if (search) {
      const searchLower = search.toLowerCase();
      allNews = allNews.filter(news => 
        news.title.toLowerCase().includes(searchLower) || 
        news.content.toLowerCase().includes(searchLower) || 
        news.subtitle?.toLowerCase().includes(searchLower) || 
        news.author?.toLowerCase().includes(searchLower)
      );
    }
    
    return allNews;
  } catch (error) {
    console.error("Erro ao buscar todas as notícias:", error);
    return [];
  }
};

// Criar uma nova notícia manual
export const createNews = async (newsData: NewsItem): Promise<NewsItem> => {
  try {
    const { data, error } = await supabase
      .from('market_news')
      .insert([{
        title: newsData.title,
        subtitle: newsData.subtitle,
        content: newsData.content,
        publication_date: newsData.publication_date || new Date().toISOString(),
        author: newsData.author,
        category: newsData.category,
        image_url: newsData.image_url,
        source_url: newsData.source_url,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar notícia:", error);
      throw error;
    }
    
    return {
      ...data,
      source: 'manual'
    };
  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    throw error;
  }
};

// Atualizar uma notícia existente
export const updateNews = async (id: string, newsData: Partial<NewsItem>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('market_news')
      .update({
        title: newsData.title,
        subtitle: newsData.subtitle,
        content: newsData.content,
        publication_date: newsData.publication_date,
        author: newsData.author,
        category: newsData.category,
        image_url: newsData.image_url,
        source_url: newsData.source_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao atualizar notícia:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    throw error;
  }
};

// Excluir uma notícia
export const deleteNews = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('market_news')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao excluir notícia:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    throw error;
  }
};

// Buscar uma notícia específica por ID
export const getNewsById = async (id: string): Promise<NewsItem | null> => {
  try {
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar notícia:", error);
      throw error;
    }
    
    return {
      ...data,
      source: 'manual'
    };
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    return null;
  }
};
