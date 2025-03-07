
import React from "react";
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  UserCog
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";
import { useUserProfile } from "@/hooks/use-user-profile";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

const QuickActions = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { userRole } = useUserProfile();
  
  // Check if user is admin
  const isAdmin = userRole === 'admin';
  
  // Create tabs configuration based on user role
  const getTabs = () => {
    const baseTabs = [
      {
        title: "Configurações",
        icon: Settings,
        to: "/profile/settings"
      }
    ];
    
    // Only show admin tab if user is admin
    if (isAdmin) {
      baseTabs.push({
        title: "Administração",
        icon: ShieldAlert,
        to: "/admin"
      });
    }
    
    // Add remaining tabs
    baseTabs.push(
      {
        title: "Perfil",
        icon: UserCog,
        to: "/profile"
      },
      {
        title: "Notificações",
        icon: Bell,
        onClick: () => {
          console.log("Open notifications");
          // Here we could implement a notification popover
        }
      }
    );
    
    return baseTabs;
  };

  return (
    <div className="relative z-20">
      <ExpandableTabs 
        tabs={getTabs()}
        activeColor="text-primary"
        className="border-gray-200 dark:border-gray-700"
      />
      
      {/* Notification indicator badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default QuickActions;
