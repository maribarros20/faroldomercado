
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { UserPlanProvider } from "@/contexts/UserPlanContext";

const DashboardPage = () => {
  return (
    <UserPlanProvider>
      <div className="animate-fade-in container mx-auto px-4 py-6">
        <DashboardHeader />
        <DashboardTabs />
      </div>
    </UserPlanProvider>
  );
};

export default DashboardPage;
