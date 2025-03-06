
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

// Função para buscar notícias manuais do Supabase
export const fetchManualNews = async (): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from('market_news')
      .select('*')
      .order('publication_date', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar notícias manuais:", error);
      throw error;
    }
    
    return data.map(item => ({
      ...item,
      source: 'manual'
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias manuais:", error);
    throw error;
  }
};

// Função para buscar notícias de APIs externas
export const fetchExternalNews = async (): Promise<NewsItem[]> => {
  try {
    // Exemplo usando API gratuita do marketaux.com (limitada, mas útil para demonstração)
    // Em produção, seria necessário substituir por uma API mais robusta
    const response = await fetch(
      'https://api.marketaux.com/v1/news/all?symbols=AAPL,TSLA,MSFT&filter_entities=true&language=pt&api_token=demo'
    );
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformar os dados da API no formato esperado
    return data.data.map((item: any) => ({
      id: `ext-${item.uuid || Math.random().toString(36).substring(2, 15)}`,
      title: item.title,
      subtitle: item.description,
      content: item.snippet,
      publication_date: item.published_at,
      author: item.source,
      category: "Mercado de Ações",
      image_url: item.image_url,
      source: 'api',
      created_at: item.published_at,
      updated_at: item.published_at
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias externas:", error);
    // Retornar array vazio em caso de erro, para não quebrar a aplicação
    return [];
  }
};

// Buscar todas as notícias (manuais + APIs)
export const fetchAllNews = async (): Promise<NewsItem[]> => {
  try {
    const [manualNews, externalNews] = await Promise.all([
      fetchManualNews(),
      fetchExternalNews()
    ]);
    
    // Combinar e ordenar por data de publicação (mais recentes primeiro)
    return [...manualNews, ...externalNews].sort((a, b) => {
      return new Date(b.publication_date || b.created_at || '').getTime() - 
             new Date(a.publication_date || a.created_at || '').getTime();
    });
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
