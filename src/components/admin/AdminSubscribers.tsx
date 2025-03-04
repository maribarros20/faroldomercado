
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
  Search, 
  Mail, 
  UserPlus,
  BadgeCheck,
  Clock,
  UserCog,
  UserX,
  Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Subscriber type
type SubscriptionStatus = "active" | "trial" | "expired" | "canceled";

type Subscriber = {
  id: string;
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: SubscriptionStatus;
  joinDate: string;
  nextBillingDate: string;
  totalSpent: number;
};

// Sample data
const sampleSubscribers: Subscriber[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@example.com",
    plan: "Premium Anual",
    subscriptionStatus: "active",
    joinDate: "2023-05-12",
    nextBillingDate: "2024-05-12",
    totalSpent: 997
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    plan: "Premium Mensal",
    subscriptionStatus: "active",
    joinDate: "2023-10-05",
    nextBillingDate: "2023-11-05",
    totalSpent: 297
  },
  {
    id: "3",
    name: "Carlos Souza",
    email: "carlos.souza@example.com",
    plan: "Básico",
    subscriptionStatus: "trial",
    joinDate: "2023-12-01",
    nextBillingDate: "2023-12-15",
    totalSpent: 0
  },
  {
    id: "4",
    name: "Ana Pereira",
    email: "ana.pereira@example.com",
    plan: "Premium Mensal",
    subscriptionStatus: "expired",
    joinDate: "2023-08-15",
    nextBillingDate: "2023-11-15",
    totalSpent: 297
  },
  {
    id: "5",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    plan: "Premium Anual",
    subscriptionStatus: "canceled",
    joinDate: "2023-02-20",
    nextBillingDate: "2023-10-20",
    totalSpent: 997
  }
];

const plans = [
  { id: "1", name: "Básico" },
  { id: "2", name: "Premium Mensal" },
  { id: "3", name: "Premium Anual" }
];

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(sampleSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    name: "",
    email: "",
    plan: "",
    subscriptionStatus: "trial" as SubscriptionStatus
  });
  const { toast } = useToast();

  const handleAddSubscriber = () => {
    const subscriber: Subscriber = {
      id: (subscribers.length + 1).toString(),
      name: newSubscriber.name,
      email: newSubscriber.email,
      plan: newSubscriber.plan,
      subscriptionStatus: newSubscriber.subscriptionStatus,
      joinDate: new Date().toISOString().split("T")[0],
      nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      totalSpent: 0
    };

    setSubscribers([...subscribers, subscriber]);
    setIsAddDialogOpen(false);
    setNewSubscriber({
      name: "",
      email: "",
      plan: "",
      subscriptionStatus: "trial"
    });

    toast({
      title: "Assinante adicionado",
      description: "O assinante foi adicionado com sucesso!",
      variant: "default",
    });
  };

  const handleStatusChange = (id: string, status: SubscriptionStatus) => {
    setSubscribers(subscribers.map(subscriber => 
      subscriber.id === id ? { ...subscriber, subscriptionStatus: status } : subscriber
    ));

    toast({
      title: "Status alterado",
      description: "O status da assinatura foi alterado com sucesso!",
      variant: "default",
    });
  };

  const filteredSubscribers = subscribers.filter(subscriber => 
    subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.plan.toLowerCase().includes(searchQuery.toLowerCase())
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
  const activeSubscribers = subscribers.filter(sub => sub.subscriptionStatus === "active").length;
  const trialSubscribers = subscribers.filter(sub => sub.subscriptionStatus === "trial").length;
  const canceledSubscribers = subscribers.filter(sub => sub.subscriptionStatus === "canceled").length;
  const totalRevenue = subscribers.reduce((total, sub) => total + sub.totalSpent, 0);

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
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={newSubscriber.name} 
                  onChange={(e) => setNewSubscriber({...newSubscriber, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newSubscriber.email} 
                  onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Plano</Label>
                <Select 
                  value={newSubscriber.plan} 
                  onValueChange={(value) => setNewSubscriber({...newSubscriber, plan: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newSubscriber.subscriptionStatus} 
                  onValueChange={(value: SubscriptionStatus) => setNewSubscriber({...newSubscriber, subscriptionStatus: value})}
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
                disabled={!newSubscriber.name || !newSubscriber.email || !newSubscriber.plan}
              >
                Adicionar
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
                      <TableCell className="hidden md:table-cell">{subscriber.plan}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusBadge(subscriber.subscriptionStatus)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.joinDate}</TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.nextBillingDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(`mailto:${subscriber.email}`, '_blank')}>
                            <Mail size={16} />
                          </Button>
                          <Select 
                            value={subscriber.subscriptionStatus} 
                            onValueChange={(value: SubscriptionStatus) => handleStatusChange(subscriber.id, value)}
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
