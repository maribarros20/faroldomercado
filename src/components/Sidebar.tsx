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
import { useMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();

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

  const menuItems = [
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
    { 
      name: "Admin", 
      icon: <Shield size={20} />, 
      path: "/admin",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

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
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full justify-start sidebar-item",
                    isActive(item.path) && "active",
                    !isOpen && "md:justify-center"
                  )}
                >
                  {item.icon}
                  <span className={cn(
                    "transition-all duration-300",
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
                variant="ghost"
                onClick={() => navigate("/profile")}
                className={cn(
                  "w-full justify-start sidebar-item",
                  isActive("/profile") && "active",
                  !isOpen && "md:justify-center"
                )}
              >
                <User size={20} />
                <span className={cn(
                  "transition-all duration-300",
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
                  "transition-all duration-300",
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
