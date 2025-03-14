
import React from "react";
import { useGreeting } from "@/hooks/use-greeting";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const DashboardHeader = () => {
  const { userName } = useUserPlan();
  const { greeting } = useGreeting(userName);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show back button if we're not on the dashboard
  const showBackButton = location.pathname !== "/dashboard";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-3xl font-bold">Radar</h1>
      </div>
      <div className="flex items-center gap-3">
        {greeting && <span className="text-sm text-muted-foreground">{greeting}</span>}
        {/* QuickActions is handled in the main layout */}
      </div>
    </div>
  );
};

export default DashboardHeader;
