
import React from "react";
import { User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileProps {
  expanded: boolean;
  userName: string | null;
  userRole: string | null;
  avatarUrl: string | null;
}

const UserProfile = ({ expanded, userName, userRole, avatarUrl }: UserProfileProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Erro ao fazer logout",
          description: "Ocorreu um erro ao tentar desconectar.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado com sucesso.",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-gray-500" />
          )}
        </div>
        {expanded && (
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-32">
              {userName || "Usuário"}
            </span>
            <span className="text-xs text-muted-foreground">
              {userRole === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
        )}
      </div>
      
      <button
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-gray-100"
        title="Sair"
      >
        <LogOut size={20} className="text-gray-500" />
      </button>
    </div>
  );
};

export default UserProfile;
