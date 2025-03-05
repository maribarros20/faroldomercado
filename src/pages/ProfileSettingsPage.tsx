
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Bell, Shield, Key, File, CreditCard, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ProfileSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    cnpj: "",
    phone: "",
    cpf: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    productUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    activityTracking: true,
    dataSharingForAnalytics: false,
    allowThirdPartyAccess: false,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user's profile data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Error fetching profile:", error);
            toast({
              title: "Erro ao carregar perfil",
              description: "Não foi possível carregar seus dados. Tente novamente mais tarde.",
              variant: "destructive",
            });
            return;
          }
          
          if (profile) {
            setFormData({
              ...formData,
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              email: user.email || "",
              company: profile.company || "",
              cnpj: profile.cnpj || "",
              phone: profile.phone || "",
              cpf: profile.cpf || "",
            });
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao atualizar perfil",
          description: "Você precisa estar logado para atualizar seu perfil.",
          variant: "destructive",
        });
        return;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          cnpj: formData.cnpj,
          phone: formData.phone,
          cpf: formData.cpf,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar seu perfil. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Senhas não conferem",
          description: "A nova senha e a confirmação devem ser idênticas.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.newPassword.length < 8) {
        toast({
          title: "Senha fraca",
          description: "A senha deve ter pelo menos 8 caracteres.",
          variant: "destructive",
        });
        return;
      }
      
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });
      
      if (error) {
        console.error("Error updating password:", error);
        toast({
          title: "Erro ao atualizar senha",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro ao atualizar sua senha. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (id: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [id]: !notificationSettings[id],
    });
    
    toast({
      title: "Preferências de notificação atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const handlePrivacyChange = (id: keyof typeof privacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [id]: !privacySettings[id],
    });
    
    toast({
      title: "Configurações de privacidade atualizadas",
      description: "Suas configurações de privacidade foram salvas.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Configurações do Perfil</h1>
        <p className="text-gray-500 mt-2">Gerencie suas informações, preferências e segurança</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key size={16} />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield size={16} />
            <span>Privacidade</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e informações de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <div className="bg-primary/20 w-full h-full flex items-center justify-center text-2xl text-primary font-semibold">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </div>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Alterar foto
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      required
                    />
                    <p className="text-xs text-gray-500">O e-mail não pode ser alterado.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <CardFooter className="px-0 pt-6 pb-0">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Alterar senha</CardTitle>
              <CardDescription>
                Atualize sua senha para manter sua conta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">
                    A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula e um número
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <CardFooter className="px-0 pt-6 pb-0">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Atualizando..." : "Atualizar senha"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de notificação</CardTitle>
              <CardDescription>
                Configure como e quando deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Notificações por e-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações por e-mail
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações por SMS
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={() => handleNotificationChange("smsNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="productUpdates">Atualizações de produto</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações sobre novos recursos e melhorias
                    </p>
                  </div>
                  <Switch
                    id="productUpdates"
                    checked={notificationSettings.productUpdates}
                    onCheckedChange={() => handleNotificationChange("productUpdates")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="securityAlerts">Alertas de segurança</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas sobre atividades suspeitas em sua conta
                    </p>
                  </div>
                  <Switch
                    id="securityAlerts"
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={() => handleNotificationChange("securityAlerts")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">E-mails de marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba ofertas e promoções por e-mail
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationChange("marketingEmails")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e segurança</CardTitle>
              <CardDescription>
                Gerencie suas configurações de privacidade e segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profileVisibility">Visibilidade do perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que outros usuários vejam seu perfil
                    </p>
                  </div>
                  <Switch
                    id="profileVisibility"
                    checked={privacySettings.profileVisibility}
                    onCheckedChange={() => handlePrivacyChange("profileVisibility")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activityTracking">Rastreamento de atividade</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir o rastreamento de suas atividades para melhorar sua experiência
                    </p>
                  </div>
                  <Switch
                    id="activityTracking"
                    checked={privacySettings.activityTracking}
                    onCheckedChange={() => handlePrivacyChange("activityTracking")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dataSharingForAnalytics">Compartilhamento de dados para análise</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir o compartilhamento de dados anônimos para análise
                    </p>
                  </div>
                  <Switch
                    id="dataSharingForAnalytics"
                    checked={privacySettings.dataSharingForAnalytics}
                    onCheckedChange={() => handlePrivacyChange("dataSharingForAnalytics")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowThirdPartyAccess">Acesso de terceiros</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que aplicativos de terceiros acessem seus dados
                    </p>
                  </div>
                  <Switch
                    id="allowThirdPartyAccess"
                    checked={privacySettings.allowThirdPartyAccess}
                    onCheckedChange={() => handlePrivacyChange("allowThirdPartyAccess")}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setTermsDialogOpen(true)}
                  >
                    <File size={16} />
                    <span>Ver Termos e Condições</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Termos e Condições Dialog */}
      <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termos e Condições de Uso</DialogTitle>
            <DialogDescription>
              Última atualização: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">1. Aceitação dos Termos</h3>
            <p className="text-sm">
              Ao acessar ou usar nossa plataforma, você concorda em ficar vinculado a estes Termos e Condições de Uso, a todas as leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.
            </p>
            
            <h3 className="text-lg font-semibold">2. Uso da Licença</h3>
            <p className="text-sm">
              É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site da plataforma, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:
            </p>
            <ul className="list-disc list-inside text-sm pl-4 space-y-1">
              <li>modificar ou copiar os materiais;</li>
              <li>usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
              <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido na plataforma;</li>
              <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
              <li>transferir os materiais para outra pessoa ou 'espelhar' os materiais em qualquer outro servidor.</li>
            </ul>
            
            <h3 className="text-lg font-semibold">3. Proteção de Dados</h3>
            <p className="text-sm">
              Nossa política de privacidade explica como coletamos, usamos e protegemos suas informações pessoais. Ao usar nossa plataforma, você concorda com a coleta e uso de informações de acordo com nossa política de privacidade.
            </p>
            
            <h3 className="text-lg font-semibold">4. Limitações</h3>
            <p className="text-sm">
              Em nenhum caso a plataforma ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro, ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em nossa plataforma, mesmo que a plataforma ou um representante autorizado tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
            </p>
            
            <h3 className="text-lg font-semibold">5. Precisão dos Materiais</h3>
            <p className="text-sm">
              Os materiais exibidos na plataforma podem incluir erros técnicos, tipográficos ou fotográficos. A plataforma não garante que qualquer material em seu site seja preciso, completo ou atual. A plataforma pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
            </p>
            
            <h3 className="text-lg font-semibold">6. Links</h3>
            <p className="text-sm">
              A plataforma não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso pela plataforma do site. O uso de qualquer site vinculado é por conta e risco do usuário.
            </p>
            
            <h3 className="text-lg font-semibold">7. Modificações</h3>
            <p className="text-sm">
              A plataforma pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
            </p>
            
            <h3 className="text-lg font-semibold">8. Lei Aplicável</h3>
            <p className="text-sm">
              Estes termos e condições são regidos e interpretados de acordo com as leis brasileiras e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
            </p>
            
            <Textarea 
              className="mt-4" 
              rows={4} 
              placeholder="Se tiver dúvidas ou comentários sobre nossos Termos e Condições, entre em contato conosco." 
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setTermsDialogOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setTermsDialogOpen(false);
                toast({
                  title: "Termos aceitos",
                  description: "Você aceitou os Termos e Condições de Uso.",
                });
              }}>
                Aceitar Termos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProfileSettingsPage;
