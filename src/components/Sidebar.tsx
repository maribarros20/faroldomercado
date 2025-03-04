
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  BookOpen, 
  Film, 
  Users, 
  TrendingUp, 
  LogOut, 
  User, 
  Star,
  Menu,
  X
} from 'lucide-react';
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  to: string;
  isExpanded: boolean;
  isActive: boolean;
  hasSubItems?: boolean;
};

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  to, 
  isExpanded, 
  isActive,
  hasSubItems 
}: SidebarItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "sidebar-item group relative",
        isActive && "active"
      )}
    >
      <Icon size={20} className="flex-shrink-0" />
      <span className={cn(
        "transition-all duration-300 whitespace-nowrap",
        isExpanded ? "opacity-100" : "opacity-0 absolute left-10"
      )}>
        {label}
      </span>
      {hasSubItems && isExpanded && (
        <span className="ml-auto text-xs bg-trade-light-blue text-trade-blue px-2 py-0.5 rounded-full">
          3
        </span>
      )}
    </Link>
  );
};

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r border-gray-100 transition-all duration-300 flex flex-col z-10",
        isExpanded ? "w-64" : "w-[70px]"
      )}
    >
      <div className="p-4 flex items-center border-b border-gray-100">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isExpanded ? "" : "justify-center w-full"
        )}>
          <div className="w-8 h-8 rounded-md bg-trade-blue flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className={cn(
            "text-gray-800 font-medium text-lg transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 absolute"
          )}>
            TradeKnowledge
          </span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isExpanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      
      <div className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto">
        <SidebarItem 
          icon={BarChart2} 
          label="Painel" 
          to="/dashboard" 
          isExpanded={isExpanded} 
          isActive={isActive('/dashboard')} 
        />
        <SidebarItem 
          icon={BookOpen} 
          label="Materiais" 
          to="/materials" 
          isExpanded={isExpanded}
          isActive={isActive('/materials')}
          hasSubItems
        />
        <SidebarItem 
          icon={Film} 
          label="Vídeos" 
          to="/videos" 
          isExpanded={isExpanded} 
          isActive={isActive('/videos')}
          hasSubItems
        />
        <SidebarItem 
          icon={TrendingUp} 
          label="Meu Progresso" 
          to="/progress" 
          isExpanded={isExpanded} 
          isActive={isActive('/progress')} 
        />
        <SidebarItem 
          icon={Users} 
          label="Comunidade" 
          to="/community" 
          isExpanded={isExpanded} 
          isActive={isActive('/community')} 
        />
        <SidebarItem 
          icon={Star} 
          label="Favoritos" 
          to="/favorites" 
          isExpanded={isExpanded} 
          isActive={isActive('/favorites')} 
        />
      </div>
      
      <div className="mt-auto border-t border-gray-100 p-3">
        <div className={cn(
          "flex items-center p-3 rounded-lg mb-2 cursor-pointer",
          isExpanded ? "justify-between" : "justify-center"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src="https://avatars.githubusercontent.com/u/124599?v=4" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            {isExpanded && (
              <div>
                <div className="text-sm font-medium text-gray-800">João Ninguém</div>
                <div className="text-xs text-gray-500 truncate">john@example.com</div>
              </div>
            )}
          </div>
        </div>
        <Link to="/profile" className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200",
          isActive('/profile') && "bg-gray-100"
        )}>
          <User size={20} />
          <span className={cn(
            "transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 absolute"
          )}>
            Perfil
          </span>
        </Link>
        <Link to="/logout" className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 mt-1",
        )}>
          <LogOut size={20} />
          <span className={cn(
            "transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 absolute"
          )}>
            Sair
          </span>
        </Link>
      </div>
    </div>
  );
}
