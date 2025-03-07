import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  LayoutDashboard,
  BookOpen,
  Video,
  Users,
  CreditCard,
  Settings,
  ChevronRight,
  LogOut,
  Shield,
  TrendingUp,
  BookMarked,
  LineChart,
  User,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Globe,
} from "lucide-react";
import { Sidebar as UISidebar, useSidebar, SidebarProvider, Trigger, Header, Section, Content, Footer } from "@/components/ui/sidebar";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGreeting } from "@/hooks/use-greeting";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { expanded, setExpanded } = useSidebar();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }
          
          if (profile) {
            setUserRole(profile.role);
            setAvatarUrl(profile.photo);
            setUserName(`${profile.first_name} ${profile.last_name}`);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

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

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [location.pathname, isMobile, setExpanded]);

  return (
    <UISidebar className={`border-r min-h-screen transition-all duration-300 bg-background ${
      expanded ? "w-64" : "w-20"
    } flex flex-col`}>
      <Header className="flex items-center justify-between p-4 border-b h-16">
        <div className="flex items-center">
          {expanded && <Logo />}
        </div>
        <Trigger
          className="p-2 rounded-full hover:bg-gray-100"
          icon={expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        />
      </Header>
      
      <Content className="flex-1 py-4 overflow-y-auto flex flex-col justify-between">
        <Section className="space-y-1 px-3">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={20} />}
            text="Radar"
            active={isActive("/dashboard")}
            expanded={expanded}
          />
          
          <NavItem
            to="/materials"
            icon={<BookOpen size={20} />}
            text="Documentos"
            active={isActive("/materials")}
            expanded={expanded}
          />
          
          <NavItem
            to="/videos"
            icon={<Video size={20} />}
            text="Vídeos"
            active={isActive("/videos")}
            expanded={expanded}
          />
          
          <NavItem
            to="/progress"
            icon={<TrendingUp size={20} />}
            text="Desempenho"
            active={isActive("/progress")}
            expanded={expanded}
          />
          
          <NavItem
            to="/community"
            icon={<Users size={20} />}
            text="Farolverso"
            active={isActive("/community")}
            expanded={expanded}
          />
          
          <NavItem
            to="/plans"
            icon={<CreditCard size={20} />}
            text="Planos"
            active={isActive("/plans")}
            expanded={expanded}
          />
          
          <NavItem
            to="/profile-settings"
            icon={<Settings size={20} />}
            text="Configurações"
            active={isActive("/profile-settings")}
            expanded={expanded}
          />
          
          {userRole === "admin" && (
            <NavItem
              to="/admin"
              icon={<Shield size={20} />}
              text="Admin"
              active={isActive("/admin") || location.pathname.startsWith("/admin/")}
              expanded={expanded}
            />
          )}
        </Section>

        <div className="mt-auto">
          {expanded && (
            <Section className="px-3 space-y-1 mb-4">
              <div className="bg-primary rounded-lg px-3 py-3">
                <a 
                  href="https://www.faroldomercado.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
                >
                  <Globe className="w-5 h-5 mr-3" />
                  Site Farol
                </a>

                <a 
                  href="https://painel.faroldomercado.com/farolito-blog" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
                >
                  <BookMarked className="w-5 h-5 mr-3" />
                  Blog Farolito
                </a>

                <a 
                  href="https://share.chatling.ai/s/PnKmMgATCQPf4tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Luma IA
                </a>

                <a 
                  href="https://api.whatsapp.com/send/?phone=5585996282222&text&type=phone_number&app_absent=0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 mr-3" />
                  Ajuda
                </a>
              </div>
            </Section>
          )}
        </div>
      </Content>
      
      <Footer className="border-t p-4">
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
      </Footer>
    </UISidebar>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
  expanded: boolean;
}

const NavItem = ({ to, icon, text, active, expanded }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100"
      } ${expanded ? "justify-start" : "justify-center"}`}
    >
      <span className={expanded ? "mr-3" : ""}>{icon}</span>
      {expanded && <span className="font-medium">{text}</span>}
    </Link>
  );
};

export default Sidebar;
