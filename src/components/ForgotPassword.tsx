
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordProps {
  onBack: () => void;
  onReset: () => void;
}

const ForgotPassword = ({ onBack, onReset }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for reset token in URL on component mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    
    if (type === "recovery" && accessToken) {
      setResetToken(accessToken);
      toast({
        title: "Token de recuperação detectado",
        description: "Digite sua nova senha para concluir a recuperação.",
      });
    }
  }, []); // Added dependency array to prevent continuous execution

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu e-mail",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/auth?reset=true",
      });
      
      if (error) {
        console.error("Reset password error:", error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      toast({
        title: "E-mail enviado",
        description: "Um link de recuperação foi enviado para seu e-mail. Por favor, verifique sua caixa de entrada e spam.",
      });
      
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao solicitar a recuperação de senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!password || password.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Update password error:", error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi atualizada com sucesso. Você será redirecionado para o login.",
      });
      
      // Return to login
      setTimeout(() => onReset(), 1500);
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao redefinir sua senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack} 
          className="text-primary flex items-center gap-2"
          type="button"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">
        Recuperar <span className="text-primary">senha</span>
      </h1>

      {!resetToken ? (
        <form onSubmit={handleSubmitEmail} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                id="recovery-email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="pl-10"
                required
              />
            </div>
            <p className="text-sm text-gray-500">
              Digite o e-mail associado à sua conta para receber um link de recuperação.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
            disabled={loading}
          >
            Enviar link de recuperação
            {loading && <span className="ml-2 animate-spin">◌</span>}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitNewPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                id="new-password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A senha deve ter pelo menos 8 caracteres, sendo 1 número, 1 letra maiúscula e 1 caractere especial
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                id="confirm-password" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
            disabled={loading}
          >
            Redefinir senha
            {loading && <span className="ml-2 animate-spin">◌</span>}
          </Button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
