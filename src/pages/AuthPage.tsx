
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronRight, CheckCircle, Mail, KeyRound, User, Building, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import ForgotPassword from "@/components/ForgotPassword";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (isLogin) {
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos",
          variant: "destructive",
        });
        return;
      }
      
      // Mock login for demonstration
      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });
      
      // Navigate to dashboard after "login"
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      // Registration validation
      if (!name || !email || !password || !phone || !acceptTerms) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      if (password.length < 8) {
        toast({
          title: "Senha fraca",
          description: "A senha deve ter pelo menos 8 caracteres",
          variant: "destructive",
        });
        return;
      }
      
      // Mock registration for demonstration
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });
      
      // Go to login after "registration"
      setTimeout(() => setIsLogin(true), 1500);
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
              setIsLogin(true);
            }}
          />
        </div>
      </div>
    );
  }

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
        </nav>
        
        <div className="flex-grow flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-6">
            Para acessar a plataforma do Farol do Mercado
          </h2>
          <p className="text-gray-800">
            você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
            acompanhe em seu e-mail as etapas para usar todas as funcionalidade e 
            iniciar uma gestão inteligente em saúde corporativa.
          </p>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-full md:w-3/5 lg:w-2/3 p-4 md:p-8 lg:p-12 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back button and auth toggle */}
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="text-primary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-gray-700">
              {isLogin ? (
                <span>
                  Não tem conta? <button onClick={toggleAuthMode} className="text-primary font-medium">Cadastrar</button>
                </span>
              ) : (
                <span>
                  Já tem conta? <button onClick={toggleAuthMode} className="text-primary font-medium">Entrar</button>
                </span>
              )}
            </div>
          </div>
        
          {/* Form Title */}
          <h1 className="text-3xl font-bold mb-8">
            Vamos <span className="text-primary">iniciar</span>
          </h1>
        
          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Primeiro e último nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  A senha deve ter pelo menos 8 caracteres, sendo 1 número, 1 letra maiúscula e 1 caractere especial
                </p>
              )}
            </div>
            
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa ou Mentor</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="company" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Digite o nome da empresa ou mentor"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="cnpj" 
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="Digite o CNPJ"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Digite seu celular"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Eu aceito os <a href="#" className="text-primary">Termos e Condições</a>
                  </label>
                </div>
              </>
            )}
            
            {isLogin && (
              <div className="flex justify-between items-center">
                <button 
                  type="button" 
                  className="text-sm text-primary"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-6"
            >
              {isLogin ? "Entrar" : "Cadastrar acesso"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
