
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaterialsService from "@/services/MaterialsService";
import MaterialsList from "@/components/materials/MaterialsList";
import MaterialsFilters from "@/components/materials/MaterialsFilters";
import MaterialsStatusTabs from "@/components/materials/MaterialsStatusTabs";
import { Material } from "@/services/materials/types";

const MaterialsPage = () => {
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedNavigation, setSelectedNavigation] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  
  // View status state
  const [activeStatus, setActiveStatus] = useState<string>("all");
  
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

  // Fetch materials based on selected category and status
  const { 
    data: allMaterials = [], 
    isLoading: isMaterialsLoading,
    refetch: refetchMaterials
  } = useQuery({
    queryKey: ['materials', activeStatus],
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
          metadata: { page: "materials", status: activeStatus }
        } as any);

        let materialsData;
        
        switch (activeStatus) {
          case "favorites":
            materialsData = await MaterialsService.getUserLikedMaterials();
            break;
          case "in-progress":
            // This would require backend support for tracking progress
            materialsData = await MaterialsService.getMaterials();
            break;
          case "completed":
            // This would require backend support for tracking completion
            materialsData = await MaterialsService.getMaterials();
            break;
          default:
            materialsData = await MaterialsService.getMaterials();
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

  // Filter materials based on search query and other filters
  const filteredMaterials = React.useMemo(() => {
    if (!allMaterials) return [];
    
    return allMaterials.filter((material: Material) => {
      // Filter by search query (title or description)
      const matchesSearch = searchQuery === "" || 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by category
      const matchesCategory = selectedCategory === "" || material.category === selectedCategory;
      
      // Filter by navigation
      const matchesNavigation = selectedNavigation === "" || material.navigation_id === selectedNavigation;
      
      // Filter by format
      const matchesFormat = selectedFormat === "" || material.format_id === selectedFormat;
      
      return matchesSearch && matchesCategory && matchesNavigation && matchesFormat;
    });
  }, [allMaterials, searchQuery, selectedCategory, selectedNavigation, selectedFormat]);

  const handleMaterialLikeToggle = (materialId: string) => {
    // If viewing favorites, we might need to refetch
    if (activeStatus === "favorites") {
      refetchMaterials();
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedNavigation("");
    setSelectedFormat("");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Materiais</h1>
        
        {/* Filters section */}
        <div className="mb-8">
          <MaterialsFilters 
            categories={categories}
            navigations={navigations}
            formats={formats}
            selectedCategory={selectedCategory}
            selectedNavigation={selectedNavigation}
            selectedFormat={selectedFormat}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategory}
            onNavigationChange={setSelectedNavigation}
            onFormatChange={setSelectedFormat}
            onSearchChange={setSearchQuery}
            onClearFilters={clearFilters}
          />
        </div>
        
        {/* Status tabs (All, Favorites, In Progress, Completed) */}
        <MaterialsStatusTabs 
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        >
          <MaterialsList 
            materials={filteredMaterials} 
            isLoading={isMaterialsLoading}
            formats={formats}
            navigations={navigations}
            onMaterialLikeToggle={handleMaterialLikeToggle}
            viewType={activeStatus === "in-progress" || activeStatus === "completed" ? "progress" : "grid"}
          />
        </MaterialsStatusTabs>
      </div>
    </div>
  );
};

export default MaterialsPage;
