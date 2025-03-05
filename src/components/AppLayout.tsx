
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useMobile();
  const [showSidebar, setShowSidebar] = useState(false);

  // Hide sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [location.pathname, isMobile]);

  // These routes should not have the sidebar layout
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/";
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 w-full">
          <Sidebar />
          <main className="flex-1 flex flex-col">
            <div className="flex-1 px-4 md:px-6 py-4 md:py-8">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
