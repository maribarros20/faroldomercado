
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialCategory } from "@/services/MaterialsService";

interface CategoryTabsProps {
  categories: MaterialCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  children 
}) => {
  const categoryOptions = [
    { id: "all", name: "Todos" },
    ...categories
  ];

  return (
    <Tabs 
      defaultValue={selectedCategory} 
      onValueChange={onCategoryChange}
      className="space-y-4"
    >
      <TabsList className="flex overflow-x-auto pb-1">
        {categoryOptions.map((category) => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categoryOptions.map((category) => (
        <TabsContent key={category.id} value={category.id} className="space-y-4">
          {children}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CategoryTabs;
