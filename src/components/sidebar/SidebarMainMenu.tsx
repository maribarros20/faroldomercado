
import React from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { 
  LayoutDashboard, 
  Book, 
  Play, 
  Users, 
  BarChart, 
  ShieldCheck
} from "lucide-react";
import { useUser } from "./SidebarUserContext";

export const SidebarMainMenu: React.FC = () => {
  const { isAdmin } = useUser();

  // Main menu items (excluding profile and settings)
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Materiais",
      icon: <Book className="h-5 w-5" />,
      href: "/materials",
    },
    {
      title: "Vídeos",
      icon: <Play className="h-5 w-5" />,
      href: "/videos",
    },
    {
      title: "Comunidade",
      icon: <Users className="h-5 w-5" />,
      href: "/community",
    },
    {
      title: "Progresso",
      icon: <BarChart className="h-5 w-5" />,
      href: "/progress",
    },
  ];

  // Add admin menu item if user is admin
  if (isAdmin) {
    menuItems.push({
      title: "Administração",
      icon: <ShieldCheck className="h-5 w-5" />,
      href: "/admin",
    });
  }

  return (
    <SidebarMenu>
      {menuItems.map((item, index) => (
        <SidebarMenuItem
          key={index}
          title={item.title}
          icon={item.icon}
          href={item.href}
        />
      ))}
    </SidebarMenu>
  );
};
