
import React, { useState } from "react";
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  ChevronDown, 
  ChevronUp,
  UserCog
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen}
        className="bg-white shadow-sm rounded-md"
      >
        <CollapsibleTrigger asChild>
          <button 
            className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Ações rápidas"
          >
            <span className="text-gray-500">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
            <span className="sr-only">Ações rápidas</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="absolute right-0 top-full mt-1 bg-white shadow-md rounded-md p-1 z-50 min-w-48">
          <div className="flex flex-col gap-1 w-full">
            <Link 
              to="/profile/settings" 
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} className="text-gray-500" />
              <span>Configurações</span>
            </Link>
            <Link 
              to="/admin" 
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              <ShieldAlert size={16} className="text-gray-500" />
              <span>Administração</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              <UserCog size={16} className="text-gray-500" />
              <span>Perfil</span>
            </Link>
            <Link 
              to="#" 
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors relative"
            >
              <Bell size={16} className="text-gray-500" />
              <span>Notificações</span>
              {unreadCount > 0 && (
                <span className="absolute right-2 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default QuickActions;
