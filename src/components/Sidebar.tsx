
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Book, 
  Play, 
  Users, 
  BarChart, 
  Settings, 
  LogOut, 
  ShieldCheck,
  UserCircle 
} from "lucide-react";
import Logo from "./Logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        setUser(sessionData.session.user);
        
        // Check if user is admin
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionData.session.user.id)
          .single();
          
        setIsAdmin(profileData?.role === "admin");
      }
    };
    
    fetchUserData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
          
          // Check if user is admin
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
            
          setIsAdmin(profileData?.role === "admin");
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sair da sua conta.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Você saiu da sua conta com sucesso.",
      });
      navigate("/");
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Materiais",
      icon: <Book className="h-5 w-5" />,
      href: "/materials",
    },
    {
      title: "Vídeos",
      icon: <Play className="h-5 w-5" />,
      href: "/videos",
    },
    {
      title: "Comunidade",
      icon: <Users className="h-5 w-5" />,
      href: "/community",
    },
    {
      title: "Progresso",
      icon: <BarChart className="h-5 w-5" />,
      href: "/progress",
    },
    {
      title: "Meu Perfil",
      icon: <UserCircle className="h-5 w-5" />,
      href: "/profile",
    },
    {
      title: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      href: "/profile-settings",
    },
  ];

  // Add admin menu item if user is admin
  if (isAdmin) {
    menuItems.push({
      title: "Administração",
      icon: <ShieldCheck className="h-5 w-5" />,
      href: "/admin",
    });
  }

  return (
    <SidebarContainer>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex gap-2 items-center">
          <Logo className="h-6 w-6" />
          <span className="font-bold text-xl">Farol do Mercado</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="px-3 py-2">
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start mb-4"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Sair</span>
        </Button>
        <SidebarTrigger />
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
