
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
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
  const { expanded } = useSidebar();
  
  const NavItem = ({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) => {
    // Fix for quizzes path - we need to check if the path matches the beginning part
    const isActive = href === '/quizzes' 
      ? location.pathname.startsWith('/quizzes')
      : location.pathname.startsWith(href);
    
    return (
      <NavLink
        to={href}
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
          isActive 
            ? "bg-[#e6f0ff] text-[#0066FF]" 
            : "text-gray-700 hover:bg-[#e6f0ff] hover:text-[#0066FF]",
          expanded ? "justify-start" : "justify-center"
        )}
      >
        {icon}
        {expanded && <span className="ml-2">{label}</span>}
      </NavLink>
    );
  };
  
  return (
    <div className="space-y-1 px-2">
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
      
      {expanded ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-3 py-2 mt-2 text-sm font-medium text-gray-700 hover:bg-[#e6f0ff] hover:text-[#0066FF]">
              <Avatar className="w-5 h-5 mr-2">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Profile"} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span>{user?.displayName || "Perfil"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="cursor-pointer">Perfil</NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/profile-settings" className="cursor-pointer">Configurações</NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut(() => {
              toast({
                title: "Desconectado",
                description: "Você foi desconectado com sucesso.",
              })
            })}>
              Desconectar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <NavLink
          to="/profile"
          className={cn(
            "flex justify-center items-center rounded-md px-3 py-2 text-sm font-medium",
            location.pathname === "/profile" ? "bg-[#e6f0ff] text-[#0066FF]" : "text-gray-700 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          )}
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Profile"} />
            <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </NavLink>
      )}
    </div>
  );
}

export default Navigation;
