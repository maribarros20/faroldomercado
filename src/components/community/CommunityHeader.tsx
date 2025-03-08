
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CommunityHeaderProps {
  onCreatePost: () => void;
  isDisabled: boolean;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({ 
  onCreatePost, 
  isDisabled 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Comunidade</h1>
      <Button 
        onClick={onCreatePost}
        disabled={isDisabled}
      >
        <Plus className="mr-2 h-4 w-4" />
        Criar Postagem
      </Button>
    </div>
  );
};

export default CommunityHeader;
