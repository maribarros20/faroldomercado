
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface Tab {
  title: string;
  icon: React.ElementType;
  to?: string;
  onClick?: () => void;
}

interface ExpandableTabsProps {
  tabs: Tab[];
  activeColor?: string;
  className?: string;
}

export const ExpandableTabs: React.FC<ExpandableTabsProps> = ({
  tabs,
  activeColor = "text-primary",
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    setActiveTab(null);
  };

  const handleTabHover = (index: number) => {
    setActiveTab(index);
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    
    // If the tab has an onClick handler, call it
    const tab = tabs[index];
    if (tab.onClick) {
      tab.onClick();
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center transition-all duration-300 rounded-md border bg-background hover:bg-accent",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "flex items-center transition-all duration-300 px-2 py-1.5 space-x-2",
          isExpanded ? "min-w-[250px]" : "w-auto"
        )}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;

          const tabContent = (
            <div
              key={index}
              className={cn(
                "flex items-center rounded-md px-2 py-1 cursor-pointer transition-all hover:bg-primary/20 hover:text-primary",
                isActive && "bg-primary/20"
              )}
              onMouseEnter={() => handleTabHover(index)}
              onClick={() => handleTabClick(index)}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? activeColor : "text-muted-foreground"
                )}
              />
              {isExpanded && (
                <span
                  className={cn(
                    "ml-2 transition-opacity duration-200",
                    isActive ? activeColor : "text-muted-foreground"
                  )}
                >
                  {tab.title}
                </span>
              )}
            </div>
          );

          // If it has a 'to' property, wrap in Link, otherwise use the div directly
          return tab.to ? (
            <Link key={index} to={tab.to}>
              {tabContent}
            </Link>
          ) : (
            <div key={index}>{tabContent}</div>
          );
        })}
      </div>
      <div
        className={cn(
          "absolute right-2 transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
};
