
import { useState } from "react";
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
  Package
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

// Plan type
type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: {
    id: string;
    text: string;
    included: boolean;
  }[];
  isPopular: boolean;
  isActive: boolean;
  subscribers: number;
};

// Sample data
const samplePlans: Plan[] = [
  {
    id: "1",
    name: "Básico",
    description: "Ideal para iniciantes que querem aprender os fundamentos do trading",
    monthlyPrice: 49.90,
    yearlyPrice: 499.00,
    features: [
      { id: "1-1", text: "Acesso aos materiais básicos", included: true },
      { id: "1-2", text: "Vídeos introdutórios", included: true },
      { id: "1-3", text: "Suporte por email", included: true },
      { id: "1-4", text: "Comunidade exclusiva", included: false },
      { id: "1-5", text: "Webinars ao vivo", included: false }
    ],
    isPopular: false,
    isActive: true,
    subscribers: 145
  },
  {
    id: "2",
    name: "Premium Mensal",
    description: "Para traders que buscam aprimorar suas estratégias",
    monthlyPrice: 99.90,
    yearlyPrice: 999.00,
    features: [
      { id: "2-1", text: "Acesso a todos os materiais", included: true },
      { id: "2-2", text: "Biblioteca completa de vídeos", included: true },
      { id: "2-3", text: "Suporte prioritário", included: true },
      { id: "2-4", text: "Comunidade exclusiva", included: true },
      { id: "2-5", text: "Webinars ao vivo", included: false }
    ],
    isPopular: true,
    isActive: true,
    subscribers: 320
  },
  {
    id: "3",
    name: "Premium Anual",
    description: "A melhor opção para traders comprometidos com seu desenvolvimento",
    monthlyPrice: 0,
    yearlyPrice: 997.00,
    features: [
      { id: "3-1", text: "Acesso a todos os materiais", included: true },
      { id: "3-2", text: "Biblioteca completa de vídeos", included: true },
      { id: "3-3", text: "Suporte prioritário 24/7", included: true },
      { id: "3-4", text: "Comunidade exclusiva", included: true },
      { id: "3-5", text: "Webinars ao vivo", included: true }
    ],
    isPopular: false,
    isActive: true,
    subscribers: 78
  }
];

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>(samplePlans);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<Omit<Plan, "id" | "subscribers">>({
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { id: "new-1", text: "Recurso 1", included: true },
      { id: "new-2", text: "Recurso 2", included: true },
      { id: "new-3", text: "Recurso 3", included: true },
      { id: "new-4", text: "Recurso 4", included: false },
      { id: "new-5", text: "Recurso 5", included: false }
    ],
    isPopular: false,
    isActive: true
  });
  const { toast } = useToast();

  const handleAddPlan = () => {
    const plan: Plan = {
      id: (plans.length + 1).toString(),
      name: newPlan.name,
      description: newPlan.description,
      monthlyPrice: newPlan.monthlyPrice,
      yearlyPrice: newPlan.yearlyPrice,
      features: newPlan.features,
      isPopular: newPlan.isPopular,
      isActive: newPlan.isActive,
      subscribers: 0
    };

    setPlans([...plans, plan]);
    setIsAddDialogOpen(false);
    resetNewPlan();

    toast({
      title: "Plano adicionado",
      description: "O plano foi adicionado com sucesso!",
      variant: "default",
    });
  };

  const handleEditPlan = () => {
    if (!editingPlanId) return;

    setPlans(plans.map(plan => 
      plan.id === editingPlanId 
        ? { 
            ...plan, 
            name: newPlan.name,
            description: newPlan.description,
            monthlyPrice: newPlan.monthlyPrice,
            yearlyPrice: newPlan.yearlyPrice,
            features: newPlan.features,
            isPopular: newPlan.isPopular,
            isActive: newPlan.isActive
          } 
        : plan
    ));
    
    setIsEditDialogOpen(false);
    setEditingPlanId(null);
    resetNewPlan();

    toast({
      title: "Plano atualizado",
      description: "O plano foi atualizado com sucesso!",
      variant: "default",
    });
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(plan => plan.id !== id));
    
    toast({
      title: "Plano removido",
      description: "O plano foi removido com sucesso!",
      variant: "default",
    });
  };

  const handleToggleActive = (id: string) => {
    setPlans(plans.map(plan => 
      plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
    ));

    toast({
      title: "Status alterado",
      description: "O status do plano foi alterado com sucesso!",
      variant: "default",
    });
  };

  const handleTogglePopular = (id: string) => {
    // Only one plan can be popular at a time
    setPlans(plans.map(plan => 
      plan.id === id 
        ? { ...plan, isPopular: true } 
        : { ...plan, isPopular: false }
    ));

    toast({
      title: "Plano destacado",
      description: "O plano foi definido como 'Popular'!",
      variant: "default",
    });
  };

  const startEditPlan = (id: string) => {
    const planToEdit = plans.find(plan => plan.id === id);
    if (!planToEdit) return;

    setNewPlan({
      name: planToEdit.name,
      description: planToEdit.description,
      monthlyPrice: planToEdit.monthlyPrice,
      yearlyPrice: planToEdit.yearlyPrice,
      features: [...planToEdit.features],
      isPopular: planToEdit.isPopular,
      isActive: planToEdit.isActive
    });

    setEditingPlanId(id);
    setIsEditDialogOpen(true);
  };

  const resetNewPlan = () => {
    setNewPlan({
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { id: "new-1", text: "Recurso 1", included: true },
        { id: "new-2", text: "Recurso 2", included: true },
        { id: "new-3", text: "Recurso 3", included: true },
        { id: "new-4", text: "Recurso 4", included: false },
        { id: "new-5", text: "Recurso 5", included: false }
      ],
      isPopular: false,
      isActive: true
    });
  };

  const handleFeatureChange = (index: number, field: 'text' | 'included', value: string | boolean) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures[index] = { 
      ...updatedFeatures[index], 
      [field]: value 
    };
    setNewPlan({ ...newPlan, features: updatedFeatures });
  };

  const addFeature = () => {
    const newFeature = { 
      id: `new-${newPlan.features.length + 1}`, 
      text: `Novo recurso ${newPlan.features.length + 1}`, 
      included: false 
    };
    setNewPlan({ ...newPlan, features: [...newPlan.features, newFeature] });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures.splice(index, 1);
    setNewPlan({ ...newPlan, features: updatedFeatures });
  };

  // Content for Add/Edit plan dialog
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
            value={newPlan.monthlyPrice} 
            onChange={(e) => setNewPlan({...newPlan, monthlyPrice: parseFloat(e.target.value) || 0})} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="yearlyPrice">Preço Anual (R$)</Label>
          <Input 
            id="yearlyPrice" 
            type="number"
            step="0.01"
            min="0"
            value={newPlan.yearlyPrice} 
            onChange={(e) => setNewPlan({...newPlan, yearlyPrice: parseFloat(e.target.value) || 0})} 
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
          {newPlan.features.map((feature, index) => (
            <div key={feature.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
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
                    checked={feature.included} 
                    onCheckedChange={(checked) => handleFeatureChange(index, 'included', checked)}
                  />
                  <Label htmlFor={`feature-${index}`} className="text-sm">
                    {feature.included ? "Incluído" : "Não incluído"}
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
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="active"
          checked={newPlan.isActive} 
          onCheckedChange={(checked) => setNewPlan({...newPlan, isActive: checked})}
        />
        <Label htmlFor="active">Plano Ativo</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="popular"
          checked={newPlan.isPopular} 
          onCheckedChange={(checked) => setNewPlan({...newPlan, isPopular: checked})}
        />
        <Label htmlFor="popular">Destacar como Popular</Label>
      </div>
    </div>
  );

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
                disabled={!newPlan.name || !newPlan.description}
              >
                Adicionar
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
                disabled={!newPlan.name || !newPlan.description}
              >
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`border-gray-200 relative overflow-hidden ${plan.isPopular ? 'ring-2 ring-trade-blue' : ''}`}>
            {plan.isPopular && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-trade-blue text-white">
                  Popular
                </span>
              </div>
            )}
            {!plan.isActive && (
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
                <span className="text-sm text-gray-500">{plan.subscribers} assinantes</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {plan.monthlyPrice > 0 && (
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">R$ {plan.monthlyPrice.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm ml-1">/mês</span>
                  </div>
                )}
                {plan.yearlyPrice > 0 && (
                  <div>
                    <span className="text-2xl font-bold text-gray-900">R$ {plan.yearlyPrice.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm ml-1">/ano</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-start">
                    <div className={`mt-0.5 ${feature.included ? 'text-green-500' : 'text-red-500'}`}>
                      {feature.included ? <Check size={16} /> : <X size={16} />}
                    </div>
                    <span className={`ml-2 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex-1 ${plan.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'}`}
                  onClick={() => handleToggleActive(plan.id)}
                >
                  {plan.isActive ? 'Desativar' : 'Ativar'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  disabled={plan.isPopular}
                  onClick={() => handleTogglePopular(plan.id)}
                >
                  {plan.isPopular ? 'Destacado' : 'Destacar'}
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
                  {plans.filter(p => p.isActive).map((plan) => (
                    <TableHead key={plan.id} className="text-center">
                      {plan.name}
                      {plan.isPopular && <span className="ml-1 text-trade-blue">(Popular)</span>}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Preço Mensal</TableCell>
                  {plans.filter(p => p.isActive).map((plan) => (
                    <TableCell key={`${plan.id}-monthly`} className="text-center">
                      {plan.monthlyPrice > 0 ? `R$ ${plan.monthlyPrice.toFixed(2)}` : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Preço Anual</TableCell>
                  {plans.filter(p => p.isActive).map((plan) => (
                    <TableCell key={`${plan.id}-yearly`} className="text-center">
                      {plan.yearlyPrice > 0 ? `R$ ${plan.yearlyPrice.toFixed(2)}` : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Get all unique feature texts across all plans */}
                {Array.from(new Set(plans.flatMap(plan => plan.features.map(f => f.text)))).map((featureText) => (
                  <TableRow key={featureText}>
                    <TableCell className="font-medium">{featureText}</TableCell>
                    {plans.filter(p => p.isActive).map((plan) => {
                      const feature = plan.features.find(f => f.text === featureText);
                      return (
                        <TableCell key={`${plan.id}-${featureText}`} className="text-center">
                          {feature?.included ? (
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
