
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
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const [mentors, setMentors] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('id, name')
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

  // Fetch mentors
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
  const { data: iframes, isLoading, isError } = useQuery({
    queryKey: ['finance-iframes'],
    queryFn: getFinanceIframes
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FinanceIframeInput) => {
      // Convert "null" string to undefined for optional fields
      const processedData = {
        ...data,
        plan_id: data.plan_id === "null" ? undefined : data.plan_id,
        mentor_id: data.mentor_id === "null" ? undefined : data.mentor_id
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
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinanceIframeInput> }) => {
      // Convert "null" string to undefined for optional fields
      const processedData = {
        ...data,
        plan_id: data.plan_id === "null" ? undefined : data.plan_id,
        mentor_id: data.mentor_id === "null" ? undefined : data.mentor_id
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
      toast({
        title: "Erro",
        description: error.message,
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
      toast({
        title: "Erro",
        description: error.message,
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

  const handleSubmit = useCallback((values: FinanceIframeInput) => {
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
  };
};
