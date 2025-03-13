
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, MessageSquare, Gauge, Settings, BarChart3, Brain } from "lucide-react";

function Navigation() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const NavItem = ({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) => {
    const isActive = location.pathname === href;
    
    return (
      <NavLink
        to={href}
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </NavLink>
    );
  };
  
  return (
    <div className="space-y-1">
      <NavItem
        icon={<Gauge className="w-5 h-5" />}
        href="/dashboard"
        label="Dashboard"
      />
      <NavItem
        icon={<BookOpen className="w-5 h-5" />}
        href="/materials"
        label="Materiais"
      />
      <NavItem
        icon={<Video className="w-5 h-5" />}
        href="/videos"
        label="Vídeos"
      />
      <NavItem
        icon={<Brain className="w-5 h-5" />}
        href="/quizzes"
        label="Quizzes"
      />
      <NavItem
        icon={<MessageSquare className="w-5 h-5" />}
        href="/community"
        label="Comunidade"
      />
      <NavItem
        icon={<BarChart3 className="w-5 h-5" />}
        href="/progress"
        label="Meu Progresso"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 w-full justify-start px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium text-muted-foreground">
            <Avatar className="w-5 h-5">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Profile"} />
              <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span>{user?.displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut(() => {
            toast({
              title: "Desconectado",
              description: "Você foi desconectado com sucesso.",
            })
          })}>
            Desconectar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NavLink to="/settings" className="w-full h-full block">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                <span>Configurações</span>
              </div>
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Navigation;
