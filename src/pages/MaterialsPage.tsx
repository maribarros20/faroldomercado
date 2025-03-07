
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaterialsService from "@/services/MaterialsService";
import CategoryTabs from "@/components/materials/CategoryTabs";
import MaterialsList from "@/components/materials/MaterialsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, X, Filter } from "lucide-react";
import { Material } from "@/services/materials/types";

const MaterialsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNavigation, setSelectedNavigation] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showLikedOnly, setShowLikedOnly] = useState<boolean>(false);
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

  // Fetch themes
  const { data: themes = [] } = useQuery({
    queryKey: ['materialThemes'],
    queryFn: () => MaterialsService.getMaterialThemes(),
  });

  // Fetch materials based on selected category
  const { 
    data: allMaterials = [], 
    isLoading: isMaterialsLoading,
    refetch: refetchMaterials
  } = useQuery({
    queryKey: ['materials', selectedCategory, showLikedOnly],
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
        
        if (showLikedOnly) {
          materialsData = await MaterialsService.getUserLikedMaterials();
        } else if (selectedCategory === "all") {
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

  // Filter materials based on search query and other filters
  const filteredMaterials = React.useMemo(() => {
    if (!allMaterials) return [];
    
    return allMaterials.filter((material: Material) => {
      // Filter by search query (title or description)
      const matchesSearch = searchQuery === "" || 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by navigation
      const matchesNavigation = selectedNavigation === "" || material.navigation_id === selectedNavigation;
      
      // Filter by format
      const matchesFormat = selectedFormat === "" || material.format_id === selectedFormat;
      
      // Filter by theme
      const matchesTheme = selectedTheme === "" || 
        (material.themes && material.themes.some(theme => theme.id === selectedTheme));
      
      return matchesSearch && matchesNavigation && matchesFormat && matchesTheme;
    });
  }, [allMaterials, searchQuery, selectedNavigation, selectedFormat, selectedTheme]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleMaterialLikeToggle = (materialId: string) => {
    // If viewing liked materials, we might need to refetch
    if (showLikedOnly) {
      refetchMaterials();
    }
  };

  const toggleLikedOnly = () => {
    setShowLikedOnly(!showLikedOnly);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNavigation("");
    setSelectedFormat("");
    setSelectedTheme("");
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Materiais</h1>
      
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar materiais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="mr-1 h-4 w-4" />
              Filtros
            </Button>
            
            <Button 
              variant={showLikedOnly ? "default" : "outline"} 
              size="sm" 
              onClick={toggleLikedOnly}
              className={`flex items-center ${showLikedOnly ? 'bg-[#0066FF]' : ''}`}
            >
              <Heart className={`mr-1 h-4 w-4 ${showLikedOnly ? 'fill-white' : ''}`} />
              Favoritos
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium mb-1">Navegação</label>
              <Select value={selectedNavigation} onValueChange={setSelectedNavigation}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {navigations.map(nav => (
                    <SelectItem key={nav.id} value={nav.id}>{nav.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Formato</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {formats.map(format => (
                    <SelectItem key={format.id} value={format.id}>{format.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tema</label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {themes.map(theme => (
                    <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
        
        {/* Active filter badges */}
        {(searchQuery || selectedNavigation || selectedFormat || selectedTheme) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Busca: {searchQuery}
                <X size={14} className="cursor-pointer ml-1" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            
            {selectedNavigation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Navegação: {navigations.find(n => n.id === selectedNavigation)?.name}
                <X size={14} className="cursor-pointer ml-1" onClick={() => setSelectedNavigation("")} />
              </Badge>
            )}
            
            {selectedFormat && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Formato: {formats.find(f => f.id === selectedFormat)?.name}
                <X size={14} className="cursor-pointer ml-1" onClick={() => setSelectedFormat("")} />
              </Badge>
            )}
            
            {selectedTheme && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tema: {themes.find(t => t.id === selectedTheme)?.name}
                <X size={14} className="cursor-pointer ml-1" onClick={() => setSelectedTheme("")} />
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <CategoryTabs 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      >
        <MaterialsList 
          materials={filteredMaterials} 
          isLoading={isMaterialsLoading}
          formats={formats}
          navigations={navigations}
          onMaterialLikeToggle={handleMaterialLikeToggle}
        />
      </CategoryTabs>
    </div>
  );
};

export default MaterialsPage;
