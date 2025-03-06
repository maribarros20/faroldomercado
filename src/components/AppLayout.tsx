
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false);

  // Hide sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [location.pathname, isMobile]);

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
            <div className="flex-1 px-3 md:px-6 py-4 md:py-6">
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
