
import React from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
  expanded: boolean;
}

const NavItem = ({ to, icon, text, active, expanded }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100"
      } ${expanded ? "justify-start" : "justify-center"}`}
    >
      <span className={expanded ? "mr-3" : ""}>{icon}</span>
      {expanded && <span className="font-medium">{text}</span>}
    </Link>
  );
};

export default NavItem;
