
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Pen, Trash2, Plus, Upload } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Mentor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  photo: string | null;
  created_at: string;
  student_count?: number;
};

const AdminMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
    photo: null as string | null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Load mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("mentors")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        // Get student counts for each mentor
        const mentorsWithCounts = await Promise.all(
          (data || []).map(async (mentor) => {
            const { count, error: countError } = await supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("mentor_id", mentor.id);

            return {
              ...mentor,
              student_count: countError ? 0 : count || 0,
            };
          })
        );

        setMentors(mentorsWithCounts);
      } catch (error) {
        console.error("Error fetching mentors:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os mentores.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do mentor é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: "Erro",
        description: "Digite um e-mail válido.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Erro",
        description: "O telefone do mentor é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.cnpj.trim()) {
      toast({
        title: "Erro",
        description: "O CNPJ do mentor é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const uploadPhoto = async (mentorId: string) => {
    if (!photoFile) return null;

    try {
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${mentorId}.${fileExt}`;
      const filePath = `mentors/${fileName}`;

      // First, check if the storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("mentors");
      
      // If bucket doesn't exist, create it
      if (bucketError) {
        await supabase.storage.createBucket("mentors", { public: true });
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("mentors")
        .upload(filePath, photoFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("mentors")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da foto.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleCreateMentor = async () => {
    try {
      if (!validateForm()) return;

      const { data, error } = await supabase
        .from("mentors")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cnpj: formData.cnpj,
        })
        .select();

      if (error) {
        throw error;
      }

      const newMentor = data[0];

      // Upload photo if selected
      if (photoFile) {
        const photoUrl = await uploadPhoto(newMentor.id);
        if (photoUrl) {
          await supabase
            .from("mentors")
            .update({ photo: photoUrl })
            .eq("id", newMentor.id);
          
          newMentor.photo = photoUrl;
        }
      }

      toast({
        title: "Sucesso",
        description: "Mentor criado com sucesso.",
      });

      // Refresh mentors list
      setMentors([...mentors, { ...newMentor, student_count: 0 }]);
      
      // Reset form
      setFormData({ name: "", email: "", phone: "", cnpj: "", photo: null });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error creating mentor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o mentor.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMentor = async () => {
    try {
      if (!activeMentor || !validateForm()) return;

      const updates = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cnpj: formData.cnpj,
      };

      // Upload photo if selected
      if (photoFile) {
        const photoUrl = await uploadPhoto(activeMentor.id);
        if (photoUrl) {
          (updates as any).photo = photoUrl;
        }
      }

      const { error } = await supabase
        .from("mentors")
        .update(updates)
        .eq("id", activeMentor.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Mentor atualizado com sucesso.",
      });

      // Update local state
      setMentors(
        mentors.map((m) =>
          m.id === activeMentor.id
            ? {
                ...m,
                ...updates,
                photo: (updates as any).photo || m.photo,
              }
            : m
        )
      );
      
      // Reset form
      setActiveMentor(null);
      setFormData({ name: "", email: "", phone: "", cnpj: "", photo: null });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error updating mentor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o mentor.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMentor = async (mentorId: string) => {
    try {
      // Check if mentor has students
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("mentor_id", mentorId);

      if (countError) {
        throw countError;
      }

      if (count && count > 0) {
        toast({
          title: "Erro",
          description: "Este mentor possui alunos vinculados. Remova os vínculos primeiro.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("mentors")
        .delete()
        .eq("id", mentorId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Mentor removido com sucesso.",
      });

      // Update local state
      setMentors(mentors.filter((m) => m.id !== mentorId));
    } catch (error) {
      console.error("Error deleting mentor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o mentor.",
        variant: "destructive",
      });
    }
  };

  const editMentor = (mentor: Mentor) => {
    setActiveMentor(mentor);
    setFormData({
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      cnpj: mentor.cnpj,
      photo: mentor.photo,
    });
    setPhotoPreview(mentor.photo || null);
  };

  const resetForm = () => {
    setActiveMentor(null);
    setFormData({ name: "", email: "", phone: "", cnpj: "", photo: null });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciamento de Mentores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Mentor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={photoPreview || ""} alt="Preview" />
                      <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nome do Mentor*
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                  />
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
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Telefone*
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label htmlFor="cnpj" className="block text-sm font-medium mb-1">
                    CNPJ*
                  </label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleCreateMentor}>Criar Mentor</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {activeMentor && (
            <Dialog open={!!activeMentor} onOpenChange={(open) => !open && resetForm()}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Editar Mentor</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={photoPreview || ""} alt="Preview" />
                        <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="photo-edit"
                        className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <input
                          id="photo-edit"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                      Nome do Mentor*
                    </label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
                      Email*
                    </label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">
                      Telefone*
                    </label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-cnpj" className="block text-sm font-medium mb-1">
                      CNPJ*
                    </label>
                    <Input
                      id="edit-cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateMentor}>Atualizar Mentor</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum mentor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  mentors.map((mentor) => (
                    <TableRow key={mentor.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={mentor.photo || ""} alt={mentor.name} />
                          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{mentor.name}</TableCell>
                      <TableCell>{mentor.email}</TableCell>
                      <TableCell>{mentor.phone}</TableCell>
                      <TableCell>{mentor.cnpj}</TableCell>
                      <TableCell>{mentor.student_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => editMentor(mentor)}>
                            <Pen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMentor(mentor.id)}
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

export default AdminMentors;
