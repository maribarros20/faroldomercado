
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
  Search, 
  Mail, 
  UserPlus,
  BadgeCheck,
  Clock,
  UserCog,
  UserX,
  Calendar,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Subscriber type
type SubscriptionStatus = "active" | "trial" | "expired" | "canceled";

type Subscriber = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  plan_name: string;
  plan_id: string;
  subscription_status: SubscriptionStatus;
  join_date: string;
  next_billing_date: string | null;
  total_spent: number;
};

const AdminSubscribers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    name: "",
    email: "",
    plan_id: "",
    subscription_status: "trial" as SubscriptionStatus
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plans for dropdown
  const { data: plans = [] } = useQuery({
    queryKey: ['plans-for-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name')
        .eq('is_active', true);
      
      if (error) {
        console.error("Error fetching plans:", error);
        throw error;
      }
      
      return data;
    }
  });

  // Fetch subscribers
  const { 
    data: subscribers = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      // We need to join subscriptions with profiles and auth.users
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          started_at,
          expires_at,
          is_active,
          plans(name)
        `);
      
      if (subError) {
        console.error("Error fetching subscriptions:", subError);
        throw subError;
      }

      // For each subscription, get user profile information
      const subscribersData = await Promise.all(subscriptions.map(async (sub) => {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, cpf, phone, company')
          .eq('id', sub.user_id)
          .single();
        
        if (profileError) {
          console.error(`Error fetching profile for user ${sub.user_id}:`, profileError);
          return null;
        }

        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(sub.user_id);
        
        if (userError || !userData) {
          console.error(`Error fetching user data for ${sub.user_id}:`, userError);
          return null;
        }

        // Calculate total spent based on subscriptions - this is a placeholder
        // In a real app, you would have a payments table to calculate this
        const totalSpent = sub.plans?.name?.includes('Premium') ? 99.90 : 49.90;

        return {
          id: sub.id,
          user_id: sub.user_id,
          name: `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim() || 'Usuário sem nome',
          email: userData.user?.email || 'Email não disponível',
          plan_name: sub.plans?.name || 'Plano desconhecido',
          plan_id: sub.plan_id,
          subscription_status: sub.is_active ? 'active' : (sub.expires_at && new Date(sub.expires_at) < new Date() ? 'expired' : 'canceled'),
          join_date: new Date(sub.started_at).toISOString().split('T')[0],
          next_billing_date: sub.expires_at ? new Date(sub.expires_at).toISOString().split('T')[0] : null,
          total_spent: totalSpent
        };
      }));

      // Filter out null values
      return subscribersData.filter(Boolean) as Subscriber[];
    }
  });

  // Add subscriber mutation
  const addSubscriberMutation = useMutation({
    mutationFn: async () => {
      // First, check if user exists
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      const userExists = userData.users.find(u => u.email === newSubscriber.email);
      
      if (!userExists) {
        throw new Error("Usuário não encontrado. O email informado não está cadastrado no sistema.");
      }
      
      // Check if user already has a subscription
      const { data: existingSub, error: existingSubError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userExists.id);
      
      if (existingSubError) throw existingSubError;
      
      if (existingSub && existingSub.length > 0) {
        throw new Error("Este usuário já possui uma assinatura ativa.");
      }
      
      // Create subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days trial

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userExists.id,
          plan_id: newSubscriber.plan_id,
          is_active: newSubscriber.subscription_status === 'active',
          expires_at: expiresAt.toISOString()
        })
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setIsAddDialogOpen(false);
      setNewSubscriber({
        name: "",
        email: "",
        plan_id: "",
        subscription_status: "trial"
      });
      
      toast({
        title: "Assinante adicionado",
        description: "O assinante foi adicionado com sucesso!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error adding subscriber:", error);
      toast({
        title: "Erro ao adicionar assinante",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o assinante. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Update subscription status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, userId, status }: { id: string; userId: string; status: SubscriptionStatus }) => {
      const isActive = status === 'active';
      
      // Calculate new expiration date if needed
      let expiresAt = null;
      if (status === 'active' || status === 'trial') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (status === 'trial' ? 15 : 30));
      }
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_active: isActive,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      
      toast({
        title: "Status alterado",
        description: "O status da assinatura foi alterado com sucesso!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error updating subscription status:", error);
      toast({
        title: "Erro ao alterar status",
        description: "Ocorreu um erro ao alterar o status da assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleAddSubscriber = () => {
    addSubscriberMutation.mutate();
  };

  const handleStatusChange = (id: string, userId: string, status: SubscriptionStatus) => {
    updateStatusMutation.mutate({ id, userId, status });
  };

  const filteredSubscribers = subscribers.filter(subscriber => 
    subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-500 border-green-200">Ativo</Badge>;
      case "trial":
        return <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200">Trial</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-500 border-yellow-200">Expirado</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Calculate statistics
  const activeSubscribers = subscribers.filter(sub => sub.subscription_status === "active").length;
  const trialSubscribers = subscribers.filter(sub => sub.subscription_status === "trial").length;
  const canceledSubscribers = subscribers.filter(sub => sub.subscription_status === "canceled").length;
  const totalRevenue = subscribers.reduce((total, sub) => total + sub.total_spent, 0);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Carregando assinantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-2">Erro ao carregar assinantes</p>
        <p className="text-gray-500 text-sm">{(error as Error).message}</p>
        <Button 
          className="mt-4"
          onClick={() => refetch()}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Assinantes</h2>
          <p className="text-sm text-gray-500">Gerencie os assinantes e seus planos</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <UserPlus size={16} className="mr-2" /> 
              Adicionar Assinante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Assinante</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newSubscriber.email} 
                  onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})} 
                  placeholder="Email do usuário já cadastrado"
                />
                <p className="text-xs text-gray-500">
                  O usuário deve estar cadastrado no sistema. Esta funcionalidade apenas adiciona uma assinatura para um usuário existente.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Plano</Label>
                <Select 
                  value={newSubscriber.plan_id} 
                  onValueChange={(value) => setNewSubscriber({...newSubscriber, plan_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newSubscriber.subscription_status} 
                  onValueChange={(value: SubscriptionStatus) => setNewSubscriber({...newSubscriber, subscription_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddSubscriber} 
                disabled={!newSubscriber.email || !newSubscriber.plan_id || addSubscriberMutation.isPending}
              >
                {addSubscriberMutation.isPending ? (
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Assinantes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{activeSubscribers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BadgeCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Em Período Trial</p>
                <p className="text-2xl font-bold text-gray-900">{trialSubscribers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Assinaturas Canceladas</p>
                <p className="text-2xl font-bold text-gray-900">{canceledSubscribers}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <UserX className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Lista de Assinantes</CardTitle>
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10 py-2 border-gray-200" 
                placeholder="Buscar assinantes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Plano</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Adesão</TableHead>
                  <TableHead className="hidden md:table-cell">Próxima Cobrança</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum assinante encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber, index) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{subscriber.name}</div>
                        <div className="text-sm text-gray-500 md:hidden">{subscriber.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.plan_name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusBadge(subscriber.subscription_status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.join_date}</TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.next_billing_date || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => window.open(`mailto:${subscriber.email}`, '_blank')}
                          >
                            <Mail size={16} />
                          </Button>
                          <Select 
                            value={subscriber.subscription_status} 
                            onValueChange={(value: SubscriptionStatus) => 
                              handleStatusChange(subscriber.id, subscriber.user_id, value)
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="trial">Trial</SelectItem>
                              <SelectItem value="expired">Expirado</SelectItem>
                              <SelectItem value="canceled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <UserCog size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscribers;
