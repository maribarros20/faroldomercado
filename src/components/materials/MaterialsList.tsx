
import React from "react";
import { FileText, BookOpen } from "lucide-react";
import MaterialCard from "./MaterialCard";
import { Material, MaterialFormat, KnowledgeNavigation } from "@/services/materials/types";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface MaterialsListProps {
  materials: Material[];
  isLoading: boolean;
  formats: MaterialFormat[];
  navigations: KnowledgeNavigation[];
  onMaterialLikeToggle?: (materialId: string) => void;
  viewType?: "grid" | "progress";
}

const MaterialsList: React.FC<MaterialsListProps> = ({ 
  materials, 
  isLoading,
  formats,
  navigations,
  onMaterialLikeToggle,
  viewType = "grid"
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
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">Nenhum material encontrado</h3>
        <p className="text-gray-500 mt-2">
          Não há materiais disponíveis com os filtros atuais.
        </p>
      </div>
    );
  }

  if (viewType === "progress") {
    return (
      <div className="space-y-6">
        {materials.map((material, index) => (
          <motion.div 
            key={material.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-4 mb-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{material.title}</h3>
                <p className="text-sm text-gray-500">
                  {navigations.find(n => n.id === material.navigation_id)?.name || 'Rota não definida'}
                </p>
              </div>
              <span className="text-sm font-medium text-blue-600">42% concluído</span>
            </div>
            <Progress value={42} className="h-2" />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">2 de 5 materiais concluídos</span>
              <button className="text-sm text-blue-600 font-medium">Continuar</button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material, index) => (
        <motion.div
          key={material.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <MaterialCard 
            material={material} 
            formats={formats}
            navigations={navigations}
            onLikeToggle={onMaterialLikeToggle}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default MaterialsList;
