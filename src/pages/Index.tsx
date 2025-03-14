import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, ArrowLeft, Mail, KeyRound, User, Phone } from "lucide-react";
import ForgotPassword from "@/components/ForgotPassword";
import TermsAndConditions from "@/components/TermsAndConditions";
const Index = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Registration and login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    date_of_birth: "",
    acceptTerms: false
  });
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        const {
          data,
          error
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking authentication:", error);
          setCheckingSession(false);
          return;
        }
        if (data.session) {
          navigate("/dashboard");
        } else {
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [navigate]);
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
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
        setLoading(false);
        return;
      }

      // Sign in with Supabase
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      if (error) {
        console.error("Login error details:", error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!"
      });

      // Navigation happens automatically via the auth listener in App.tsx
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.cpf || !registerData.phone || !registerData.date_of_birth) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate password
      if (registerData.password.length < 8) {
        toast({
          title: "Senha inválida",
          description: "A senha deve ter pelo menos 8 caracteres.",
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

      // Extract first and last name from full name
      const nameParts = registerData.fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Register with Supabase
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: registerData.phone,
            cpf: registerData.cpf,
            date_of_birth: registerData.date_of_birth,
            role: 'user'
          }
        }
      });
      console.log("Resposta do registro:", {
        data,
        error
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

      // Check if user already exists (Supabase returns empty identities array)
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "E-mail já cadastrado",
          description: "Este e-mail já está cadastrado no sistema. Tente fazer login ou recuperar sua senha.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Registration successful
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu e-mail para confirmar o cadastro."
      });
      setShowRegisterDialog(false);

      // If email confirmation is disabled in Supabase, redirect to dashboard
      if (data.session) {
        // Navigation happens automatically via the auth listener in App.tsx
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  if (checkingSession) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verificando sessão...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex flex-col md:flex-row w-full max-h-screen overflow-hidden">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <div>
              <span className="text-gray-600 text-sm">Não tem conta?</span>{" "}
              <Button variant="link" className="text-trade-blue p-0 text-sm" onClick={() => setShowRegisterDialog(true)}>
                Cadastrar
              </Button>
            </div>
          </div>

          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} className="bg-white rounded-lg p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Acessar plataforma</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Se você ainda não é membro ou não possui cadastro, você pode solicitar{" "}
              <Button variant="link" className="text-trade-blue p-0 font-semibold text-sm" onClick={() => setShowRegisterDialog(true)}>
                clicando aqui
              </Button>.
            </p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={loginData.email} onChange={handleLoginChange} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" value={loginData.password} onChange={handleLoginChange} required />
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="link" className="text-gray-600 p-0 text-sm" type="button" onClick={() => setShowForgotPasswordDialog(true)}>
                  Esqueceu a senha?
                </Button>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full bg-trade-blue hover:bg-trade-blue text-white">
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
          <img src="/lovable-uploads/42d43b84-f455-4272-a9c7-96160af1bce2.png" alt="Profissional usando um tablet" className="object-cover h-full w-full" style={{
          maxHeight: "100vh",
          objectPosition: "center top"
        }} />
        </div>
      </div>

      {/* Registration Dialog / Pop-up */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md md:max-w-5xl p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row w-full">
            {/* Left Section in Dialog - Blue Background */}
            <div className="bg-trade-blue w-full md:w-1/2 p-8 flex flex-col">
              <div className="flex space-x-6 mb-8 text-white">
                <a href="/" className="text-base font-medium hover:underline">Site</a>
                <a href="/" className="text-base font-medium hover:underline">Blog</a>
                <a href="/" className="text-base font-medium hover:underline">Falar com Luma</a>
                <a href="/" className="text-base font-medium hover:underline">Ajuda</a>
              </div>
              
              <div className="flex-1 flex flex-col justify-center max-w-md">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Para acessar a plataforma do Farol do Mercado
                </h1>
                <p className="text-white mb-8 text-sm">
                  você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
                  acompanhe em seu e-mail as etapas para usar todas as funcionalidades e iniciar 
                  uma gestão inteligente em saúde corporativa.
                </p>
              </div>
            </div>

            {/* Right Section in Dialog - Registration Form */}
            <div className="w-full md:w-1/2 bg-white p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => setShowRegisterDialog(false)}>
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
                    <Input id="fullName" name="fullName" value={registerData.fullName} onChange={handleRegisterChange} className="pl-10" placeholder="Digite seu nome completo" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="registerEmail" name="email" type="email" value={registerData.email} onChange={handleRegisterChange} className="pl-10" placeholder="Digite seu e-mail" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Senha *</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="registerPassword" name="password" type="password" value={registerData.password} onChange={handleRegisterChange} className="pl-10" placeholder="Digite sua senha" required />
                  </div>
                  <p className="text-xs text-gray-500">
                    A senha deve ter pelo menos 8 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento *</Label>
                  <Input id="date_of_birth" name="date_of_birth" type="date" value={registerData.date_of_birth} onChange={handleRegisterChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="cpf" name="cpf" value={registerData.cpf} onChange={handleRegisterChange} className="pl-10" placeholder="Digite seu CPF" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="phone" name="phone" value={registerData.phone} onChange={handleRegisterChange} className="pl-10" placeholder="Digite seu celular" required />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox id="terms" checked={registerData.acceptTerms} onCheckedChange={handleRegisterCheckboxChange} required />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Eu aceito os <Button variant="link" className="h-auto p-0 text-trade-blue text-sm" onClick={e => {
                    e.preventDefault();
                    setShowTermsDialog(true);
                  }}>
                      Termos e Condições
                    </Button>
                  </label>
                </div>
                
                <Button type="submit" className="w-full bg-trade-blue hover:bg-trade-dark-blue text-white mt-4" disabled={loading}>
                  Cadastrar acesso
                  {loading && <span className="ml-2 animate-spin">◌</span>}
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog / Pop-up */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md md:max-w-5xl p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row w-full">
            {/* Left Section in Dialog - Blue Background */}
            <div className="bg-trade-blue w-full md:w-1/2 p-8 flex flex-col">
              <div className="flex space-x-6 mb-8 text-white">
                <a href="/" className="text-base font-medium hover:underline">Site</a>
                <a href="/" className="text-base font-medium hover:underline">Blog</a>
                <a href="/" className="text-base font-medium hover:underline">Falar com Luma</a>
                <a href="/" className="text-base font-medium hover:underline">Ajuda</a>
              </div>
              
              <div className="flex-1 flex flex-col justify-center max-w-md">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
                  Para recuperar sua senha
                </h1>
                <p className="text-white mb-8 text-sm">
                  siga as instruções para redefinir sua senha de acesso. Você receberá um código de verificação no e-mail associado à sua conta.
                </p>
              </div>
            </div>

            {/* Right Section in Dialog - Forgot Password Form */}
            <div className="w-full md:w-1/2 bg-white p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => setShowForgotPasswordDialog(false)}>
                  <ArrowLeft size={20} />
                </Button>
                <div className="flex-1 text-right">
                  <span className="text-gray-600 text-sm">Lembrou sua senha?</span>{" "}
                  <Button variant="link" className="text-trade-blue p-0 text-sm" onClick={() => {
                  setShowForgotPasswordDialog(false);
                }}>
                    Entrar
                  </Button>
                </div>
              </div>

              <div className="pb-4 text-center">
                <h2 className="text-xl font-bold">
                  Recupere <span className="text-trade-blue">sua senha</span>
                </h2>
              </div>
              
              <ForgotPassword onBack={() => setShowForgotPasswordDialog(false)} onReset={() => {
              setShowForgotPasswordDialog(false);
              toast({
                title: "Email enviado",
                description: "Verifique seu e-mail para instruções de redefinição de senha."
              });
            }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Dialog */}
      <TermsAndConditions isOpen={showTermsDialog} onClose={() => setShowTermsDialog(false)} />
    </div>;
};
export default Index;