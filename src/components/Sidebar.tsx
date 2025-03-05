
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BookOpen, 
  Video, 
  Shield, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  User 
} from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Check if current user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['sidebar-check-admin'],
    queryFn: async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return false;
      
      // Get user role from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return false;
      }
      
      return data?.role === 'admin';
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Keep sidebar expanded on desktop
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  // Base menu items that all users can see
  const baseMenuItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={20} />, 
      path: "/dashboard",
    },
    { 
      name: "Materiais", 
      icon: <BookOpen size={20} />, 
      path: "/materials",
    },
    { 
      name: "Vídeos", 
      icon: <Video size={20} />, 
      path: "/videos",
    },
  ];
  
  // Admin menu item
  const adminMenuItem = { 
    name: "Admin", 
    icon: <Shield size={20} />, 
    path: "/admin",
  };
  
  // Combine menu items based on user role
  const menuItems = isAdmin 
    ? [...baseMenuItems, adminMenuItem] 
    : baseMenuItems;

  const isActive = (path: string) => {
    // For exact matches
    if (location.pathname === path) return true;
    
    // For nested routes (if we had them)
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  // Hamburger button for mobile
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(!isOpen)}
      className="absolute top-4 right-4 md:hidden z-30"
    >
      {isOpen ? <X /> : <Menu />}
    </Button>
  );

  return (
    <>
      <MobileMenuButton />
      
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border h-screen flex-col transition-all duration-300 ease-in-out z-20",
          isOpen ? "flex fixed md:relative w-64" : "hidden md:flex w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between h-16">
          <div className={cn(
            "transition-all duration-300",
            !isOpen && "md:scale-0 md:w-0 md:opacity-0"
          )}>
            <Logo />
          </div>
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              className="md:flex hidden"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full justify-start sidebar-item",
                    isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground",
                    !isOpen && "md:justify-center"
                  )}
                >
                  {item.icon}
                  <span className={cn(
                    "ml-2 transition-all duration-300",
                    !isOpen && "md:hidden md:w-0"
                  )}>
                    {item.name}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <ul className="space-y-2">
            <li>
              <Button
                variant={isActive("/profile") ? "default" : "ghost"}
                onClick={() => navigate("/profile")}
                className={cn(
                  "w-full justify-start sidebar-item",
                  isActive("/profile") && "bg-sidebar-accent text-sidebar-accent-foreground",
                  !isOpen && "md:justify-center"
                )}
              >
                <User size={20} />
                <span className={cn(
                  "ml-2 transition-all duration-300",
                  !isOpen && "md:hidden md:w-0"
                )}>
                  Meu Perfil
                </span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className={cn(
                  "w-full justify-start sidebar-item",
                  !isOpen && "md:justify-center"
                )}
              >
                <LogOut size={20} />
                <span className={cn(
                  "ml-2 transition-all duration-300",
                  !isOpen && "md:hidden md:w-0"
                )}>
                  Sair
                </span>
              </Button>
            </li>
          </ul>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
