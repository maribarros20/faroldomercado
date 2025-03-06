
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
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaterialsService, { Material } from "@/services/MaterialsService";

const CATEGORIES = [
  { id: "all", name: "Todos" },
  { id: "articles", name: "Artigos" },
  { id: "presentations", name: "Apresentações" },
  { id: "spreadsheets", name: "Planilhas" },
  { id: "reports", name: "Relatórios" },
];

const MaterialsPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
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
          setIsLoading(false);
          return;
        }

        // Log activity
        await supabase.from("user_activities").insert({
          user_id: userId,
          activity_type: "view_materials",
          metadata: { page: "materials" }
        } as any);

        // Fetch materials
        let materialsData: Material[];
        
        if (selectedCategory === "all") {
          materialsData = await MaterialsService.getMaterials();
        } else {
          materialsData = await MaterialsService.getMaterialsByCategory(selectedCategory);
        }

        setMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedCategory, toast]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getMaterialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "article":
      case "pdf":
        return <FileText className="h-6 w-6" />;
      case "presentation":
      case "slide":
        return <FilePieChart className="h-6 w-6" />;
      case "spreadsheet":
      case "excel":
        return <FileSpreadsheet className="h-6 w-6" />;
      case "book":
        return <BookOpen className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
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

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Materiais</h1>
      
      <Tabs 
        defaultValue={selectedCategory} 
        onValueChange={handleCategoryChange}
        className="space-y-4"
      >
        <TabsList className="flex overflow-x-auto pb-1">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {CATEGORIES.map((category) => (
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
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          {getMaterialIcon(material.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{material.title}</CardTitle>
                          <CardDescription className="text-xs">
                            Tipo: {material.type}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                        {material.description || "Nenhuma descrição disponível."}
                      </p>
                      
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
