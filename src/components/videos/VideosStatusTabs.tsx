
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Tv, Check, LayoutGrid } from "lucide-react";

interface VideosStatusTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  children: React.ReactNode;
}

const VideosStatusTabs: React.FC<VideosStatusTabsProps> = ({
  activeStatus,
  onStatusChange,
  children
}) => {
  return (
    <Tabs defaultValue={activeStatus} onValueChange={onStatusChange} className="w-full max-w-7xl mx-auto">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="all" className="flex items-center gap-1">
          <LayoutGrid className="w-4 h-4" />
          <span>Todos</span>
        </TabsTrigger>
        <TabsTrigger value="liked" className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>Curtidos</span>
        </TabsTrigger>
        <TabsTrigger value="unwatched" className="flex items-center gap-1">
          <Tv className="w-4 h-4" />
          <span>Não assistidos</span>
        </TabsTrigger>
        <TabsTrigger value="watched" className="flex items-center gap-1">
          <Check className="w-4 h-4" />
          <span>Assistidos</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeStatus} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default VideosStatusTabs;
