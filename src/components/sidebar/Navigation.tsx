
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ActivitySquare, 
  BookOpen, 
  Video, 
  Users, 
  CreditCard, 
  BarChart3
} from "lucide-react";
import NavItem from "./NavItem";

interface NavigationProps {
  expanded: boolean;
  userRole: string | null;
}

const Navigation = ({ expanded, userRole }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-1 px-3">
      <NavItem
        to="/dashboard"
        icon={<BarChart3 size={20} />}
        text="Radar"
        active={isActive("/dashboard")}
        expanded={expanded}
      />
      
      <NavItem
        to="/materials"
        icon={<BookOpen size={20} />}
        text="Documentos"
        active={isActive("/materials")}
        expanded={expanded}
      />
      
      <NavItem
        to="/videos"
        icon={<Video size={20} />}
        text="Vídeos"
        active={isActive("/videos")}
        expanded={expanded}
      />
      
      <NavItem
        to="/progress"
        icon={<ActivitySquare size={20} />}
        text="Desempenho"
        active={isActive("/progress")}
        expanded={expanded}
      />
      
      <NavItem
        to="/community"
        icon={<Users size={20} />}
        text="Farolverso"
        active={isActive("/community")}
        expanded={expanded}
      />
      
      <NavItem
        to="/plans"
        icon={<CreditCard size={20} />}
        text="Planos"
        active={isActive("/plans")}
        expanded={expanded}
      />
    </div>
  );
};

export default Navigation;
