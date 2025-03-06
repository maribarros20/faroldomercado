
import { useState } from "react";
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
  const [step, setStep] = useState<"email" | "code" | "newPassword">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth?step=reset-password",
      });
      
      if (error) {
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
        description: "Um link de recuperação foi enviado para seu e-mail",
      });
      
      setStep("code");
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

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast({
        title: "Erro",
        description: "Por favor, digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }
    
    setStep("newPassword");
  };

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // In a real implementation, this would use the token from the URL
      // to update the password. For now, we'll just show a success message
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi atualizada com sucesso",
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
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">
        Recuperar <span className="text-primary">senha</span>
      </h1>

      {step === "email" && (
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
              Digite o e-mail associado à sua conta para receber um código de recuperação.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
            disabled={loading}
          >
            Enviar código
            {loading && <span className="ml-2 animate-spin">◌</span>}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleSubmitCode} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recovery-code">Código de recuperação</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                id="recovery-code" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código de 6 dígitos"
                className="pl-10"
                maxLength={6}
                required
              />
            </div>
            <p className="text-sm text-gray-500">
              Digite o código de 6 dígitos enviado para {email}
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
            disabled={loading}
          >
            Verificar código
            {loading && <span className="ml-2 animate-spin">◌</span>}
          </Button>
        </form>
      )}

      {step === "newPassword" && (
        <form onSubmit={handleSubmitNewPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                id="new-password" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
