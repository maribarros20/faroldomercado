
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { UserCircle, Settings, LogOut } from "lucide-react";
import { useUser } from "./SidebarUserContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export const SidebarFooterMenu: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useUser();

  // Footer menu items (profile and settings)
  const footerMenuItems = [
    {
      title: "Meu Perfil",
      icon: <UserCircle className="h-5 w-5" />,
      href: "/profile",
    },
    {
      title: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      href: "/profile-settings",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarFooter className="border-t border-border p-4 flex flex-col gap-2">
      {footerMenuItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <Link to={item.href}>
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        </Button>
      ))}
      <ThemeToggle />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>Sair</span>
      </Button>
      <SidebarTrigger />
    </SidebarFooter>
  );
};
