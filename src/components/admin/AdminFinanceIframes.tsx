import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Trash2, Link, Plus, ExternalLink } from "lucide-react";
import {
  getFinanceIframes,
  createFinanceIframe,
  updateFinanceIframe,
  deleteFinanceIframe,
  FinanceIframe,
  FinanceIframeInput
} from "@/services/FinanceIframeService";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  iframe_url: z.string().url("URL inválida"),
  plan_id: z.string().optional(),
  mentor_id: z.string().optional(),
  is_active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

const AdminFinanceIframes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIframe, setSelectedIframe] = useState<FinanceIframe | null>(null);
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const [mentors, setMentors] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      iframe_url: "",
      is_active: true
    }
  });

  // Buscar planos
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

  // Buscar mentores
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

  // Buscar iframes
  const { data: iframes, isLoading, isError } = useQuery({
    queryKey: ['finance-iframes'],
    queryFn: getFinanceIframes
  });

  // Mutações para criar, atualizar e excluir iframes
  const createMutation = useMutation({
    mutationFn: (data: FinanceIframeInput) => createFinanceIframe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      toast({
        title: "Sucesso",
        description: "Iframe financeiro criado com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
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
    mutationFn: ({ id, data }: { id: string; data: Partial<FinanceIframeInput> }) => 
      updateFinanceIframe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      toast({
        title: "Sucesso",
        description: "Iframe financeiro atualizado com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
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

  // Lidar com o envio do formulário
  const onSubmit = (values: FormValues) => {
    // Garantir que title e iframe_url estão presentes
    const iframeData: FinanceIframeInput = {
      title: values.title,
      iframe_url: values.iframe_url,
      description: values.description,
      plan_id: values.plan_id,
      mentor_id: values.mentor_id,
      is_active: values.is_active
    };

    // Se estiver editando um iframe existente
    if (selectedIframe) {
      updateMutation.mutate({
        id: selectedIframe.id,
        data: iframeData
      });
    } else {
      // Criar novo iframe
      createMutation.mutate(iframeData);
    }
  };

  // Abrir o modal para editar um iframe existente
  const handleEdit = (iframe: FinanceIframe) => {
    setSelectedIframe(iframe);
    
    form.reset({
      title: iframe.title,
      description: iframe.description || "",
      iframe_url: iframe.iframe_url,
      plan_id: iframe.plan_id || undefined,
      mentor_id: iframe.mentor_id || undefined,
      is_active: iframe.is_active || true
    });
    
    setIsDialogOpen(true);
  };

  // Abrir o modal para criar um novo iframe
  const handleCreate = () => {
    setSelectedIframe(null);
    form.reset({
      title: "",
      description: "",
      iframe_url: "",
      is_active: true
    });
    setIsDialogOpen(true);
  };

  // Confirmação para excluir um iframe
  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este iframe financeiro?")) {
      deleteMutation.mutate(id);
    }
  };

  // Preview do iframe
  const handlePreview = (url: string) => {
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Erro ao carregar iframes financeiros. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planilhas Financeiras</h2>
          <p className="text-muted-foreground">
            Gerencie as planilhas financeiras que serão exibidas para os usuários de acordo com seu plano
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Planilha
        </Button>
      </div>

      {iframes && iframes.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iframes.map((iframe) => (
                <TableRow key={iframe.id}>
                  <TableCell className="font-medium">{iframe.title}</TableCell>
                  <TableCell>
                    {iframe.plans ? iframe.plans.name : "Todos os planos"}
                  </TableCell>
                  <TableCell>
                    {iframe.mentors ? iframe.mentors.name : "Todos os mentores"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      iframe.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {iframe.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(iframe.iframe_url)}
                        title="Visualizar"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(iframe)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(iframe.id)}
                        title="Excluir"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-10 border rounded-md">
          <Link className="h-10 w-10 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma planilha encontrada</h3>
          <p className="mt-1 text-muted-foreground">
            Comece adicionando uma nova planilha financeira.
          </p>
          <Button onClick={handleCreate} className="mt-4">
            Adicionar Planilha
          </Button>
        </div>
      )}

      {/* Modal de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedIframe ? "Editar Planilha Financeira" : "Nova Planilha Financeira"}
            </DialogTitle>
            <DialogDescription>
              {selectedIframe
                ? "Atualize os detalhes da planilha financeira abaixo."
                : "Preencha os detalhes da nova planilha financeira."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título da planilha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva brevemente esta planilha" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iframe_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do iframe</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      URL completa do iframe que será incorporado (ex: Google Sheets, Notion, etc).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plan_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano (opcional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Todos os planos</SelectItem>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Se não selecionar, estará disponível para todos os planos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mentor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentor (opcional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um mentor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Todos os mentores</SelectItem>
                          {mentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Se não selecionar, estará disponível para todos os mentores
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Determina se esta planilha está disponível para os usuários
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Spinner className="mr-2" />}
                  {selectedIframe ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinanceIframes;
