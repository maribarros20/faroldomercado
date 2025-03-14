
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useResetToken = () => {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for reset token in URL on component mount
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
  }, []); 

  return { resetToken };
};
