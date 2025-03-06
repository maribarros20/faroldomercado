
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, ArrowLeft, Mail, KeyRound, User, Building, Phone } from "lucide-react";
import ForgotPassword from "@/components/ForgotPassword";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(
    location.search.includes("forgot=true")
  );
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    company: "",
    cnpj: "",
    phone: "",
    cpf: "",
    date_of_birth: "",
    acceptTerms: false
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  const handleRegisterCheckboxChange = (checked: boolean) => {
    setRegisterData({
      ...registerData,
      acceptTerms: checked
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!loginData.email || !loginData.password) {
        toast({
          title: "Erro no login",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive"
        });
        return;
      }

      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!"
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields based on profiles table requirements
      if (!registerData.fullName || !registerData.email || !registerData.password || 
          !registerData.cpf || !registerData.phone || !registerData.date_of_birth) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Validate password
      if (registerData.password.length < 8 || 
          !/[A-Z]/.test(registerData.password) || 
          !/[0-9]/.test(registerData.password) || 
          !/[^A-Za-z0-9]/.test(registerData.password)) {
        toast({
          title: "Senha inválida",
          description: "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Validate terms acceptance
      if (!registerData.acceptTerms) {
        toast({
          title: "Termos e Condições",
          description: "Você precisa aceitar os termos e condições para se cadastrar.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Register with Supabase - modified to match database schema
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            first_name: registerData.fullName.split(" ")[0] || "",
            last_name: registerData.fullName.split(" ").slice(1).join(" ") || "",
            cnpj: registerData.cnpj,
            phone: registerData.phone,
            cpf: registerData.cpf,
            date_of_birth: registerData.date_of_birth
            // Removed company field as it doesn't exist in the database
          }
        }
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu e-mail para confirmar o cadastro."
      });
      
      setShowRegisterDialog(false);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="w-full md:w-2/5 lg:w-1/3 bg-blue-400 p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Farol do Mercado</h2>
          </div>
          
          <nav className="flex gap-8 mb-16">
            <a href="https://painel.faroldomercado.com.br" className="text-gray-800 hover:text-black font-medium">Site</a>
            <a href="https://painel.faroldomercado.com/farolito-blog" className="text-gray-800 hover:text-black font-medium">Blog</a>
            <a href="https://share.chatling.ai/s/PnKmMgATCQPf4tr" className="text-gray-800 hover:text-black font-medium">Falar com Luma</a>
            <a href="#" className="text-gray-800 hover:text-black font-medium">Ajuda</a>
          </nav>
          
          <div className="flex-grow flex flex-col justify-center">
            <h2 className="text-2xl font-semibold mb-6">
              Para recuperar sua senha
            </h2>
            <p className="text-gray-800">
              siga as instruções para redefinir sua senha de acesso. Você receberá um código de verificação no e-mail associado à sua conta.
            </p>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="w-full md:w-3/5 lg:w-2/3 p-4 md:p-8 lg:p-12 flex items-center justify-center">
          <ForgotPassword 
            onBack={() => setShowForgotPassword(false)} 
            onReset={() => {
              setShowForgotPassword(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full max-h-screen overflow-hidden">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <div>
              <span className="text-gray-600 text-sm">Já tem conta?</span>{" "}
              <Button variant="link" className="text-trade-blue p-0 text-sm" onClick={() => navigate("/dashboard")}>
                Entrar
              </Button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Acessar plataforma</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Se você ainda não é membro ou não possui cadastro, você pode solicitar{" "}
              <Button 
                variant="link" 
                className="text-trade-blue p-0 font-semibold text-sm" 
                onClick={() => setShowRegisterDialog(true)}
              >
                clicando aqui
              </Button>.
            </p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="link" 
                  className="text-gray-600 p-0 text-sm"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Esqueceu a senha?
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-trade-blue hover:bg-trade-dark-blue text-white"
                disabled={loading}
              >
                Entrar
                {loading && <span className="ml-2 animate-spin">◌</span>}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="w-full md:w-1/2 bg-gradient-to-r from-blue-50 to-blue-100 hidden md:block">
        <div className="h-full w-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/42d43b84-f455-4272-a9c7-96160af1bce2.png" 
            alt="Profissional usando um tablet" 
            className="object-cover h-full w-full"
            style={{ maxHeight: "100vh", objectPosition: "center top" }}
          />
        </div>
      </div>

      {/* Registration Dialog / Pop-up */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md md:max-w-5xl p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row w-full">
            {/* Left Section in Dialog - Blue Background */}
            <div className="bg-trade-blue w-full md:w-1/2 p-8 flex flex-col">
              <div className="flex space-x-6 mb-8 text-white">
                <a href="https://painel.faroldomercado.com.br" className="text-base font-medium hover:underline">Site</a>
                <a href="https://painel.faroldomercado.com/farolito-blog" className="text-base font-medium hover:underline">Blog</a>
                <a href="https://share.chatling.ai/s/PnKmMgATCQPf4tr" className="text-base font-medium hover:underline">Falar com Luma</a>
                <a href="#" className="text-base font-medium hover:underline">Ajuda</a>
              </div>
              
              <div className="flex-1 flex flex-col justify-center max-w-md">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Para acessar a plataforma do Farol do Mercado
                </h1>
                <p className="text-white mb-8 text-sm">
                  você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
                  acompanhe em seu e-mail as etapas para usar todas as funcionalidade e iniciar 
                  uma gestão inteligente em saúde corporativa.
                </p>
              </div>
            </div>

            {/* Right Section in Dialog - Registration Form */}
            <div className="w-full md:w-1/2 bg-white p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2" 
                  onClick={() => setShowRegisterDialog(false)}
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="flex-1 text-right">
                  <span className="text-gray-600 text-sm">Já tem conta?</span>{" "}
                  <Button variant="link" className="text-trade-blue p-0 text-sm" onClick={() => {
                    setShowRegisterDialog(false);
                  }}>
                    Entrar
                  </Button>
                </div>
              </div>

              <div className="pb-4 text-center">
                <h2 className="text-xl font-bold">
                  Vamos <span className="text-trade-blue">iniciar</span>
                </h2>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Primeiro e último nome *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="registerEmail" 
                      name="email" 
                      type="email" 
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite seu e-mail"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Senha *</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="registerPassword" 
                      name="password" 
                      type="password" 
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    A senha deve ter pelo menos 8 caracteres, sendo 1 número, 1 letra maiúscula e 1 caractere especial
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento *</Label>
                  <Input 
                    id="date_of_birth" 
                    name="date_of_birth" 
                    type="date" 
                    value={registerData.date_of_birth}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="cpf" 
                      name="cpf" 
                      value={registerData.cpf}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite seu CPF"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa ou Mentor</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="company" 
                      name="company" 
                      value={registerData.company}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite o nome da empresa ou mentor"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ da empresa ou do mentor</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="cnpj" 
                      name="cnpj" 
                      value={registerData.cnpj}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite o CNPJ da empresa ou do mentor"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      className="pl-10"
                      placeholder="Digite seu celular"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="terms" 
                    checked={registerData.acceptTerms}
                    onCheckedChange={handleRegisterCheckboxChange}
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Eu aceito os <Button variant="link" className="h-auto p-0 text-trade-blue text-sm">Termos e Condições</Button>
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-trade-blue hover:bg-trade-dark-blue text-white mt-4"
                  disabled={loading}
                >
                  Cadastrar acesso
                  {loading && <span className="ml-2 animate-spin">◌</span>}
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
