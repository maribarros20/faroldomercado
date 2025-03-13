
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  createNews, 
  updateNews, 
  deleteNews, 
  getNewsById, 
  fetchManualNews 
} from "@/services/NewsService";
import type { NewsItem } from "@/services/NewsService";

export const useNewsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsItem>({
    title: "",
    subtitle: "",
    content: "",
    author: "",
    category: "",
    image_url: "",
    source_url: "",
    publication_date: new Date().toISOString()
  });

  const { 
    data: newsList, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['admin-news'],
    queryFn: fetchManualNews
  });

  const createNewsMutation = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      toast({
        title: "Notícia criada com sucesso",
        description: "A notícia foi publicada e já está disponível para os usuários",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar notícia",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: NewsItem }) => 
      updateNews(id, data),
    onSuccess: () => {
      toast({
        title: "Notícia atualizada com sucesso",
        description: "As alterações foram salvas e publicadas",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar notícia",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      toast({
        title: "Notícia excluída com sucesso",
        description: "A notícia foi removida permanentemente",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir notícia",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const loadNewsForEdit = async (id: string) => {
    try {
      const news = await getNewsById(id);
      if (news) {
        setFormData({
          title: news.title || "",
          subtitle: news.subtitle || "",
          content: news.content || "",
          author: news.author || "",
          category: news.category || "",
          image_url: news.image_url || "",
          source_url: news.source_url || "",
          publication_date: news.publication_date || new Date().toISOString()
        });
        setSelectedNewsId(id);
        setIsEditing(true);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar notícia",
        description: "Não foi possível carregar os dados da notícia para edição",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      author: "",
      category: "",
      image_url: "",
      source_url: "",
      publication_date: new Date().toISOString()
    });
    setSelectedNewsId(null);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, conteúdo e categoria são campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (isEditing && selectedNewsId) {
      updateNewsMutation.mutate({ id: selectedNewsId, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleGenerateMarketSummary = async () => {
    try {
      toast({
        title: "Gerando resumo do mercado",
        description: "Aguarde enquanto geramos o resumo do mercado para o dia de hoje.",
      });
      
      const { data, error } = await supabase.functions.invoke('daily-market-summary');
      
      if (error) {
        throw new Error('Erro ao gerar resumo: ' + error.message);
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      
      toast({
        title: data.success ? "Resumo gerado com sucesso" : "Aviso",
        description: data.message,
      });
      
    } catch (error) {
      console.error("Erro ao gerar resumo do mercado:", error);
      toast({
        title: "Erro ao gerar resumo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  // Agrupa as notícias por categoria
  const getCategoryNewsCount = () => {
    if (!newsList) return {};
    
    return newsList.reduce((acc: Record<string, number>, news) => {
      const category = news.category || 'Sem categoria';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  };

  return {
    newsList,
    isLoading,
    formData,
    isEditing,
    selectedNewsId,
    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
    handleChange,
    handleCategoryChange,
    resetForm,
    handleCreate,
    handleSubmit,
    loadNewsForEdit,
    refetch,
    handleGenerateMarketSummary,
    getCategoryNewsCount
  };
};
