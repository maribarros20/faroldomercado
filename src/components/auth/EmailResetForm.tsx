
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailResetFormProps {
  onSuccess: () => void;
}

const EmailResetForm = ({ onSuccess }: EmailResetFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      onSuccess();
      
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
  );
};

export default EmailResetForm;
