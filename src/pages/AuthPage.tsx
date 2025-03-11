import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronRight, CheckCircle, Mail, KeyRound, User, Building, Phone, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import ForgotPassword from "@/components/ForgotPassword";
import { supabase } from "@/integrations/supabase/client";

interface AuthPageProps {
  isRegister?: boolean;
}

const AuthPage = ({
  isRegister = false
}: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(!isRegister);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        console.log("Checking session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setCheckingSession(false);
          return;
        }
        
        console.log("Session check result:", data);
        
        if (data.session) {
          console.log("User is logged in, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("No active session found");
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form before submission
      if (isLogin) {
        if (!email || !password) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log("Attempting login with:", { email });
        
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error("Login error details:", error);
          
          // Show more user-friendly error messages
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Credenciais inválidas",
              description: "E-mail ou senha incorretos. Por favor, tente novamente.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Erro ao fazer login",
              description: error.message,
              variant: "destructive"
            });
          }
          
          setLoading(false);
          return;
        }
        
        if (!data.session) {
          console.error("No session returned after successful login");
          toast({
            title: "Erro de sessão",
            description: "Não foi possível iniciar sua sessão. Por favor, tente novamente.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        console.log("Login successful:", data);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Você será redirecionado para o dashboard."
        });

        // Navigation happens via auth listener in App.tsx
      } else {
        // Registration validation for required fields
        if (!name || !email || !password || !phone || !cpf || !dateOfBirth || !acceptTerms) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos obrigatórios",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        if (password.length < 8) {
          toast({
            title: "Senha fraca",
            description: "A senha deve ter pelo menos 8 caracteres",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Extract first and last name for database
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        console.log("Attempting registration with:", { email, firstName, lastName });

        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              cnpj,
              phone,
              cpf,
              date_of_birth: dateOfBirth,
              role: 'user',
              tipo_de_conta: 'trader' // Default account type
            }
          }
        });
        
        console.log("Registration response:", { data, error });
        
        if (error) {
          toast({
            title: "Erro ao criar conta",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Check if user already exists (Supabase returns empty identities array)
        if (data?.user?.identities && data.user.identities.length === 0) {
          toast({
            title: "E-mail já cadastrado",
            description: "Este e-mail já está cadastrado no sistema. Tente fazer login ou recuperar sua senha.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu e-mail para confirmar o cadastro."
        });
        
        // If email confirmation is disabled in Supabase and we have a session
        if (data.session) {
          console.log("Registration successful with session, redirecting to dashboard");
          // Navigation happens via auth listener in App.tsx
        } else {
          console.log("Registration successful, email confirmation required");
          // Switch to login after registration if no session (email confirmation required)
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Erro no processo de autenticação",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const clearStaleSession = async () => {
      try {
        // Check if there's a stale session token in localStorage but no valid session
        const { data } = await supabase.auth.getSession();
        
        if (!data.session && localStorage.getItem('supabase.auth.token')) {
          console.log("Found stale session token, clearing it");
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Error clearing stale session:", error);
      }
    };
    
    clearStaleSession();
  }, []);
  
  if (checkingSession) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verificando sessão...</p>
        </div>
      </div>;
  }
  
  if (showForgotPassword) {
    return <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="w-full md:w-2/5 lg:w-1/3 bg-blue-400 p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Farol do Mercado</h2>
          </div>
          
          <nav className="flex gap-8 mb-16">
            <a href="/" className="text-gray-800 hover:text-black font-medium">Site</a>
            <a href="/" className="text-gray-800 hover:text-black font-medium">Blog</a>
            <a href="/" className="text-gray-800 hover:text-black font-medium">Falar com Luma</a>
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
          <ForgotPassword onBack={() => setShowForgotPassword(false)} onReset={() => {
          setShowForgotPassword(false);
          setIsLogin(true);
          toast({
            title: "E-mail enviado",
            description: "Verifique seu e-mail para redefinir sua senha."
          });
        }} />
        </div>
      </div>;
  }
  
  return <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-2/5 lg:w-1/3 bg-blue-400 p-8 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Farol do Mercado</h2>
        </div>
        
        <nav className="flex gap-8 mb-16">
          <a href="/" className="text-gray-800 hover:text-black font-medium">Site</a>
          <a href="/" className="text-gray-800 hover:text-black font-medium">Blog</a>
          <a href="/" className="text-gray-800 hover:text-black font-medium">Falar com Luma</a>
        </nav>
        
        <div className="flex-grow flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-6">
            Para acessar a plataforma do Farol do Mercado
          </h2>
          <p className="text-gray-800">
            você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
            acompanhe em seu e-mail as etapas para usar todas as funcionalidades e 
            iniciar uma gestão inteligente em saúde corporativa.
          </p>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-full md:w-3/5 lg:w-2/3 p-4 md:p-8 lg:p-12 flex items-center justify-center">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="w-full max-w-md">
          {/* Back button and auth toggle */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate("/")} className="text-primary flex items-center gap-2">
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
            <div className="text-gray-700">
              {isLogin ? <span>
                  Não tem conta? <button onClick={toggleAuthMode} className="text-primary font-medium">Cadastrar</button>
                </span> : <span>
                  Já tem conta? <button onClick={toggleAuthMode} className="text-primary font-medium">Entrar</button>
                </span>}
            </div>
          </div>
        
          {/* Form Title */}
          <h1 className="text-3xl font-bold mb-8">
            {isLogin ? "Acessar" : "Cadastrar"} <span className="text-primary">conta</span>
          </h1>
        
          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && <>
                <div className="space-y-2">
                  <Label htmlFor="name">Primeiro e último nome *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Digite seu nome completo" className="pl-10" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
                  <div className="relative">
                    <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="pl-3" required />
                  </div>
                </div>
              </>}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="pl-10" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" className="pl-10" required />
              </div>
              {!isLogin && <p className="text-xs text-gray-500 mt-1">
                  A senha deve ter pelo menos 8 caracteres, sendo 1 número, 1 letra maiúscula e 1 caractere especial
                </p>}
            </div>
            
            {!isLogin && <>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="Digite seu CPF" className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa ou Mentor</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Digite o nome da empresa ou mentor" className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ da empresa ou do mentor</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="cnpj" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="Digite o CNPJ da empresa ou do mentor" className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Digite seu celular" className="pl-10" required />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="terms" className="rounded border-gray-300 text-primary focus:ring-primary" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} required />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Eu aceito os <a href="#" className="text-primary">Termos e Condições</a>
                  </label>
                </div>
              </>}
            
            {isLogin && <div className="flex justify-between items-center">
                <button type="button" className="text-sm text-primary" onClick={() => setShowForgotPassword(true)}>
                  Esqueceu a senha?
                </button>
              </div>}
            
            <Button type="submit" disabled={loading} className="w-full text-white py-6 bg-[#0066ff]">
              {isLogin ? "Entrar" : "Cadastrar acesso"}
              {loading ? <span className="ml-2 animate-spin">◌</span> : null}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>;
};

export default AuthPage;
