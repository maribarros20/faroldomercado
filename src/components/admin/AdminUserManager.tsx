
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Search, RefreshCw, Plus, PenSquare, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
  tipo_de_conta: 'trader' | 'aluno' | 'mentor' | 'admin';
  mentor_link_id: string | null;
  contrato_expiracao_data: string | null;
  created_at: string;
  mentor_name?: string;
  plan_name?: string;
};

type Mentor = {
  id: string;
  name: string;
  email: string;
  cnpj: string;
};

type Plan = {
  id: string;
  name: string;
  is_mentor_plan: boolean;
  mentor_id: string | null;
};

const AdminUserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cpf: "",
    cnpj: "",
    tipo_de_conta: "trader",
    mentor_link_id: "",
    plan_id: "",
    contrato_expiracao_data: "",
    password: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchMentors();
    fetchPlans();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          cpf,
          cnpj,
          tipo_de_conta,
          mentor_link_id,
          contrato_expiracao_data,
          created_at,
          plan_id
        `);

      if (profilesError) throw profilesError;

      // Fetch mentors for display names
      const { data: mentorsData } = await supabase
        .from("mentors")
        .select("id, name");

      // Fetch plans for display names
      const { data: plansData } = await supabase
        .from("plans")
        .select("id, name");

      // Map mentor names and plan names to profiles
      const usersWithDetails = profilesData.map((profile: any) => {
        const mentor = mentorsData?.find((m: any) => m.id === profile.mentor_link_id);
        const plan = plansData?.find((p: any) => p.id === profile.plan_id);
        
        return {
          ...profile,
          mentor_name: mentor ? mentor.name : null,
          plan_name: plan ? plan.name : null
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from("mentors")
        .select("id, name, email, cnpj");

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("id, name, is_mentor_plan, mentor_id");

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      cpf: "",
      cnpj: "",
      tipo_de_conta: "trader",
      mentor_link_id: "",
      plan_id: "",
      contrato_expiracao_data: "",
      password: ""
    });
    setCurrentUser(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const editUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      cpf: user.cpf || "",
      cnpj: user.cnpj || "",
      tipo_de_conta: user.tipo_de_conta || "trader",
      mentor_link_id: user.mentor_link_id || "",
      plan_id: "", // We need to fetch this separately
      contrato_expiracao_data: user.contrato_expiracao_data 
        ? new Date(user.contrato_expiracao_data).toISOString().split('T')[0]
        : "",
      password: ""
    });
    setIsEditing(true);
  };

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!formData.email || !formData.first_name || !formData.password) {
        toast({
          title: "Campos obrigatórios",
          description: "Email, nome e senha são obrigatórios",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }
      
      // Now update the profile with additional data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          cpf: formData.cpf || null,
          cnpj: formData.cnpj || null,
          tipo_de_conta: formData.tipo_de_conta as 'trader' | 'aluno' | 'mentor' | 'admin',
          mentor_link_id: formData.mentor_link_id || null,
          plan_id: formData.plan_id || null,
          contrato_expiracao_data: formData.contrato_expiracao_data 
            ? new Date(formData.contrato_expiracao_data).toISOString()
            : null,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
      
      resetForm();
      fetchUsers();
      
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          cpf: formData.cpf || null,
          cnpj: formData.cnpj || null,
          tipo_de_conta: formData.tipo_de_conta as 'trader' | 'aluno' | 'mentor' | 'admin',
          mentor_link_id: formData.mentor_link_id || null,
          plan_id: formData.plan_id || null,
          contrato_expiracao_data: formData.contrato_expiracao_data 
            ? new Date(formData.contrato_expiracao_data).toISOString()
            : null,
        })
        .eq("id", currentUser.id);

      if (profileError) throw profileError;
      
      // If a new password is provided, update it
      if (formData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          currentUser.id,
          { password: formData.password }
        );
        
        if (passwordError) throw passwordError;
      }
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      
      resetForm();
      fetchUsers();
      
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const confirmation = window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.");
      
      if (!confirmation) return;
      
      setIsLoading(true);
      
      // Delete from auth (will cascade to profile)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
      
      fetchUsers();
      
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro ao excluir o usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.tipo_de_conta?.toLowerCase().includes(searchLower) ||
      user.mentor_name?.toLowerCase().includes(searchLower)
    );
  });

  const getTipoDeContaLabel = (tipo: string) => {
    switch (tipo) {
      case "trader": return "Trader";
      case "aluno": return "Aluno";
      case "mentor": return "Mentor";
      case "admin": return "Admin";
      default: return tipo;
    }
  };

  const getAccountTypeBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "trader": return "default";
      case "aluno": return "secondary";
      case "mentor": return "outline";
      case "admin": return "destructive";
      default: return "default";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Usuário" : "Criar Novo Usuário"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                      Nome*
                    </label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Nome"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                      Sobrenome*
                    </label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Sobrenome"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email*
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    {isEditing ? "Nova senha (deixe em branco para manter a atual)" : "Senha*"}
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Senha"
                    required={!isEditing}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium mb-1">
                      CPF
                    </label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="123.456.789-00"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Conta*
                  </label>
                  <Select
                    value={formData.tipo_de_conta}
                    onValueChange={(value) => handleSelectChange("tipo_de_conta", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trader">Trader</SelectItem>
                      <SelectItem value="aluno">Aluno</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(formData.tipo_de_conta === "aluno") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Mentor*
                      </label>
                      <Select
                        value={formData.mentor_link_id}
                        onValueChange={(value) => handleSelectChange("mentor_link_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mentor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Data de Expiração do Contrato*
                      </label>
                      <Input
                        type="date"
                        name="contrato_expiracao_data"
                        value={formData.contrato_expiracao_data}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plano
                  </label>
                  <Select
                    value={formData.plan_id}
                    onValueChange={(value) => handleSelectChange("plan_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem plano</SelectItem>
                      {plans
                        .filter(plan => {
                          // For students, only show mentor plans of their mentor
                          if (formData.tipo_de_conta === "aluno" && plan.is_mentor_plan) {
                            return plan.mentor_id === formData.mentor_link_id;
                          }
                          // For traders, only show platform plans
                          if (formData.tipo_de_conta === "trader" && !plan.is_mentor_plan) {
                            return true;
                          }
                          // For mentors and admins, show all plans
                          return true;
                        })
                        .map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipo_de_conta === "mentor" && (
                  <div>
                    <label htmlFor="cnpj" className="block text-sm font-medium mb-1">
                      CNPJ do Mentor*
                    </label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button 
                  onClick={isEditing ? handleUpdateUser : handleCreateUser}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                  {isEditing ? "Atualizar" : "Criar"} Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getAccountTypeBadgeVariant(user.tipo_de_conta)}>
                          {getTipoDeContaLabel(user.tipo_de_conta)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.mentor_name || '-'}</TableCell>
                      <TableCell>{user.plan_name || '-'}</TableCell>
                      <TableCell>
                        {user.contrato_expiracao_data 
                          ? format(new Date(user.contrato_expiracao_data), "dd/MM/yyyy")
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => editUser(user)}
                          >
                            <PenSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserManager;
