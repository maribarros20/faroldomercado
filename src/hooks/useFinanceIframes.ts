import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  getFinanceIframes,
  createFinanceIframe,
  updateFinanceIframe,
  deleteFinanceIframe,
  FinanceIframe,
  FinanceIframeInput
} from "@/services/FinanceIframeService";

export const useFinanceIframes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIframe, setSelectedIframe] = useState<FinanceIframe | null>(null);
  const [plans, setPlans] = useState<{ id: string; name: string; is_mentor_plan?: boolean; mentor_id?: string | null }[]>([]);
  const [mentors, setMentors] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plans with error handling - Ensure is_mentor_plan is included in the select
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('id, name, is_mentor_plan, mentor_id')
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos",
          variant: "destructive"
        });
      }
    };

    fetchPlans();
  }, [toast]);

  // Fetch mentors with error handling
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setMentors(data || []);
      } catch (error) {
        console.error('Erro ao buscar mentores:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os mentores",
          variant: "destructive"
        });
      }
    };

    fetchMentors();
  }, [toast]);

  // Query to fetch iframes
  const { data: iframes, isLoading, isError, refetch } = useQuery({
    queryKey: ['finance-iframes'],
    queryFn: getFinanceIframes,
    meta: {
      onError: (error: Error) => {
        console.error('Erro ao buscar iframes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os iframes financeiros. Verifique suas permissões.",
          variant: "destructive"
        });
      }
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      // Extract account_type from the form data (it's not in the model)
      const { account_type, ...iframeData } = data;
      
      // Processar valores nulos/undefined para campos opcionais
      const processedData = {
        ...iframeData,
        plan_id: iframeData.plan_id === "null" ? null : iframeData.plan_id,
        mentor_id: account_type === "aluno" ? iframeData.mentor_id : null,
        is_active: iframeData.is_active !== undefined ? iframeData.is_active : true
      };
      
      return createFinanceIframe(processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      toast({
        title: "Sucesso",
        description: "Iframe financeiro criado com sucesso",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error('Erro ao criar iframe:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o iframe. Verifique suas permissões.",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      // Extract account_type from the form data (it's not in the model)
      const { account_type, ...iframeData } = data;
      
      // Processar valores nulos/undefined para campos opcionais
      const processedData = {
        ...iframeData,
        plan_id: iframeData.plan_id === "null" ? null : iframeData.plan_id,
        mentor_id: account_type === "aluno" ? iframeData.mentor_id : null
      };
      
      return updateFinanceIframe(id, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      toast({
        title: "Sucesso",
        description: "Iframe financeiro atualizado com sucesso",
      });
      setIsDialogOpen(false);
      setSelectedIframe(null);
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar iframe:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o iframe. Verifique suas permissões.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFinanceIframe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      toast({
        title: "Sucesso",
        description: "Iframe financeiro excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao excluir iframe:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o iframe. Verifique suas permissões.",
        variant: "destructive"
      });
    }
  });

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedIframe(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((iframe: FinanceIframe) => {
    setSelectedIframe(iframe);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este iframe financeiro?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleSubmit = useCallback((values: any) => {
    console.log("Submitting values:", values);
    
    if (selectedIframe) {
      updateMutation.mutate({
        id: selectedIframe.id,
        data: values
      });
    } else {
      createMutation.mutate(values);
    }
  }, [selectedIframe, updateMutation, createMutation]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedIframe(null);
  }, []);

  const handlePreview = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  return {
    iframes,
    isLoading,
    isError,
    plans,
    mentors,
    isDialogOpen,
    setIsDialogOpen,
    selectedIframe,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleCancel,
    handlePreview,
    refetch
  };
};
