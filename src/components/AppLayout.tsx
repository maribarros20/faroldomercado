
import React from "react";
import Sidebar from "@/components/sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
