import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash, 
  Check,
  X,
  Package,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type PlanFeature = {
  id: string;
  text: string;
  is_included: boolean;
  plan_id: string;
}

type Plan = {
  id: string;
  name: string;
  description: string;
  monthly_price: number | null;
  yearly_price: number | null;
  is_popular: boolean;
  is_active: boolean;
  features: PlanFeature[];
  subscribers?: number;
}

const AdminPlans = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<Omit<Plan, "id" | "subscribers" | "features">>({
    name: "",
    description: "",
    monthly_price: 0,
    yearly_price: 0,
    is_popular: false,
    is_active: true
  });
  const [newFeatures, setNewFeatures] = useState<Omit<PlanFeature, "id" | "plan_id">[]>([
    { text: "Recurso 1", is_included: true },
    { text: "Recurso 2", is_included: true },
    { text: "Recurso 3", is_included: true },
    { text: "Recurso 4", is_included: false },
    { text: "Recurso 5", is_included: false }
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('monthly_price', { ascending: true });
      
      if (plansError) {
        console.error("Error fetching plans:", plansError);
        throw plansError;
      }

      const plansWithFeatures = await Promise.all(plansData.map(async (plan) => {
        const { data: featuresData, error: featuresError } = await supabase
          .from('plan_features')
          .select('*')
          .eq('plan_id', plan.id);
        
        if (featuresError) {
          console.error(`Error fetching features for plan ${plan.id}:`, featuresError);
          return { ...plan, features: [] };
        }

        const { count, error: countError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.id)
          .eq('is_active', true);
        
        return { 
          ...plan, 
          features: featuresData,
          subscribers: count || 0
        };
      }));

      return plansWithFeatures as Plan[];
    }
  });

  const addPlanMutation = useMutation({
    mutationFn: async () => {
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .insert({
          name: newPlan.name,
          description: newPlan.description,
          monthly_price: newPlan.monthly_price || null,
          yearly_price: newPlan.yearly_price || null,
          is_popular: newPlan.is_popular,
          is_active: newPlan.is_active
        })
        .select()
        .single();
      
      if (planError) throw planError;
      
      const featuresWithPlanId = newFeatures.map(feature => ({
        plan_id: planData.id,
        text: feature.text,
        is_included: feature.is_included
      }));
      
      const { error: featuresError } = await supabase
        .from('plan_features')
        .insert(featuresWithPlanId);
      
      if (featuresError) throw featuresError;
      
      return planData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsAddDialogOpen(false);
      resetNewPlan();
      
      toast({
        title: "Plano adicionado",
        description: "O plano foi adicionado com sucesso!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error adding plan:", error);
      toast({
        title: "Erro ao adicionar plano",
        description: "Ocorreu um erro ao adicionar o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const editPlanMutation = useMutation({
    mutationFn: async () => {
      if (!editingPlanId) throw new Error("No plan ID for editing");
      
      const { error: planError } = await supabase
        .from('plans')
        .update({
          name: newPlan.name,
          description: newPlan.description,
          monthly_price: newPlan.monthly_price || null,
          yearly_price: newPlan.yearly_price || null,
          is_popular: newPlan.is_popular,
          is_active: newPlan.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPlanId);
      
      if (planError) throw planError;
      
      const { error: deleteError } = await supabase
        .from('plan_features')
        .delete()
        .eq('plan_id', editingPlanId);
      
      if (deleteError) throw deleteError;
      
      const featuresWithPlanId = newFeatures.map(feature => ({
        plan_id: editingPlanId,
        text: feature.text,
        is_included: feature.is_included
      }));
      
      const { error: featuresError } = await supabase
        .from('plan_features')
        .insert(featuresWithPlanId);
      
      if (featuresError) throw featuresError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsEditDialogOpen(false);
      setEditingPlanId(null);
      resetNewPlan();
      
      toast({
        title: "Plano atualizado",
        description: "O plano foi atualizado com sucesso!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error editing plan:", error);
      toast({
        title: "Erro ao atualizar plano",
        description: "Ocorreu um erro ao atualizar o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      
      toast({
        title: "Plano removido",
        description: "O plano foi removido com sucesso!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error deleting plan:", error);
      toast({
        title: "Erro ao remover plano",
        description: "Ocorreu um erro ao remover o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      
      toast({
        title: "Status alterado",
        description: "O status do plano foi alterado com sucesso!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error toggling status:", error);
      toast({
        title: "Erro ao alterar status",
        description: "Ocorreu um erro ao alterar o status do plano. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const togglePopularMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error: resetError } = await supabase
        .from('plans')
        .update({ is_popular: false, updated_at: new Date().toISOString() });
      
      if (resetError) throw resetError;
      
      const { error } = await supabase
        .from('plans')
        .update({ is_popular: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      
      toast({
        title: "Plano destacado",
        description: "O plano foi definido como 'Popular'!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error setting popular:", error);
      toast({
        title: "Erro ao destacar plano",
        description: "Ocorreu um erro ao destacar o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleAddPlan = () => {
    addPlanMutation.mutate();
  };

  const handleEditPlan = () => {
    editPlanMutation.mutate();
  };

  const handleDeletePlan = (id: string) => {
    deletePlanMutation.mutate(id);
  };

  const handleToggleActive = (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (plan) {
      toggleActiveMutation.mutate({ id, isActive: !plan.is_active });
    }
  };

  const handleTogglePopular = (id: string) => {
    togglePopularMutation.mutate(id);
  };

  const startEditPlan = (id: string) => {
    const planToEdit = plans.find(plan => plan.id === id);
    if (!planToEdit) return;

    setNewPlan({
      name: planToEdit.name,
      description: planToEdit.description,
      monthly_price: planToEdit.monthly_price || 0,
      yearly_price: planToEdit.yearly_price || 0,
      is_popular: planToEdit.is_popular,
      is_active: planToEdit.is_active
    });

    setNewFeatures(planToEdit.features.map(feature => ({
      text: feature.text,
      is_included: feature.is_included
    })));

    setEditingPlanId(id);
    setIsEditDialogOpen(true);
  };

  const resetNewPlan = () => {
    setNewPlan({
      name: "",
      description: "",
      monthly_price: 0,
      yearly_price: 0,
      is_popular: false,
      is_active: true
    });
    
    setNewFeatures([
      { text: "Recurso 1", is_included: true },
      { text: "Recurso 2", is_included: true },
      { text: "Recurso 3", is_included: true },
      { text: "Recurso 4", is_included: false },
      { text: "Recurso 5", is_included: false }
    ]);
  };

  const handleFeatureChange = (index: number, field: 'text' | 'is_included', value: string | boolean) => {
    const updatedFeatures = [...newFeatures];
    updatedFeatures[index] = { 
      ...updatedFeatures[index], 
      [field]: value 
    };
    setNewFeatures(updatedFeatures);
  };

  const addFeature = () => {
    const newFeature = { 
      text: `Novo recurso ${newFeatures.length + 1}`, 
      is_included: false 
    };
    setNewFeatures([...newFeatures, newFeature]);
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...newFeatures];
    updatedFeatures.splice(index, 1);
    setNewFeatures(updatedFeatures);
  };

  const planFormContent = (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Plano</Label>
        <Input 
          id="name" 
          value={newPlan.name} 
          onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} 
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          value={newPlan.description} 
          onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="monthlyPrice">Preço Mensal (R$)</Label>
          <Input 
            id="monthlyPrice" 
            type="number"
            step="0.01"
            min="0"
            value={newPlan.monthly_price || ""} 
            onChange={(e) => setNewPlan({...newPlan, monthly_price: parseFloat(e.target.value) || null})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="yearlyPrice">Preço Anual (R$)</Label>
          <Input 
            id="yearlyPrice" 
            type="number"
            step="0.01"
            min="0"
            value={newPlan.yearly_price || ""} 
            onChange={(e) => setNewPlan({...newPlan, yearly_price: parseFloat(e.target.value) || null})} 
          />
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label>Recursos</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addFeature}
            className="h-8 text-xs"
          >
            <Plus size={14} className="mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-2 mt-2">
          {newFeatures.map((feature, index) => (
            <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-md">
              <div className="flex-1">
                <Input 
                  value={feature.text}
                  onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                  placeholder="Descrição do recurso"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`feature-${index}`}
                    checked={feature.is_included} 
                    onCheckedChange={(checked) => handleFeatureChange(index, 'is_included', checked)}
                  />
                  <Label htmlFor={`feature-${index}`} className="text-sm">
                    {feature.is_included ? "Incluído" : "Não incluído"}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(index)}
                  className="h-8 w-8 text-red-500"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          <p>Recursos especiais: </p>
          <ul className="ml-5 list-disc">
            <li>Para habilitar acesso às notícias do mercado, use o texto "Notícias do Mercado"</li>
            <li>Para habilitar acesso à planilha financeira, use o texto "Planilha Financeira"</li>
            <li>Para usar a planilha financeira avançada, use o texto "Planilha Financeira Avançada"</li>
            <li>Para URL personalizada da planilha, adicione nas configurações do plano</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="active"
          checked={newPlan.is_active} 
          onCheckedChange={(checked) => setNewPlan({...newPlan, is_active: checked})}
        />
        <Label htmlFor="active">Plano Ativo</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="popular"
          checked={newPlan.is_popular} 
          onCheckedChange={(checked) => setNewPlan({...newPlan, is_popular: checked})}
        />
        <Label htmlFor="popular">Destacar como Popular</Label>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Carregando planos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-2">Erro ao carregar planos</p>
        <p className="text-gray-500 text-sm">{(error as Error).message}</p>
        <Button 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['plans'] })}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Planos</h2>
          <p className="text-sm text-gray-500">Configure e gerencie os planos de assinatura</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <Plus size={16} className="mr-2" /> 
              Adicionar Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Plano</DialogTitle>
            </DialogHeader>
            {planFormContent}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddPlan} 
                disabled={!newPlan.name || !newPlan.description || addPlanMutation.isPending}
              >
                {addPlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
            </DialogHeader>
            {planFormContent}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleEditPlan} 
                disabled={!newPlan.name || !newPlan.description || editPlanMutation.isPending}
              >
                {editPlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`border-gray-200 relative overflow-hidden ${plan.is_popular ? 'ring-2 ring-trade-blue' : ''}`}>
            {plan.is_popular && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-trade-blue text-white">
                  Popular
                </span>
              </div>
            )}
            {!plan.is_active && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-white">
                  Inativo
                </span>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-trade-blue mr-2" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <span className="text-sm text-gray-500">{plan.subscribers || 0} assinantes</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {plan.monthly_price > 0 && (
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">R$ {plan.monthly_price.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm ml-1">/mês</span>
                  </div>
                )}
                {plan.yearly_price > 0 && (
                  <div>
                    <span className="text-2xl font-bold text-gray-900">R$ {plan.yearly_price.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm ml-1">/ano</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-start">
                    <div className={`mt-0.5 ${feature.is_included ? 'text-green-500' : 'text-red-500'}`}>
                      {feature.is_included ? <Check size={16} /> : <X size={16} />}
                    </div>
                    <span className={`ml-2 text-sm ${feature.is_included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex-1 ${plan.is_active ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'}`}
                  onClick={() => handleToggleActive(plan.id)}
                  disabled={toggleActiveMutation.isPending}
                >
                  {plan.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  disabled={plan.is_popular || togglePopularMutation.isPending}
                  onClick={() => handleTogglePopular(plan.id)}
                >
                  {plan.is_popular ? 'Destacado' : 'Destacar'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => startEditPlan(plan.id)}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-red-500"
                  onClick={() => handleDeletePlan(plan.id)}
                  disabled={deletePlanMutation.isPending}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Comparação de Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Recurso</TableHead>
                  {plans.filter(p => p.is_active).map((plan) => (
                    <TableHead key={plan.id} className="text-center">
                      {plan.name}
                      {plan.is_popular && <span className="ml-1 text-trade-blue">(Popular)</span>}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Preço Mensal</TableCell>
                  {plans.filter(p => p.is_active).map((plan) => (
                    <TableCell key={`${plan.id}-monthly`} className="text-center">
                      {plan.monthly_price ? `R$ ${plan.monthly_price.toFixed(2)}` : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Preço Anual</TableCell>
                  {plans.filter(p => p.is_active).map((plan) => (
                    <TableCell key={`${plan.id}-yearly`} className="text-center">
                      {plan.yearly_price ? `R$ ${plan.yearly_price.toFixed(2)}` : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
                {Array.from(new Set(plans.flatMap(plan => plan.features.map(f => f.text)))).map((featureText) => (
                  <TableRow key={featureText}>
                    <TableCell className="font-medium">{featureText}</TableCell>
                    {plans.filter(p => p.is_active).map((plan) => {
                      const feature = plan.features.find(f => f.text === featureText);
                      return (
                        <TableCell key={`${plan.id}-${featureText}`} className="text-center">
                          {feature?.is_included ? (
                            <Check className="mx-auto text-green-500" size={16} />
                          ) : (
                            <X className="mx-auto text-red-500" size={16} />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlans;
