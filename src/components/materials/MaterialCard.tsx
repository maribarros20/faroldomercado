
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileIcon, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FilePieChart,
  Calendar,
  Hash,
  Presentation,
  FileBarChart2,
  Book,
  Heart
} from "lucide-react";
import { Material, MaterialFormat, MaterialTheme, KnowledgeNavigation } from "@/services/materials/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaterialsService from "@/services/MaterialsService";
import { motion } from "framer-motion";

interface MaterialCardProps {
  material: Material;
  formats: MaterialFormat[];
  navigations: KnowledgeNavigation[];
  onLikeToggle?: (materialId: string) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ 
  material, 
  formats, 
  navigations,
  onLikeToggle 
}) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(material.is_liked_by_user);
  const [likesCount, setLikesCount] = useState(material.likes_count || 0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const getMaterialIcon = (material: Material) => {
    if (material.format_id) {
      const format = formats.find(f => f.id === material.format_id);
      const formatName = format ? format.name.toLowerCase() : '';
      
      if (formatName.includes('ebook')) return <Book className="h-6 w-6 text-purple-500" />;
      if (formatName.includes('apresentação')) return <Presentation className="h-6 w-6 text-blue-500" />;
      if (formatName.includes('relatório')) return <FileBarChart2 className="h-6 w-6 text-orange-500" />;
      if (formatName.includes('planilha')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      if (formatName.includes('mapa')) return <FilePieChart className="h-6 w-6 text-pink-500" />;
    }
    
    switch (material.type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "excel":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case "ebook":
        return <Book className="h-6 w-6 text-purple-500" />;
      case "presentation":
      case "apresentação":
        return <Presentation className="h-6 w-6 text-blue-500" />;
      case "relatório":
      case "report":
        return <FileBarChart2 className="h-6 w-6 text-orange-500" />;
      case "book":
        return <Book className="h-6 w-6 text-indigo-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleDownload = async () => {
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

      await MaterialsService.incrementDownloads(material.id);

      await supabase.from("user_activities").insert({
        user_id: sessionData.session.user.id,
        activity_type: "download_material",
        content_id: material.id,
        metadata: { material_id: material.id, title: material.title }
      } as any);

      const { url, filename } = await MaterialsService.downloadMaterial(material.id);
      
      if (!url) {
        toast({
          title: "Erro ao baixar material",
          description: "O arquivo não está disponível para download.",
          variant: "destructive"
        });
        return;
      }

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

  const handleLikeToggle = async () => {
    try {
      setIsLikeProcessing(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Acesso não autorizado",
          description: "Você precisa estar logado para curtir materiais.",
          variant: "destructive"
        });
        setIsLikeProcessing(false);
        return;
      }

      // Toggle like in the backend
      await MaterialsService.likeMaterial(material.id);
      
      // Update local state
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? Math.max(prev - 1, 0) : prev + 1);
      
      // Notify parent component if callback provided
      if (onLikeToggle) {
        onLikeToggle(material.id);
      }
      
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Erro ao curtir material",
        description: "Ocorreu um erro ao tentar curtir este material.",
        variant: "destructive"
      });
    } finally {
      setIsLikeProcessing(false);
    }
  };

  return (
    <Card key={material.id} className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            {getMaterialIcon(material)}
          </div>
          <div className="flex-grow">
            <CardTitle className="text-lg">{material.title}</CardTitle>
            <CardDescription className="text-xs flex items-center">
              <span className="capitalize">{material.type}</span>
              {material.navigation_id && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {navigations.find(n => n.id === material.navigation_id)?.name || 'Unknown'}
                </Badge>
              )}
            </CardDescription>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center ${isLikeProcessing ? 'opacity-50' : ''}`}
            onClick={handleLikeToggle}
            disabled={isLikeProcessing}
          >
            <Heart 
              className={`h-5 w-5 cursor-pointer transition-colors ${isLiked ? 'fill-[#0066FF] text-[#0066FF]' : 'text-gray-400'}`} 
            />
            <span className="ml-1 text-xs">{likesCount > 0 ? likesCount : ''}</span>
          </motion.button>
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
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" /> 
          Baixar Material
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MaterialCard;
