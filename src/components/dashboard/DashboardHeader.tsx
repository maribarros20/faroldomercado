
import React from "react";
import { useGreeting } from "@/hooks/use-greeting";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { userName } = useUserPlan();
  const { greeting } = useGreeting(userName);
  const navigate = useNavigate();

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
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className="rounded-full shadow-sm hover:bg-[#e6f0ff] hover:text-[#0066FF] border border-transparent hover:border-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Radar</h1>
      </div>
      <div className="flex items-center">
        {greeting && <span className="text-sm text-muted-foreground">{greeting}</span>}
      </div>
    </div>
  );
};

export default DashboardHeader;
