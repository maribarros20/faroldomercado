
import React from "react";
import { SidebarHeader as Header } from "@/components/ui/sidebar";
import Logo from "../Logo";

export const SidebarHeader: React.FC = () => {
  return (
    <Header className="border-b border-border p-4">
      <div className="flex items-center">
        <Logo />
      </div>
    </Header>
  );
};
