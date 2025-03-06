
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5 mr-2" />
          <span>Modo Escuro</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5 mr-2" />
          <span>Modo Claro</span>
        </>
      )}
    </Button>
  );
};
