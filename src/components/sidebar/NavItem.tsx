
import React from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
  expanded: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, text, active, expanded, onClick }: NavItemProps) => {
  const content = (
    <>
      <span className={`${expanded ? "mr-3" : ""} flex items-center justify-center w-5 h-5`}>{icon}</span>
      {expanded && <span className="font-medium">{text}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center px-3 py-3 rounded-md transition-colors ${
          active
            ? "bg-[#0066FF] text-white"
            : "text-gray-700 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        } ${expanded ? "justify-start" : "justify-center"} w-full text-left`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-3 rounded-md transition-colors ${
        active
          ? "bg-[#0066FF] text-white"
          : "text-gray-700 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
      } ${expanded ? "justify-start" : "justify-center"}`}
    >
      {content}
    </Link>
  );
};

export default NavItem;
