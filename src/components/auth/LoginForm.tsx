
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  setShowForgotPassword: (show: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoginForm = ({ setShowForgotPassword, loading, setLoading }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log(`Attempting login with: ${email} (trimmed: ${email.trim()})`);
      
      // Make sure to trim the email address to remove any potential whitespace
      const trimmedEmail = email.trim();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });
      
      if (error) {
        console.error("Login error details:", error);
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.",
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
      
      // Ensure redirection happens
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Digite seu e-mail" 
            className="pl-10" 
            required 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha *</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Digite sua senha" 
            className="pl-10" 
            required 
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          type="button" 
          className="text-sm text-primary" 
          onClick={() => setShowForgotPassword(true)}
        >
          Esqueceu a senha?
        </button>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full text-white py-6 bg-[#0066ff]">
        Entrar
        {loading ? <span className="ml-2 animate-spin">◌</span> : null}
      </Button>
    </form>
  );
};

export default LoginForm;
