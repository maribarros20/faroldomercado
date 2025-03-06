import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ProfilePictureUploader from "./ProfilePictureUploader";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 

interface ProfileFormProps {
  initialValues: {
    firstName: string;
    lastName: string;
    email: string;
    cnpj: string;
    phone: string;
    cpf: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  userId: string | undefined;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialValues, userId }) => {
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [email, setEmail] = useState(initialValues.email);
  const [cnpj, setCnpj] = useState(initialValues.cnpj);
  const [phone, setPhone] = useState(initialValues.phone);
  const [cpf, setCpf] = useState(initialValues.cpf);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialValues) {
      setFirstName(initialValues.firstName);
      setLastName(initialValues.lastName);
      setEmail(initialValues.email);
      setCnpj(initialValues.cnpj);
      setPhone(initialValues.phone);
      setCpf(initialValues.cpf);
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!userId) {
        throw new Error("User ID is missing.");
      }

      console.log("Updating profile for user ID:", userId);

      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          cnpj: cnpj,
          phone: phone,
          cpf: cpf,
        })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast({
          title: "Erro ao atualizar perfil",
          description:
            "Não foi possível atualizar seus dados. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update user metadata to keep it in sync with profile
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          cnpj: cnpj,
          phone: phone,
          cpf: cpf,
        }
      });

      if (metadataError) {
        console.error("Error updating user metadata:", metadataError);
      }

      // Update password if provided
      if (newPassword && currentPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Senhas não coincidem",
            description: "A nova senha e a confirmação devem ser iguais.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) {
          console.error("Error updating password:", passwordError);
          toast({
            title: "Erro ao atualizar senha",
            description:
              "Não foi possível atualizar sua senha. Verifique sua senha atual e tente novamente.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        toast({
          title: "Senha atualizada com sucesso",
          description: "Sua senha foi alterada com sucesso.",
        });
        
        // Clear password fields after successful update
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      toast({
        title: "Perfil atualizado com sucesso",
        description: "Seus dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description:
          "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Nome</Label>
            <Input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              type="text"
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
           <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
