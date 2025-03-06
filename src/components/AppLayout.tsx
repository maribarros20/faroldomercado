
import React from "react";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
