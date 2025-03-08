
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGreeting } from "@/hooks/use-greeting";
import { useUserProfile } from "@/hooks/use-user-profile";
import QuickActions from "./QuickActions";
import UserProfileHeader from "./UserProfileHeader";
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { greeting } = useGreeting(null);
  const { userRole, avatarUrl, userName } = useUserProfile();

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
          <main className="flex-1 flex flex-col max-w-full w-full overflow-x-hidden transition-all duration-300 ml-20 md:ml-20 lg:ml-20 pb-24 min-h-screen">
            <div className="flex justify-between items-center p-4 border-b h-16 py-[41px] bg-white">
              {/* Left side of header can be empty or have a title/breadcrumb */}
              <div></div>
              {/* Right side of header with user profile and quick actions */}
              <div className="flex items-center space-x-4">
                <UserProfileHeader 
                  userName={userName} 
                  userRole={userRole} 
                  avatarUrl={avatarUrl} 
                />
                <QuickActions />
              </div>
            </div>
            <div className="px-4 flex-1 pb-32 w-full">
              {children}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
