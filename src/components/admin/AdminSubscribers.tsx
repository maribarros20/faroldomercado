
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, UserPlus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUserResponse, Subscriber, SubscriptionWithPlan } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

const AdminSubscribers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState<{ id: string, name: string }[]>([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    company: "",
  });
  
  // Fetch subscribers data using React Query
  const { 
    data: subscribers, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => {
      // Get all subscriptions with plan info
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select(`
          id, 
          user_id, 
          plan_id, 
          is_active, 
          started_at, 
          expires_at, 
          payment_type,
          plans:plan_id (
            id, 
            name, 
            monthly_price, 
            yearly_price, 
            description
          ),
          profiles:user_id (
            first_name, 
            last_name, 
            company
          )
        `);
      
      if (subscriptionError) {
        throw subscriptionError;
      }
      
      // Get user details from Auth API
      const subscriberList: Subscriber[] = [];
      
      // Process subscription data and get additional user details
      for (const subscription of (subscriptions as SubscriptionWithPlan[])) {
        try {
          // Get user email from Auth API
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            subscription.user_id
          );
          
          if (userError) throw userError;

          const typedUserData = userData.user as AdminUserResponse;
          
          subscriberList.push({
            id: subscription.user_id,
            email: typedUserData.email,
            name: `${subscription.profiles?.first_name || ''} ${subscription.profiles?.last_name || ''}`.trim(),
            subscription: subscription,
            profile: subscription.profiles
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
      
      return subscriberList;
    }
  });
  
  // Fetch plans for the new subscriber form
  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name')
        .eq('is_active', true);
        
      if (error) {
        console.error("Error fetching plans:", error);
        return;
      }
      
      if (data) {
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0].id);
        }
      }
    };
    
    fetchPlans();
  }, []);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter subscribers based on search query
  const filteredSubscribers = subscribers?.filter(subscriber => {
    const searchLower = searchQuery.toLowerCase();
    return (
      subscriber.email?.toLowerCase().includes(searchLower) ||
      subscriber.name?.toLowerCase().includes(searchLower) ||
      subscriber.subscription?.plans.name.toLowerCase().includes(searchLower) ||
      subscriber.profile?.company?.toLowerCase().includes(searchLower)
    );
  });
  
  // Create new subscriber
  const handleCreateSubscriber = async () => {
    if (!newUser.email || !newUser.password || !selectedPlan) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email, senha e selecione um plano.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          company: newUser.company
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: authData.user.id,
          plan_id: selectedPlan,
          is_active: true,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          payment_type: 'admin'
        });
        
      if (subscriptionError) throw subscriptionError;
      
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          company: newUser.company
        })
        .eq('id', authData.user.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Assinante criado",
        description: "Novo assinante criado com sucesso!",
      });
      
      // Reset form and close dialog
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        company: ""
      });
      setOpenDialog(false);
      
      // Refresh data
      refetch();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar assinante",
        variant: "destructive",
      });
    }
  };
  
  // Delete subscriber
  const handleDeleteSubscriber = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este assinante? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast({
        title: "Assinante excluído",
        description: "Assinante excluído com sucesso!",
      });
      
      // Refresh data
      refetch();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir assinante",
        variant: "destructive",
      });
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="text-red-700">
            <p className="text-sm font-medium">Erro ao carregar assinantes</p>
            <p className="text-xs mt-1">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar assinantes..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            size="sm" 
            onClick={() => setOpenDialog(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Assinante
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[140px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[40px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredSubscribers && filteredSubscribers.length > 0 ? (
              filteredSubscribers.map(subscriber => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || "—"}</TableCell>
                  <TableCell>{subscriber.profile?.company || "—"}</TableCell>
                  <TableCell>{subscriber.subscription?.plans.name}</TableCell>
                  <TableCell>
                    {subscriber.subscription?.started_at 
                      ? formatDate(subscriber.subscription.started_at) 
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscriber.subscription?.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscriber.subscription?.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  {searchQuery 
                    ? "Nenhum resultado encontrado para sua busca." 
                    : "Nenhum assinante encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* New Subscriber Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar novo assinante</DialogTitle>
            <DialogDescription>
              Crie um novo usuário e associe a um plano.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="********"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  placeholder="Nome"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Sobrenome
                </label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  placeholder="Sobrenome"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="company" className="text-sm font-medium">
                Empresa
              </label>
              <Input
                id="company"
                value={newUser.company}
                onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="plan" className="text-sm font-medium">
                Plano
              </label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubscriber}>
              Criar assinante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscribers;
