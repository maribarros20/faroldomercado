
import React from "react";
import { FileText } from "lucide-react";
import MaterialCard from "./MaterialCard";
import { Material, MaterialFormat, KnowledgeNavigation } from "@/services/materials/types";

interface MaterialsListProps {
  materials: Material[];
  isLoading: boolean;
  formats: MaterialFormat[];
  navigations: KnowledgeNavigation[];
  onMaterialLikeToggle?: (materialId: string) => void;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ 
  materials, 
  isLoading,
  formats,
  navigations,
  onMaterialLikeToggle
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Carregando materiais...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">Nenhum material encontrado</h3>
        <p className="text-gray-500 mt-2">
          Não há materiais disponíveis nesta categoria no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <MaterialCard 
          key={material.id} 
          material={material} 
          formats={formats}
          navigations={navigations}
          onLikeToggle={onMaterialLikeToggle}
        />
      ))}
    </div>
  );
};

export default MaterialsList;
