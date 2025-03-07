
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGreeting } from "@/hooks/use-greeting";
import QuickActions from "./QuickActions";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { greeting } = useGreeting(null);

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
        <div className="flex flex-1 w-full">
          <Sidebar />
          <main className="flex-1 flex flex-col max-w-full overflow-x-hidden">
            <div className="flex justify-end p-4">
              <QuickActions />
            </div>
            <div className="px-4 pb-4 flex-1">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
