
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
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { greeting } = useGreeting(null);

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
          <main className="flex-1 flex flex-col max-w-full overflow-x-hidden ml-20 md:ml-20 lg:ml-20">
            <div className="flex justify-end p-4">
              <QuickActions />
            </div>
            <div className="px-4 pb-4 flex-1">
              {children}
            </div>
          </main>
        </div>
        <Footer className="ml-20 md:ml-20 lg:ml-20" />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
