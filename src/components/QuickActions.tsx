
import React from "react";
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  UserCog,
  ArrowLeft
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";
import { useUserProfile } from "@/hooks/use-user-profile";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import { Button } from "@/components/ui/button";

// Define the tab type explicitly with onClick as optional
interface TabItem {
  title: string;
  icon: React.ElementType;
  to?: string;
  onClick?: () => void;
}

const QuickActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { userRole } = useUserProfile();
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  // Check if user is admin
  const isAdmin = userRole === 'admin';
  
  // Create tabs configuration based on user role
  const getTabs = (): TabItem[] => {
    const baseTabs: TabItem[] = [
      {
        title: "Configurações",
        icon: Settings,
        to: "/profile-settings"
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
          setShowNotifications(true);
        }
      }
    );
    
    return baseTabs;
  };

  // Check if we need to show the back button
  // We show it if we're not on the dashboard page and the URL is one of the quick action destinations
  const showBackButton = () => {
    const quickActionPaths = ['/profile-settings', '/admin', '/profile'];
    return location.pathname !== '/dashboard' && quickActionPaths.includes(location.pathname);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back in history
  };

  return (
    <div className="relative z-20">
      {showBackButton() && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute -left-12 top-0" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      )}
      
      <Popover open={showNotifications} onOpenChange={setShowNotifications}>
        <PopoverTrigger asChild>
          <div className="inline-block">
            <ExpandableTabs 
              tabs={getTabs()}
              activeColor="text-primary"
              className="border-gray-200 dark:border-gray-700"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <NotificationPopover onClose={() => setShowNotifications(false)} />
        </PopoverContent>
      </Popover>
      
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
