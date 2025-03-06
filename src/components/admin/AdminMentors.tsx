
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Edit, Plus, UserPlus, User, Phone, Mail, Building } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  photo: string | null;
  created_at: string;
}

const AdminMentors = () => {
  const [newMentor, setNewMentor] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    cnpj: "",
    photo: ""
  });
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch mentors
  const { data: mentors, isLoading: isLoadingMentors } = useQuery({
    queryKey: ['admin-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Mentor[];
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao carregar mentores",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Create mentor mutation
  const createMentorMutation = useMutation({
    mutationFn: async (mentorData: { name: string; email: string; phone: string; cnpj: string; photo?: string }) => {
      const { data, error } = await supabase
        .from('mentors')
        .insert([{
          name: mentorData.name,
          email: mentorData.email,
          phone: mentorData.phone,
          cnpj: mentorData.cnpj,
          photo: mentorData.photo || null
        }])
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      setNewMentor({ name: "", email: "", phone: "", cnpj: "", photo: "" });
      setIsDialogOpen(false);
      toast({
        title: "Mentor criado",
        description: "O mentor foi criado com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao criar mentor",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Update mentor mutation
  const updateMentorMutation = useMutation({
    mutationFn: async (mentorData: { id: string; name: string; email: string; phone: string; cnpj: string; photo?: string }) => {
      const { data, error } = await supabase
        .from('mentors')
        .update({
          name: mentorData.name,
          email: mentorData.email,
          phone: mentorData.phone,
          cnpj: mentorData.cnpj,
          photo: mentorData.photo || null
        })
        .eq('id', mentorData.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      setEditingMentor(null);
      setIsDialogOpen(false);
      toast({
        title: "Mentor atualizado",
        description: "O mentor foi atualizado com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao atualizar mentor",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Delete mentor mutation
  const deleteMentorMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', mentorId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return mentorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast({
        title: "Mentor excluído",
        description: "O mentor foi excluído com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao excluir mentor",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentor.name || !newMentor.email || !newMentor.phone || !newMentor.cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    createMentorMutation.mutate(newMentor);
  };

  const handleUpdateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor || !editingMentor.name || !editingMentor.email || !editingMentor.phone || !editingMentor.cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    updateMentorMutation.mutate({
      id: editingMentor.id,
      name: editingMentor.name,
      email: editingMentor.email,
      phone: editingMentor.phone,
      cnpj: editingMentor.cnpj,
      photo: editingMentor.photo || undefined
    });
  };

  const handleDeleteMentor = (mentorId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este mentor? Esta ação não pode ser desfeita.")) {
      deleteMentorMutation.mutate(mentorId);
    }
  };

  const handleEditMentor = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingMentor(null);
    setIsDialogOpen(false);
    setNewMentor({ name: "", email: "", phone: "", cnpj: "", photo: "" });
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Mentores</h2>
        <Button onClick={() => {
          setEditingMentor(null);
          setIsDialogOpen(true);
        }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Mentor
        </Button>
      </div>

      {isLoadingMentors ? (
        <div className="flex justify-center items-center h-40">
          <Spinner />
        </div>
      ) : !mentors || mentors.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Nenhum mentor encontrado. Adicione um novo mentor para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map(mentor => (
            <Card key={mentor.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate" title={mentor.name}>
                    {mentor.name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditMentor(mentor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteMentor(mentor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={mentor.photo || ""} alt={mentor.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(mentor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 w-full">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate" title={mentor.email}>{mentor.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{mentor.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate" title={mentor.cnpj}>{mentor.cnpj}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mentor Dialog (Create/Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMentor ? "Editar Mentor" : "Adicionar Novo Mentor"}
            </DialogTitle>
            <DialogDescription>
              {editingMentor 
                ? "Atualize as informações do mentor abaixo." 
                : "Preencha as informações para adicionar um novo mentor."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editingMentor ? handleUpdateMentor : handleCreateMentor}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mentor-name" className="text-right">
                  Nome*
                </Label>
                <Input
                  id="mentor-name"
                  className="col-span-3"
                  value={editingMentor ? editingMentor.name : newMentor.name}
                  onChange={(e) => {
                    if (editingMentor) {
                      setEditingMentor({...editingMentor, name: e.target.value});
                    } else {
                      setNewMentor({...newMentor, name: e.target.value});
                    }
                  }}
                  placeholder="Nome completo do mentor"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mentor-email" className="text-right">
                  Email*
                </Label>
                <Input
                  id="mentor-email"
                  type="email"
                  className="col-span-3"
                  value={editingMentor ? editingMentor.email : newMentor.email}
                  onChange={(e) => {
                    if (editingMentor) {
                      setEditingMentor({...editingMentor, email: e.target.value});
                    } else {
                      setNewMentor({...newMentor, email: e.target.value});
                    }
                  }}
                  placeholder="Email do mentor"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mentor-phone" className="text-right">
                  Telefone*
                </Label>
                <Input
                  id="mentor-phone"
                  className="col-span-3"
                  value={editingMentor ? editingMentor.phone : newMentor.phone}
                  onChange={(e) => {
                    if (editingMentor) {
                      setEditingMentor({...editingMentor, phone: e.target.value});
                    } else {
                      setNewMentor({...newMentor, phone: e.target.value});
                    }
                  }}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mentor-cnpj" className="text-right">
                  CNPJ*
                </Label>
                <Input
                  id="mentor-cnpj"
                  className="col-span-3"
                  value={editingMentor ? editingMentor.cnpj : newMentor.cnpj}
                  onChange={(e) => {
                    if (editingMentor) {
                      setEditingMentor({...editingMentor, cnpj: e.target.value});
                    } else {
                      setNewMentor({...newMentor, cnpj: e.target.value});
                    }
                  }}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mentor-photo" className="text-right">
                  Foto URL
                </Label>
                <Input
                  id="mentor-photo"
                  className="col-span-3"
                  value={editingMentor ? editingMentor.photo || "" : newMentor.photo}
                  onChange={(e) => {
                    if (editingMentor) {
                      setEditingMentor({...editingMentor, photo: e.target.value});
                    } else {
                      setNewMentor({...newMentor, photo: e.target.value});
                    }
                  }}
                  placeholder="URL da foto do mentor"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMentor ? "Salvar Alterações" : "Adicionar Mentor"}
                {(createMentorMutation.isPending || updateMentorMutation.isPending) && (
                  <Spinner className="ml-2" size="sm" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMentors;
