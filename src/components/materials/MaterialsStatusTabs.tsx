
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Clock, CheckCircle, LayoutGrid } from "lucide-react";

interface MaterialsStatusTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  children: React.ReactNode;
}

const MaterialsStatusTabs: React.FC<MaterialsStatusTabsProps> = ({
  activeStatus,
  onStatusChange,
  children
}) => {
  return (
    <Tabs defaultValue={activeStatus} onValueChange={onStatusChange} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="all" className="flex items-center gap-1">
          <LayoutGrid className="w-4 h-4" />
          <span>Todos</span>
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>Favoritos</span>
        </TabsTrigger>
        <TabsTrigger value="in-progress" className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Em Progresso</span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          <span>Concluídos</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeStatus} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default MaterialsStatusTabs;
