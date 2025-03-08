
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, UserPlus, Users, Briefcase, Trash, Pencil, RefreshCw 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminUserManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    accountType: "trader",
    dateOfBirth: "",
    phone: "",
    cpf: "",
    mentorId: ""
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState<any[]>([]);

  // Fetch mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('id, name');
          
        if (error) throw error;
        setMentors(data || []);
      } catch (error: any) {
        console.error("Error fetching mentors:", error.message);
      }
    };
    
    fetchMentors();
  }, []);

  // Fetch users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, mentors:mentor_id(id, name)');
        
      if (error) {
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return profiles || [];
    }
  });

  // Filter users based on active tab and search term
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    let filtered = [...users];
    
    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(user => {
        if (activeTab === "traders") return user.tipo_de_conta === "trader";
        if (activeTab === "students") return user.tipo_de_conta === "aluno";
        if (activeTab === "admins") return user.role === "admin";
        return true;
      });
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.cpf?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [users, activeTab, searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (!selectedUserId && (formData.password.length < 8)) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate mentor for student account
    if (formData.accountType === "aluno" && !formData.mentorId) {
      toast({
        title: "Mentor necessário",
        description: "Para contas de aluno, é necessário selecionar um mentor.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (selectedUserId) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            role: formData.role as any,
            tipo_de_conta: formData.accountType,
            phone: formData.phone,
            cpf: formData.cpf,
            date_of_birth: formData.dateOfBirth,
            mentor_id: formData.accountType === "aluno" ? formData.mentorId : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedUserId);
          
        if (error) throw error;
        
        toast({
          title: "Usuário atualizado",
          description: "O usuário foi atualizado com sucesso"
        });
      } else {
        // Create new user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: formData.role,
              tipo_de_conta: formData.accountType,
              phone: formData.phone,
              cpf: formData.cpf,
              date_of_birth: formData.dateOfBirth,
              mentor_id: formData.accountType === "aluno" ? formData.mentorId : null
            }
          }
        });

        if (signUpError) throw signUpError;
        
        toast({
          title: "Usuário criado",
          description: "O usuário foi criado com sucesso"
        });
      }
      
      // Reset form and close dialog
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        accountType: "trader",
        dateOfBirth: "",
        phone: "",
        cpf: "",
        mentorId: ""
      });
      setSelectedUserId(null);
      setIsDialogOpen(false);
      
      // Refresh user list
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar a solicitação",
        variant: "destructive"
      });
    }
  };

  // Load user data for editing
  const handleEditUser = (user: any) => {
    setSelectedUserId(user.id);
    setFormData({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      password: "", // We don't set password for editing
      role: user.role || "user",
      accountType: user.tipo_de_conta || "trader",
      dateOfBirth: user.date_of_birth || "",
      phone: user.phone || "",
      cpf: user.cpf || "",
      mentorId: user.mentor_id || ""
    });
    setIsDialogOpen(true);
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso"
      });
      
      // Refresh user list
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro ao excluir o usuário",
        variant: "destructive"
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">
            Administre usuários, alunos e administradores da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setSelectedUserId(null);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    role: "user",
                    accountType: "trader",
                    dateOfBirth: "",
                    phone: "",
                    cpf: "",
                    mentorId: ""
                  });
                }}
                className="flex items-center gap-2"
              >
                <UserPlus size={16} />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedUserId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  {selectedUserId 
                    ? "Edite as informações do usuário selecionado" 
                    : "Preencha o formulário para criar um novo usuário na plataforma"
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  {!selectedUserId && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required={!selectedUserId}
                        placeholder="Mínimo de 8 caracteres"
                      />
                      <p className="text-xs text-muted-foreground">
                        A senha deve ter pelo menos 8 caracteres
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Conta</Label>
                    <RadioGroup
                      value={formData.accountType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trader" id="trader" />
                        <Label htmlFor="trader">Trader</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="aluno" id="aluno" />
                        <Label htmlFor="aluno">Aluno</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {formData.accountType === "aluno" && (
                    <div className="space-y-2">
                      <Label htmlFor="mentor">Mentor</Label>
                      <Select 
                        value={formData.mentorId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mentorId: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um mentor" />
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
                  )}
                  
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user">Usuário</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin">Administrador</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedUserId ? "Salvar Alterações" : "Criar Usuário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>
                {isLoading 
                  ? "Carregando usuários..." 
                  : `${filteredUsers.length} usuários encontrados`
                }
              </CardDescription>
            </div>
            <div className="w-72">
              <Input
                placeholder="Pesquisar por nome, email, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Users size={16} />
                Todos
              </TabsTrigger>
              <TabsTrigger value="traders" className="flex items-center gap-1">
                <User size={16} />
                Traders
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1">
                <Briefcase size={16} />
                Alunos
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-1">
                <Users size={16} />
                Administradores
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 border rounded-md border-dashed">
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.tipo_de_conta === 'aluno' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.tipo_de_conta === 'aluno' ? 'Aluno' : 'Trader'}
                        </span>
                        {user.tipo_de_conta === 'aluno' && user.mentors && (
                          <span className="ml-2 text-xs text-gray-500">
                            {user.mentors.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.updated_at || '')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setSelectedUserId(user.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja excluir o usuário {user.first_name} {user.last_name}?
                                  Esta ação não pode ser desfeita.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Excluir
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "" : `Mostrando ${filteredUsers.length} de ${users?.length || 0} usuários`}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminUserManager;
