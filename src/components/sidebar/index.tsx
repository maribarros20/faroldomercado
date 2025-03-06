
import React from "react";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarMainMenu } from "./SidebarMainMenu";
import { SidebarFooterMenu } from "./SidebarFooterMenu";
import { UserProvider } from "./SidebarUserContext";

const Sidebar = () => {
  return (
    <UserProvider>
      <SidebarContainer>
        <SidebarHeader />
        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="px-3 py-2">
              <SidebarMainMenu />
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooterMenu />
      </SidebarContainer>
    </UserProvider>
  );
};

export default Sidebar;
