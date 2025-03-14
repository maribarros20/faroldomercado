
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunityPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleGoBack}
        className="rounded-full"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-3xl font-bold">Comunidade</h1>
    </div>
  );
};

export default CommunityPageHeader;
