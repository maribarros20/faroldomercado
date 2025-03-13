
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { NewsItem } from "@/services/NewsService";
import type { UseMutationResult } from "@tanstack/react-query";

interface UseNewsUtilsProps {
  formData: NewsItem;
  isEditing: boolean;
  selectedNewsId: string | null;
  newsList?: NewsItem[];
  setFormData: (data: NewsItem) => void;
  resetForm: () => void;
  createNewsMutation: UseMutationResult<any, Error, NewsItem>;
  updateNewsMutation: UseMutationResult<any, Error, { id: string; data: NewsItem }>;
}

export const useNewsUtils = ({
  formData,
  isEditing,
  selectedNewsId,
  newsList,
  setFormData,
  resetForm,
  createNewsMutation,
  updateNewsMutation
}: UseNewsUtilsProps) => {
  const { toast } = useToast();

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
    handleChange,
    handleCategoryChange,
    handleSubmit,
    handleCreate,
    handleGenerateMarketSummary,
    getCategoryNewsCount
  };
};
