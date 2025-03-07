
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Tab {
  title: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  to?: never;
  onClick?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef(null);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    const tab = tabs[index];
    if (tab.type !== "separator") {
      setSelected(index);
      onChange?.(index);
      
      // If the tab has an onClick handler, call it
      if ('onClick' in tab && tab.onClick) {
        tab.onClick();
      }
      
      // If it's not a link (doesn't have 'to' property), keep it selected
      if (!('to' in tab) || !tab.to) {
        return;
      }
      
      // If it's a link, we'll navigate so close the menu
      setTimeout(() => {
        setSelected(null);
        onChange?.(null);
      }, 300);
    }
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const tabItem = tab as Tab;
        const Icon = tabItem.icon;
        
        const buttonContent = (
          <>
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {tabItem.title}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        );

        // Common classNames for both button and link
        const commonClassNames = cn(
          "relative flex items-center rounded-xl py-2 text-sm font-medium transition-colors duration-300",
          selected === index
            ? cn("bg-muted", activeColor)
            : "text-muted-foreground hover:bg-primary hover:text-white"
        );

        // If tab has a link, use Link component
        if (tabItem.to) {
          return (
            <Link
              key={tabItem.title}
              to={tabItem.to}
              className={commonClassNames}
              onClick={() => handleSelect(index)}
            >
              <motion.div
                variants={buttonVariants}
                initial={false}
                animate="animate"
                custom={selected === index}
                transition={transition}
                className="flex items-center"
              >
                {buttonContent}
              </motion.div>
            </Link>
          );
        }

        // Otherwise use a button
        return (
          <motion.button
            key={tabItem.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={commonClassNames}
          >
            {buttonContent}
          </motion.button>
        );
      })}
    </div>
  );
}
