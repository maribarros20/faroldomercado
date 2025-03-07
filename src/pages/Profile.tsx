import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Spinner } from "@/components/ui/spinner";
import ProfileForm from "@/components/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const { userName, isLoading } = useUserProfile();
  const [userId, setUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cnpj: "",
    phone: "",
    cpf: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserId(session.user.id);
        
        // Fetch user profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!error && data) {
          setProfileData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            cnpj: data.cnpj || "",
            phone: data.phone || "",
            cpf: data.cpf || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleGoBack}
          className="rounded-full mr-3"
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-6">
            <TabsContent value="personal" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">{userName || 'Perfil'}</h2>
                  <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
                </div>
                
                <ProfileForm initialValues={profileData} userId={userId || undefined} />
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Segurança</h2>
                  <p className="text-muted-foreground">Gerencie suas configurações de segurança</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Alterar Senha</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="current-password" className="text-sm font-medium">
                          Senha Atual
                        </label>
                        <input
                          id="current-password"
                          type="password"
                          className="border rounded-md px-3 py-2"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="new-password" className="text-sm font-medium">
                          Nova Senha
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          className="border rounded-md px-3 py-2"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="confirm-password" className="text-sm font-medium">
                          Confirmar Nova Senha
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          className="border rounded-md px-3 py-2"
                        />
                      </div>
                      <button className="bg-primary text-white px-4 py-2 rounded-md">
                        Atualizar Senha
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Notificações</h2>
                  <p className="text-muted-foreground">Gerencie suas preferências de notificação</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações por E-mail</h3>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações por e-mail
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações do Sistema</h3>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no sistema
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações de Marketing</h3>
                      <p className="text-sm text-muted-foreground">
                        Receba ofertas e novidades
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <button className="bg-primary text-white px-4 py-2 rounded-md mt-4">
                    Salvar Preferências
                  </button>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Profile;
