
import React from "react";
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  UserCog
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

const QuickActions = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const tabs = [
    { 
      title: "Configurações", 
      icon: Settings,
      onClick: () => navigate("/profile/settings")
    },
    { 
      title: "Administração", 
      icon: ShieldAlert,
      onClick: () => navigate("/admin")
    },
    {
      title: "Perfil",
      icon: UserCog,
      onClick: () => navigate("/profile")
    },
    { 
      title: unreadCount > 0 ? `Notificações (${unreadCount > 9 ? '9+' : unreadCount})` : "Notificações", 
      icon: Bell,
      onClick: () => navigate("/notifications")
    }
  ];

  return (
    <div className="relative">
      <ExpandableTabs 
        tabs={tabs} 
        className="border-none shadow-none bg-transparent" 
        activeColor="text-primary" 
      />
    </div>
  );
};

export default QuickActions;
