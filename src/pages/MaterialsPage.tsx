
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileIcon, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FilePieChart,
  Calendar,
  Clock,
  BookOpen,
  Hash,
  FilePresentation,
  FileBarChart2,
  Book
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaterialsService, { Material, MaterialCategory } from "@/services/MaterialsService";
import { useQuery } from "@tanstack/react-query";

const MaterialsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => MaterialsService.getMaterialCategories(),
  });

  // Fetch materials
  const { data: materials = [], isLoading: isMaterialsLoading } = useQuery({
    queryKey: ['materials', selectedCategory],
    queryFn: async () => {
      try {
        // Get session for user activity logging
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

        // Log activity
        await supabase.from("user_activities").insert({
          user_id: userId,
          activity_type: "view_materials",
          metadata: { page: "materials", category: selectedCategory }
        } as any);

        // Fetch materials
        let materialsData: Material[];
        
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

  // Once we have categories, materials will start loading
  useEffect(() => {
    if (!isMaterialsLoading) {
      setIsLoading(false);
    }
  }, [isMaterialsLoading]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getMaterialIcon = (material: Material) => {
    // First check format_id if available
    if (material.format_id) {
      const formatName = material.format_name?.toLowerCase() || '';
      
      if (formatName.includes('ebook')) return <Book className="h-6 w-6 text-purple-500" />;
      if (formatName.includes('apresentação')) return <FilePresentation className="h-6 w-6 text-blue-500" />;
      if (formatName.includes('relatório')) return <FileBarChart2 className="h-6 w-6 text-orange-500" />;
      if (formatName.includes('planilha')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      if (formatName.includes('mapa')) return <FilePieChart className="h-6 w-6 text-pink-500" />;
    }
    
    // Fallback to type
    switch (material.type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "excel":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case "ebook":
        return <Book className="h-6 w-6 text-purple-500" />;
      case "presentation":
      case "apresentação":
        return <FilePresentation className="h-6 w-6 text-blue-500" />;
      case "relatório":
      case "report":
        return <FileBarChart2 className="h-6 w-6 text-orange-500" />;
      case "book":
        return <BookOpen className="h-6 w-6 text-indigo-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleDownload = async (material: Material) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Acesso não autorizado",
          description: "Você precisa estar logado para baixar materiais.",
          variant: "destructive"
        });
        return;
      }

      // Increment download count
      await MaterialsService.incrementDownloads(material.id);

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: sessionData.session.user.id,
        activity_type: "download_material",
        content_id: material.id,
        metadata: { material_id: material.id, title: material.title }
      } as any);

      // Get download URL
      const { url, filename } = await MaterialsService.downloadMaterial(material.id);
      
      if (!url) {
        toast({
          title: "Erro ao baixar material",
          description: "O arquivo não está disponível para download.",
          variant: "destructive"
        });
        return;
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado",
        description: "O download do material foi iniciado.",
      });
    } catch (error) {
      console.error("Error downloading material:", error);
      toast({
        title: "Erro ao baixar material",
        description: "Ocorreu um erro ao tentar baixar o material.",
        variant: "destructive"
      });
    }
  };

  // Prepare categories array with "All" option at the beginning
  const categoryOptions = [
    { id: "all", name: "Todos" },
    ...categories
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Materiais</h1>
      
      <Tabs 
        defaultValue={selectedCategory} 
        onValueChange={handleCategoryChange}
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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Carregando materiais...</p>
              </div>
            ) : materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <Card key={material.id} className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          {getMaterialIcon(material)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{material.title}</CardTitle>
                          <CardDescription className="text-xs flex items-center">
                            <span className="capitalize">{material.type}</span>
                            {material.navigation_id && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {material.navigation_name}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                        {material.description || "Nenhuma descrição disponível."}
                      </p>
                      
                      {material.themes && material.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 mb-3">
                          {material.themes.map(theme => (
                            <Badge key={theme.id} variant="outline" className="text-xs">
                              <Hash size={10} className="mr-1" /> {theme.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="mr-3">
                          {formatDate(material.date_added)}
                        </span>
                        <Download className="h-3 w-3 mr-1" />
                        <span>{material.downloads || 0} downloads</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="mr-2 h-4 w-4" /> 
                        Baixar Material
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">Nenhum material encontrado</h3>
                <p className="text-gray-500 mt-2">
                  Não há materiais disponíveis nesta categoria no momento.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MaterialsPage;
