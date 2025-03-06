
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Plus, Edit, Trash, ExternalLink, Filter, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FinanceIframeService, { FinanceIframe } from "@/services/FinanceIframeService";

type FinanceSpreadsheetProps = {
  spreadsheetUrl?: string;
};

const FinanceSpreadsheet = ({ spreadsheetUrl }: FinanceSpreadsheetProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [iframePreviewOpen, setIframePreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mentorFilter, setMentorFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [selectedIframe, setSelectedIframe] = useState<FinanceIframe | null>(null);
  const [newIframe, setNewIframe] = useState({
    title: "",
    description: "",
    iframe_url: "",
    mentor_id: "",
    plan_id: "",
    is_active: true
  });
  const [mentors, setMentors] = useState<Array<{ id: string; name: string }>>([]);
  const [plans, setPlans] = useState<Array<{ id: string; name: string }>>([]);
  const refreshIntervalRef = useRef<number | null>(null);
  const iframePreviewRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6m3cCvBxXqCkVjpWyg73Q426GFTHnmVq7tEZ-G4X4XBe6rg-5_eU8Z-574HOEo1qqyhS0dwWJVVIR/pubhtml?gid=2095335592&amp;single=true&amp;widget=true&amp;headers=false";

  // Buscar os iframes financeiros
  const { 
    data: iframes = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['finance-iframes'],
    queryFn: async () => {
      return await FinanceIframeService.getIframes();
    }
  });

  // Buscar mentores e planos
  useEffect(() => {
    const fetchMentorsAndPlans = async () => {
      try {
        // Buscar mentores
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('mentors')
          .select('id, name')
          .order('name');
          
        if (mentorsError) {
          console.error("Erro ao buscar mentores:", mentorsError);
          return;
        }
        
        setMentors(mentorsData || []);
        
        // Buscar planos
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('id, name')
          .order('name');
          
        if (plansError) {
          console.error("Erro ao buscar planos:", plansError);
          return;
        }
        
        setPlans(plansData || []);
      } catch (error) {
        console.error("Erro ao buscar mentores e planos:", error);
      }
    };
    
    fetchMentorsAndPlans();
  }, []);

  // Mutation para adicionar iframe
  const addIframeMutation = useMutation({
    mutationFn: async (iframeData: any) => {
      return await FinanceIframeService.createIframe(iframeData);
    },
    onSuccess: () => {
      // Reset form and refetch data
      setNewIframe({
        title: "",
        description: "",
        iframe_url: "",
        mentor_id: "",
        plan_id: "",
        is_active: true
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      
      toast({
        title: "Iframe adicionado",
        description: "O iframe foi adicionado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar iframe",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar iframe
  const updateIframeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await FinanceIframeService.updateIframe(id, data);
    },
    onSuccess: () => {
      setSelectedIframe(null);
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      
      toast({
        title: "Iframe atualizado",
        description: "O iframe foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar iframe",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para excluir iframe
  const deleteIframeMutation = useMutation({
    mutationFn: async (id: string) => {
      await FinanceIframeService.deleteIframe(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['finance-iframes'] });
      
      toast({
        title: "Iframe removido",
        description: "O iframe foi removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover iframe",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Function to refresh the iframe
  const refreshIframe = () => {
    if (iframePreviewRef.current) {
      // Add timestamp to avoid caching
      const timestamp = new Date().getTime();
      const currentSrc = iframePreviewRef.current.src;
      const baseUrl = currentSrc.split('?')[0];
      
      // Update iframe src
      iframePreviewRef.current.src = `${baseUrl}?timestamp=${timestamp}`;
      
      toast({
        title: "Visualização atualizada",
        description: "A visualização do iframe foi atualizada com sucesso",
      });
    }
  };

  // Set up automatic refresh every 5 minutes for preview
  useEffect(() => {
    if (iframePreviewOpen && selectedIframe) {
      // Refresh immediately when iframe opens
      refreshIframe();
      
      // Set up interval for refreshing every 5 minutes
      refreshIntervalRef.current = window.setInterval(() => {
        refreshIframe();
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    }
    
    // Clear interval when component unmounts or iframe closes
    return () => {
      if (refreshIntervalRef.current !== null) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [iframePreviewOpen, selectedIframe]);

  // Handle add iframe
  const handleAddIframe = () => {
    if (!newIframe.title || !newIframe.iframe_url) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha os campos obrigatórios (título e URL do iframe).",
        variant: "destructive",
      });
      return;
    }
    
    addIframeMutation.mutate({
      title: newIframe.title,
      description: newIframe.description,
      iframe_url: newIframe.iframe_url,
      mentor_id: newIframe.mentor_id || null,
      plan_id: newIframe.plan_id || null,
      is_active: newIframe.is_active
    });
  };

  // Handle edit iframe
  const handleEditIframe = (iframe: FinanceIframe) => {
    setSelectedIframe(iframe);
    setIsEditDialogOpen(true);
  };

  // Handle update iframe
  const handleUpdateIframe = () => {
    if (!selectedIframe) return;
    
    if (!selectedIframe.title || !selectedIframe.iframe_url) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha os campos obrigatórios (título e URL do iframe).",
        variant: "destructive",
      });
      return;
    }
    
    updateIframeMutation.mutate({
      id: selectedIframe.id,
      data: {
        title: selectedIframe.title,
        description: selectedIframe.description,
        iframe_url: selectedIframe.iframe_url,
        mentor_id: selectedIframe.mentor_id,
        plan_id: selectedIframe.plan_id,
        is_active: selectedIframe.is_active
      }
    });
  };

  // Handle delete iframe
  const handleDeleteIframe = (id: string) => {
    deleteIframeMutation.mutate(id);
  };

  // Open iframe preview
  const openIframePreview = (iframe: FinanceIframe) => {
    setSelectedIframe(iframe);
    setIframePreviewOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setMentorFilter('');
    setPlanFilter('');
  };

  // Filtered iframes based on search and filters
  const filteredIframes = iframes.filter(iframe => {
    const matchesSearch = searchTerm === "" || 
      iframe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (iframe.description && iframe.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMentor = mentorFilter === "" || iframe.mentor_id === mentorFilter;
    const matchesPlan = planFilter === "" || iframe.plan_id === planFilter;
    
    return matchesSearch && matchesMentor && matchesPlan;
  });

  // Get mentor name
  const getMentorName = (mentorId: string | null) => {
    if (!mentorId) return "Nenhum mentor";
    const mentor = mentors.find(m => m.id === mentorId);
    return mentor ? mentor.name : "Mentor desconhecido";
  };

  // Get plan name
  const getPlanName = (planId: string | null) => {
    if (!planId) return "Todos os planos";
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : "Plano desconhecido";
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Planilhas Financeiras</h2>
          <p className="text-sm text-gray-500">Gerencie os iframes de planilhas financeiras associados a mentores e planos</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <Plus size={16} className="mr-2" /> 
              Adicionar Iframe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Iframe</DialogTitle>
              <DialogDescription>
                Preencha os campos para adicionar um novo iframe de planilha financeira.
                Associe a um mentor e plano específico se desejar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input 
                  id="title" 
                  value={newIframe.title} 
                  onChange={(e) => setNewIframe({...newIframe, title: e.target.value})} 
                  placeholder="Ex: Planilha de Análise Fundamentalista"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  value={newIframe.description || ''} 
                  onChange={(e) => setNewIframe({...newIframe, description: e.target.value})} 
                  placeholder="Descreva brevemente o conteúdo desta planilha"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iframe_url">URL do Iframe *</Label>
                <Input 
                  id="iframe_url" 
                  value={newIframe.iframe_url} 
                  onChange={(e) => setNewIframe({...newIframe, iframe_url: e.target.value})} 
                  placeholder="Ex: https://docs.google.com/spreadsheets/d/e/2PACX..."
                />
                <p className="text-xs text-muted-foreground">
                  Cole aqui a URL completa do iframe (Google Sheets, Airtable, etc)
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mentor">Mentor (opcional)</Label>
                <Select 
                  value={newIframe.mentor_id} 
                  onValueChange={(value) => setNewIframe({...newIframe, mentor_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associar a um mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum mentor específico</SelectItem>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>{mentor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Se especificado, apenas este mentor terá acesso a esta planilha
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="plan">Plano (opcional)</Label>
                <Select 
                  value={newIframe.plan_id} 
                  onValueChange={(value) => setNewIframe({...newIframe, plan_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associar a um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Disponível para todos os planos</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Se especificado, apenas usuários com este plano terão acesso a esta planilha
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  checked={newIframe.is_active}
                  onCheckedChange={(checked) => setNewIframe({...newIframe, is_active: checked})}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddIframe} 
                disabled={!newIframe.title || !newIframe.iframe_url || addIframeMutation.isPending}
              >
                {addIframeMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Adicionando...
                  </>
                ) : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Lista de Iframes de Planilhas Financeiras</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  className="pl-10 py-2 border-gray-200" 
                  placeholder="Buscar iframes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={mentorFilter} onValueChange={setMentorFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por Mentor" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Mentores</SelectItem>
                  <SelectItem value="null">Sem Mentor</SelectItem>
                  {mentors.map(mentor => (
                    <SelectItem key={mentor.id} value={mentor.id}>{mentor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por Plano" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Planos</SelectItem>
                  <SelectItem value="null">Sem Plano</SelectItem>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Spinner className="h-10 w-10 mx-auto mb-4" />
                <p>Carregando iframes...</p>
              </div>
            </div>
          ) : iframes.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <ExternalLink className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Nenhum iframe cadastrado</h3>
              <p className="text-gray-500 mt-2 mb-4">
                Ainda não há iframes de planilhas financeiras cadastrados no sistema.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus size={16} className="mr-2" /> 
                Adicionar Primeiro Iframe
              </Button>
            </div>
          ) : filteredIframes.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <ExternalLink className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Nenhum iframe encontrado</h3>
              <p className="text-gray-500 mt-2 mb-4">
                Não há iframes que correspondam aos filtros aplicados.
              </p>
              <Button 
                variant="link" 
                onClick={clearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Título</TableHead>
                    <TableHead className="hidden md:table-cell">Mentor</TableHead>
                    <TableHead className="hidden md:table-cell">Plano</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Data Criação</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIframes.map((iframe) => (
                    <TableRow key={iframe.id}>
                      <TableCell>
                        <div className="font-medium">{iframe.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 md:hidden">
                          Mentor: {getMentorName(iframe.mentor_id)}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1 md:hidden">
                          Plano: {getPlanName(iframe.plan_id)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getMentorName(iframe.mentor_id)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getPlanName(iframe.plan_id)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={iframe.is_active ? "default" : "outline"} className={iframe.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                          {iframe.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(iframe.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600"
                            onClick={() => openIframePreview(iframe)}
                            title="Visualizar iframe"
                          >
                            <ExternalLink size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditIframe(iframe)}
                            title="Editar iframe"
                          >
                            <Edit size={16} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-red-500"
                                title="Excluir iframe"
                              >
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o iframe "{iframe.title}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteIframe(iframe.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {deleteIframeMutation.isPending && iframe.id === deleteIframeMutation.variables ? (
                                    <>
                                      <Spinner className="mr-2 h-4 w-4" />
                                      Excluindo...
                                    </>
                                  ) : "Excluir"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para visualização do iframe */}
      {selectedIframe && (
        <Dialog open={iframePreviewOpen} onOpenChange={setIframePreviewOpen}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle>{selectedIframe.title}</DialogTitle>
                {selectedIframe.description && (
                  <DialogDescription>{selectedIframe.description}</DialogDescription>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshIframe}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </DialogHeader>
            
            <div className="flex-grow overflow-hidden">
              <iframe 
                ref={iframePreviewRef}
                src={selectedIframe.iframe_url}
                width="100%" 
                height="100%"
                frameBorder="0"
                title={selectedIframe.title}
                className="min-w-full"
              ></iframe>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="default" 
                onClick={() => setIframePreviewOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para edição de iframe */}
      {selectedIframe && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Iframe</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do iframe de planilha financeira.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input 
                  id="edit-title" 
                  value={selectedIframe.title} 
                  onChange={(e) => setSelectedIframe({...selectedIframe, title: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedIframe.description || ''} 
                  onChange={(e) => setSelectedIframe({...selectedIframe, description: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-iframe_url">URL do Iframe *</Label>
                <Input 
                  id="edit-iframe_url" 
                  value={selectedIframe.iframe_url} 
                  onChange={(e) => setSelectedIframe({...selectedIframe, iframe_url: e.target.value})} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-mentor">Mentor (opcional)</Label>
                <Select 
                  value={selectedIframe.mentor_id || ""}
                  onValueChange={(value) => setSelectedIframe({...selectedIframe, mentor_id: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associar a um mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum mentor específico</SelectItem>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>{mentor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-plan">Plano (opcional)</Label>
                <Select 
                  value={selectedIframe.plan_id || ""}
                  onValueChange={(value) => setSelectedIframe({...selectedIframe, plan_id: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associar a um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Disponível para todos os planos</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-is_active" 
                  checked={selectedIframe.is_active}
                  onCheckedChange={(checked) => setSelectedIframe({...selectedIframe, is_active: checked})}
                />
                <Label htmlFor="edit-is_active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedIframe(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateIframe}
                disabled={!selectedIframe.title || !selectedIframe.iframe_url || updateIframeMutation.isPending}
              >
                {updateIframeMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Atualizando...
                  </>
                ) : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FinanceSpreadsheet;
