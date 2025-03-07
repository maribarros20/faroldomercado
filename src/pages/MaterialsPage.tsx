
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaterialsService from "@/services/MaterialsService";
import CategoryTabs from "@/components/materials/CategoryTabs";
import MaterialsList from "@/components/materials/MaterialsList";

const MaterialsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => MaterialsService.getMaterialCategories(),
  });

  // Fetch formats
  const { data: formats = [] } = useQuery({
    queryKey: ['materialFormats'],
    queryFn: () => MaterialsService.getMaterialFormats(),
  });

  // Fetch navigations
  const { data: navigations = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
  });

  // Fetch materials based on selected category
  const { data: materials = [], isLoading: isMaterialsLoading } = useQuery({
    queryKey: ['materials', selectedCategory],
    queryFn: async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (!userId) {
          toast({
            title: "Acesso não autorizado",
            description: "Você precisa estar logado para acessar os materiais.",
            variant: "destructive"
          });
          return [];
        }

        await supabase.from("user_activities").insert({
          user_id: userId,
          activity_type: "view_materials",
          metadata: { page: "materials", category: selectedCategory }
        } as any);

        let materialsData;
        
        if (selectedCategory === "all") {
          materialsData = await MaterialsService.getMaterials();
        } else {
          materialsData = await MaterialsService.getMaterialsByCategory(selectedCategory);
        }

        return materialsData;
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais. Tente novamente mais tarde.",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!categories.length
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Materiais</h1>
      
      <CategoryTabs 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      >
        <MaterialsList 
          materials={materials} 
          isLoading={isMaterialsLoading}
          formats={formats}
          navigations={navigations}
        />
      </CategoryTabs>
    </div>
  );
};

export default MaterialsPage;
