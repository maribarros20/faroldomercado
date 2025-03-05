
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
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
    acceptTerms: false
  });

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would validate and authenticate the user
    if (loginData.email && loginData.password) {
      navigate("/dashboard");
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!"
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!registerData.fullName || !registerData.email || !registerData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
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
      return;
    }
    
    // Validate terms acceptance
    if (!registerData.acceptTerms) {
      toast({
        title: "Termos e Condições",
        description: "Você precisa aceitar os termos e condições para se cadastrar.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would register the user and authenticate them
    toast({
      title: "Cadastro realizado com sucesso",
      description: "Verifique seu e-mail para confirmar o cadastro."
    });
    
    setShowRegisterDialog(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Left Section - Blue Background */}
      <div className="bg-trade-blue w-full md:w-1/2 p-8 flex flex-col">
        <div className="flex space-x-8 mb-12 text-white">
          <a href="#" className="text-lg font-medium hover:underline">Site</a>
          <a href="#" className="text-lg font-medium hover:underline">Blog</a>
          <a href="#" className="text-lg font-medium hover:underline">Falar com Luma</a>
        </div>
        
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Para acessar a plataforma do Farol do Mercado
          </h1>
          <p className="text-white mb-8">
            você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
            acompanhe em seu e-mail as etapas para usar todas as funcionalidade e iniciar 
            uma gestão inteligente em saúde corporativa.
          </p>
        </div>
      </div>

      {/* Right Section - White Background with Login Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex-1 text-right">
              <span className="text-gray-600">Já tem conta?</span>{" "}
              <Button variant="link" className="text-trade-blue p-0" onClick={() => navigate("/auth")}>
                Entrar
              </Button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-6">Acessar plataforma</h2>
            <p className="text-gray-600 mb-6">
              Se você ainda não é membro ou não possui cadastro, você pode solicitar{" "}
              <Button 
                variant="link" 
                className="text-trade-blue p-0 font-semibold" 
                onClick={() => setShowRegisterDialog(true)}
              >
                clicando aqui
              </Button>.
            </p>
            
            <form onSubmit={handleLogin} className="space-y-6">
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
                <Button variant="link" className="text-gray-600 p-0">
                  Esqueceu a senha?
                </Button>
              </div>
              
              <Button type="submit" className="w-full bg-trade-blue hover:bg-trade-dark-blue text-white">
                Entrar
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Registration Dialog / Pop-up */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={() => setShowRegisterDialog(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Button>
              <div className="flex-1 text-right">
                <span className="text-gray-600">Já tem conta?</span>{" "}
                <Button variant="link" className="text-trade-blue p-0" onClick={() => {
                  setShowRegisterDialog(false);
                  navigate("/auth");
                }}>
                  Entrar
                </Button>
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Vamos <span className="text-trade-blue">iniciar</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleRegister} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Primeiro e último nome</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={registerData.fullName}
                onChange={handleRegisterChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registerEmail">E-mail</Label>
              <Input 
                id="registerEmail" 
                name="email" 
                type="email" 
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registerPassword">Senha</Label>
              <Input 
                id="registerPassword" 
                name="password" 
                type="password" 
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 8 caracteres, sendo 1 número, 1 letra maiúscula e 1 caractere especial
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa ou Mentor</Label>
              <Input 
                id="company" 
                name="company" 
                value={registerData.company}
                onChange={handleRegisterChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input 
                id="cnpj" 
                name="cnpj" 
                value={registerData.cnpj}
                onChange={handleRegisterChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Celular</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={registerData.phone}
                onChange={handleRegisterChange}
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox 
                id="terms" 
                checked={registerData.acceptTerms}
                onCheckedChange={handleRegisterCheckboxChange}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Eu aceito os <Button variant="link" className="h-auto p-0 text-trade-blue">Termos e Condições</Button>
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-trade-blue hover:bg-trade-dark-blue text-white mt-4">
              Cadastrar acesso
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
