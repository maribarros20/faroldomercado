
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import { useNotifications } from "@/hooks/use-notifications";
import { BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();
  const { toast } = useToast();

  // Create a sample notification when component mounts
  useEffect(() => {
    const createSampleNotification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.user.id,
          title: "Bem-vindo ao novo sistema de notificações",
          message: "Agora você pode receber notificações em tempo real no canto superior direito.",
          read: false
        });

      if (error) {
        console.error("Error creating notification:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a notificação de exemplo.",
          variant: "destructive",
        });
      }
    };

    createSampleNotification();
  }, [toast]);

  // Only the index page should not have the sidebar layout
  const isHomePage = location.pathname === "/";
  
  if (isHomePage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full">
        {/* Top notification bar */}
        <div className="fixed top-4 right-4 z-50">
          <NotificationPopover>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 bg-white shadow-sm relative"
              title="Notificações"
            >
              <BellRing size={20} className="text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </NotificationPopover>
        </div>

        <div className="flex flex-1 w-full">
          <Sidebar />
          <main className="flex-1 flex flex-col max-w-full overflow-x-hidden">
            <div className="flex-1 px-3 md:px-6 py-4 md:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
