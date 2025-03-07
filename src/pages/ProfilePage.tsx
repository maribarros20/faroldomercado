
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, User, Shield, Bell, Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userRole, avatarUrl, userName } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar alterações.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Alterações salvas com sucesso!"
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleGoBack}
            className="rounded-full"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações de perfil</h1>
            <p className="text-gray-500 mt-1">Gerencie as configurações e preferências da sua conta</p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90" 
          onClick={handleSaveChanges}
          disabled={isLoading}
        >
          <Save size={18} className="mr-2" /> 
          {isLoading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical" 
            className="bg-white rounded-xl shadow-sm border border-gray-100 h-full"
          >
            <TabsList className="flex flex-col w-full items-start gap-1 p-2">
              <TabsTrigger value="personal" className="justify-start w-full px-4 py-3">
                <User size={18} className="mr-3" />
                Informações pessoais
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start w-full px-4 py-3">
                <Shield size={18} className="mr-3" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start w-full px-4 py-3">
                <Bell size={18} className="mr-3" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="preferences" className="justify-start w-full px-4 py-3">
                <Settings size={18} className="mr-3" />
                Preferências
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <TabsContent value="personal">
              <h2 className="text-2xl font-semibold mb-6">Informações do perfil</h2>
              <p className="text-gray-500 mb-8">Atualize suas informações de perfil e foto</p>
              
              <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <label 
                    htmlFor="profile-image" 
                    className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Upload size={16} />
                  </label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Carregar nova foto</h3>
                  <p className="text-sm text-gray-500">JPG, GIF ou PNG. Tamanho máximo de 800K</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Digite seu nome completo" defaultValue={userName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input id="username" placeholder="Digite seu nome de usuário" />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Escreva uma breve descrição sobre você" 
                  className="min-h-[120px]"
                />
              </div>
              
              <h3 className="text-xl font-semibold mt-10 mb-4">Informações de contato</h3>
              <p className="text-gray-500 mb-6">Atualize seus dados de contato</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Endereço de e-mail</Label>
                  <Input id="email" type="email" placeholder="Insira seu endereço de e-mail" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de telefone</Label>
                  <Input id="phone" placeholder="Insira seu número de telefone" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mt-10 mb-4">Informações de endereço</h3>
              <p className="text-gray-500 mb-6">Atualize seus dados de endereço</p>
              
              <div className="space-y-2 mb-6">
                <Label htmlFor="address">Endereço de Rua</Label>
                <Input id="address" placeholder="Insira seu endereço" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="Insira sua cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" placeholder="Digite seu estado" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">CEP</Label>
                  <Input id="zip" placeholder="Insira seu código postal" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <h2 className="text-2xl font-semibold mb-6">Configurações de segurança</h2>
              <p className="text-gray-500 mb-8">Gerencie suas senhas e configurações de segurança</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input id="new-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-6">
                  <h3 className="text-lg font-semibold mb-4">Autenticação de dois fatores</h3>
                  <p className="text-gray-500 mb-4">Adicione uma camada extra de segurança à sua conta</p>
                  
                  <Button variant="outline">Configurar autenticação de dois fatores</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <h2 className="text-2xl font-semibold mb-6">Preferências de notificação</h2>
              <p className="text-gray-500 mb-8">Escolha quais notificações você deseja receber</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Notificações por e-mail</h3>
                    <p className="text-sm text-gray-500">Receba atualizações importantes por e-mail</p>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="email-notifications" className="mr-2" />
                    <Label htmlFor="email-notifications">Ativado</Label>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Notificações do sistema</h3>
                    <p className="text-sm text-gray-500">Receba notificações dentro do aplicativo</p>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="system-notifications" className="mr-2" defaultChecked />
                    <Label htmlFor="system-notifications">Ativado</Label>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Alertas de mercado</h3>
                    <p className="text-sm text-gray-500">Receba alertas sobre mudanças no mercado</p>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="market-alerts" className="mr-2" defaultChecked />
                    <Label htmlFor="market-alerts">Ativado</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <h2 className="text-2xl font-semibold mb-6">Preferências do sistema</h2>
              <p className="text-gray-500 mb-8">Personalize sua experiência na plataforma</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Tema escuro</h3>
                    <p className="text-sm text-gray-500">Mude para o tema escuro para reduzir o cansaço visual</p>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="dark-mode" className="mr-2" />
                    <Label htmlFor="dark-mode">Ativado</Label>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Idioma</h3>
                    <p className="text-sm text-gray-500">Selecione seu idioma preferido</p>
                  </div>
                  <select className="p-2 border rounded">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            
            <div className="flex justify-end mt-10">
              <Button variant="outline" className="mr-3" onClick={handleGoBack}>Cancelar</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveChanges} disabled={isLoading}>
                <Save size={18} className="mr-2" />
                {isLoading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
