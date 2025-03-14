
import React from "react";
import { User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserProfileHeaderProps {
  userName: string | null;
  userRole: string | null;
  avatarUrl: string | null;
}

const UserProfileHeader = ({ userName, userRole, avatarUrl }: UserProfileHeaderProps) => {
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

  const initials = userName 
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className={cn(
          "flex items-center space-x-2 cursor-pointer",
          "transition-all duration-200 ease-in-out",
          "rounded-full p-1 hover:bg-[#e6f0ff]",
          "border border-transparent hover:border-gray-100",
          "shadow-sm"
        )}>
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={userName || "Usuário"} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="hidden md:flex flex-col text-left mr-2">
            <span className="text-sm font-medium truncate max-w-32">
              {userName || "Usuário"}
            </span>
            <span className="text-xs text-muted-foreground">
              {userRole === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}
          className="hover:bg-[#e6f0ff] hover:text-[#0066FF] cursor-pointer">
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile-settings")}
          className="hover:bg-[#e6f0ff] hover:text-[#0066FF] cursor-pointer">
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileHeader;
