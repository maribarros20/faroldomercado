
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  createNews, 
  updateNews, 
  deleteNews, 
  getNewsById, 
  fetchManualNews 
} from "@/services/NewsService";
import type { NewsItem } from "@/services/NewsService";

interface UseNewsCrudProps {
  resetForm: () => void;
  setFormData: (data: NewsItem) => void;
  setIsEditing: (isEditing: boolean) => void;
  setSelectedNewsId: (id: string | null) => void;
}

export const useNewsCrud = ({
  resetForm,
  setFormData,
  setIsEditing,
  setSelectedNewsId
}: UseNewsCrudProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    newsList,
    isLoading,
    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
    refetch,
    loadNewsForEdit
  };
};
