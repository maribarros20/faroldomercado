
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Sidebar as UISidebar, 
  useSidebar, 
  Header, 
  Section, 
  Content, 
  Footer, 
  Trigger 
} from "@/components/ui/sidebar";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfile } from "@/hooks/use-user-profile";
import Navigation from "./sidebar/Navigation";
import UsefulLinks from "./sidebar/UsefulLinks";
import UserProfile from "./sidebar/UserProfile";

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { expanded, setExpanded } = useSidebar();
  const { userRole, avatarUrl, userName } = useUserProfile();

  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [location.pathname, isMobile, setExpanded]);

  return (
    <UISidebar className={`border-r min-h-screen transition-all duration-300 bg-background ${
      expanded ? "w-64" : "w-20"
    } flex flex-col fixed z-10 h-screen overflow-hidden`}>
      <Header className="flex items-center justify-between p-4 border-b h-16">
        <div className="flex items-center">
          {expanded && <Logo />}
        </div>
        <Trigger
          className="p-2 rounded-full hover:bg-gray-100"
          icon={expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        />
      </Header>
      
      <Content className="flex-1 py-4 overflow-y-auto flex flex-col justify-between">
        <Section className="space-y-1">
          <Navigation expanded={expanded} userRole={userRole} />
        </Section>

        <div className="mt-auto">
          <Section className="px-3 space-y-1 mb-4">
            <UsefulLinks expanded={expanded} />
          </Section>
        </div>
      </Content>
      
      <Footer className="border-t p-4">
        <UserProfile 
          expanded={expanded} 
          userName={userName} 
          userRole={userRole} 
          avatarUrl={avatarUrl} 
        />
      </Footer>
    </UISidebar>
  );
};

export default Sidebar;
