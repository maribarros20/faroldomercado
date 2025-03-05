
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu e-mail",
        variant: "destructive",
      });
      return;
    }
    
    // Mock email sending
    toast({
      title: "E-mail enviado",
      description: "Um código de recuperação foi enviado para seu e-mail",
    });
    
    setStep("code");
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

  const handleSubmitNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    // Mock password reset success
    toast({
      title: "Senha redefinida",
      description: "Sua senha foi atualizada com sucesso",
    });
    
    // Return to login
    setTimeout(() => onReset(), 1500);
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
              />
            </div>
            <p className="text-sm text-gray-500">
              Digite o e-mail associado à sua conta para receber um código de recuperação.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
          >
            Enviar código
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
              />
            </div>
            <p className="text-sm text-gray-500">
              Digite o código de 6 dígitos enviado para {email}
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
          >
            Verificar código
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
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white py-6"
          >
            Redefinir senha
          </Button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
