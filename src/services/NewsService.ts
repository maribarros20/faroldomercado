
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
  "Internacional",
  "Resumo de Mercado"
];

// Fontes de notícias financeiras
export const FINANCIAL_NEWS_SOURCES = [
  "InfoMoney",
  "Valor Econômico",
  "Bloomberg",
  "Bloomberg Línea",
  "CNN Money",
  "Forbes",
  "Alpha Vantage",
  "Farol Investe",
  "Twitter"
];

// Função para limpar texto de tags CDATA e HTML
export const cleanTextContent = (text?: string): string => {
  if (!text) return '';
  
  // Remove CDATA tags
  const withoutCDATA = text.replace(/(\<\!\[CDATA\[|\]\]\>)/g, '');
  
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

// Função para garantir que a URL da imagem seja válida
export const getValidImageUrl = (url?: string): string => {
  if (!url) return getDefaultNewsImage();
  
  // Verificar se a URL parece válida
  try {
    new URL(url);
    return url;
  } catch (e) {
    // Se não for uma URL válida, retornar imagem padrão
    return getDefaultNewsImage();
  }
};

// Função para obter uma imagem padrão relacionada a finanças com base na fonte
export const getDefaultNewsImage = (source?: string): string => {
  if (source) {
    switch (source) {
      case 'InfoMoney':
        return 'https://www.infomoney.com.br/wp-content/themes/infomoney/assets/img/logo-infomoney.png';
      case 'Valor Econômico':
        return 'https://www.valor.com.br/sites/all/themes/valor_2016/logo.png';
      case 'CNN Money':
        return 'https://money.cnn.com/.element/img/1.0/logos/cnnmoney_logo_144x32.png';
      case 'Bloomberg':
      case 'Bloomberg Línea':
        return 'https://assets.bbhub.io/media/sites/1/2014/05/logo.png';
      case 'Forbes':
        return 'https://cdn.worldvectorlogo.com/logos/forbes-1.svg';
      case 'Farol Investe':
        return '/lovable-uploads/08c37f81-bb96-41bd-9b6e-2ade4bae59df.png';
      case 'Twitter':
        return 'https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023.svg';
    }
  }
  
  const defaultImages = [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=2064&auto=format&fit=crop"
  ];
  
  // Selecionar uma imagem aleatória do array
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
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
      image_url: getValidImageUrl(item.image_url),
      source: 'Farol Investe'
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
      body: { 
        category,
        excludeSources: ["Reuters"] // Excluir Thomson Reuters
      }
    });
    
    if (error) {
      console.error("Erro ao buscar notícias externas:", error);
      return [];
    }
    
    // Garantir que todo o conteúdo esteja limpo de tags CDATA e HTML
    // E que todas as notícias tenham imagens válidas
    return data ? data.map((item: NewsItem) => ({
      ...item,
      title: cleanTextContent(item.title),
      subtitle: cleanTextContent(item.subtitle),
      content: cleanTextContent(item.content),
      author: cleanTextContent(item.author),
      category: cleanTextContent(item.category),
      image_url: getValidImageUrl(item.image_url),
      source_url: item.source_url || ''
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
    console.log("Iniciando fetchAllNews com categoria:", category, "e busca:", search);
    
    // Primeiro, buscar notícias da edge function fetch-news
    const { data: newsData, error: newsError } = await supabase.functions.invoke('fetch-news', {
      body: { 
        category,
        excludeSources: ["Reuters"] // Excluir fontes não desejadas
      }
    });
    
    if (newsError) {
      console.error("Erro ao buscar notícias principais:", newsError);
    }
    
    // Depois, buscar notícias do Twitter e outras redes sociais
    const { data: socialData, error: socialError } = await supabase.functions.invoke('fetch-twitter-news');
    
    if (socialError) {
      console.error("Erro ao buscar notícias de redes sociais:", socialError);
    }
    
    console.log("Notícias principais obtidas:", newsData?.length || 0);
    console.log("Notícias sociais obtidas:", socialData?.length || 0);
    
    // Combinar todas as fontes
    const allNews = [
      ...(newsData || []), 
      ...(socialData || [])
    ];
    
    // Remover duplicações por título
    const uniqueNews = Array.from(
      new Map(allNews.map(item => [item.title, item])).values()
    );
    
    // Garantir que todo o conteúdo esteja limpo de tags CDATA e HTML
    let processedNews = uniqueNews.map((item: NewsItem) => ({
      ...item,
      title: cleanTextContent(item.title),
      subtitle: cleanTextContent(item.subtitle),
      content: cleanTextContent(item.content),
      author: cleanTextContent(item.author),
      category: cleanTextContent(item.category),
      image_url: getValidImageUrl(item.image_url),
      source_url: item.source_url || ''
    }));
    
    // Filtrar por termo de busca se especificado
    if (search) {
      const searchLower = search.toLowerCase();
      processedNews = processedNews.filter(news => 
        news.title.toLowerCase().includes(searchLower) || 
        news.content.toLowerCase().includes(searchLower) || 
        news.subtitle?.toLowerCase().includes(searchLower) || 
        news.author?.toLowerCase().includes(searchLower) ||
        news.source?.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar por data (mais recentes primeiro)
    processedNews.sort((a, b) => {
      const dateA = new Date(a.publication_date || a.created_at || "").getTime();
      const dateB = new Date(b.publication_date || b.created_at || "").getTime();
      return dateB - dateA;
    });
    
    console.log(`Total de notícias após processamento: ${processedNews.length}`);
    return processedNews;
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
      source: 'Farol Investe'
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
      source: 'Farol Investe'
    };
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    return null;
  }
};
