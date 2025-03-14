
import React from "react";
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  UserCog,
  BellRing,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";
import { useUserProfile } from "@/hooks/use-user-profile";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import { cn } from "@/lib/utils";

// Define the tab type explicitly with onClick as optional
interface TabItem {
  title: string;
  icon: React.ElementType;
  to?: string;
  onClick?: () => void;
}

const QuickActions = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { userRole } = useUserProfile();
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  // Check if user is admin
  const isAdmin = userRole === 'admin';
  
  // Create tabs configuration based on user role
  const getTabs = (): TabItem[] => {
    const baseTabs: TabItem[] = [];
    
    // Only show admin tab if user is admin
    if (isAdmin) {
      baseTabs.push({
        title: "Administração",
        icon: ShieldAlert,
        to: "/admin"
      });
    }
    
    // Add notification tab
    baseTabs.push({
      title: "Notificações",
      icon: Bell,
      onClick: () => {
        setShowNotifications(true);
      }
    });
    
    return baseTabs;
  };

  const handleTabClick = (tab: TabItem) => {
    if (tab.onClick) {
      tab.onClick();
    } else if (tab.to) {
      navigate(tab.to);
    }
  };

  return (
    <div className="relative z-20">
      <div className="flex items-center gap-3">
        {getTabs().map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "transition-all duration-200 ease-in-out",
              "hover:bg-[#e6f0ff] text-gray-600 hover:text-[#0066FF]",
              "border border-transparent hover:border-gray-100",
              "shadow-sm"
            )}
            title={tab.title}
          >
            <tab.icon className="h-5 w-5" />
          </button>
        ))}
        
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverContent className="w-80 p-0">
            <NotificationPopover onClose={() => setShowNotifications(false)} />
          </PopoverContent>
        </Popover>
        
        {/* Notification indicator badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 left-[calc(100%-18px)] bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
