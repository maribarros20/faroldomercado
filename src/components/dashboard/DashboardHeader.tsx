
import React from "react";
import { useGreeting } from "@/hooks/use-greeting";
import { useUserPlan } from "@/contexts/UserPlanContext";

const DashboardHeader = () => {
  const { userName } = useUserPlan();
  const { greeting } = useGreeting(userName);

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Painel do Mercado</h1>
      <div className="flex items-center gap-3">
        {greeting && (
          <span className="text-sm text-muted-foreground">
            {greeting}
          </span>
        )}
        {/* QuickActions is handled in the main layout */}
      </div>
    </div>
  );
};

export default DashboardHeader;
