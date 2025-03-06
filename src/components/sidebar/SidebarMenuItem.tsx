
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem as MenuItem } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

type SidebarMenuItemProps = {
  title: string;
  icon: React.ReactElement;
  href: string;
};

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ 
  title, 
  icon, 
  href 
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <MenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
      >
        <Link to={href}>
          {icon}
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </MenuItem>
  );
};
