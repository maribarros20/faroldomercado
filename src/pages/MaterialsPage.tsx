
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MaterialsService from "@/services/MaterialsService";
import MaterialsFilter from "@/components/materials/MaterialsFilter";
import MaterialsList from "@/components/materials/MaterialsList";
import { Material } from "@/services/materials/types";

const MaterialsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentStatus, setCurrentStatus] = useState("all");

  // Fetch all the necessary data
  const { data: materials = [], isLoading: isMaterialsLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => MaterialsService.getMaterials()
  });

  const { data: formats = [] } = useQuery({
    queryKey: ['materialFormats'],
    queryFn: () => MaterialsService.getMaterialFormats()
  });

  const { data: navigations = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations()
  });

  // Filter materials based on search query and current filters
  const filteredMaterials = React.useMemo(() => {
    return materials.filter((material: Material) => {
      const matchesSearch = searchQuery === "" || 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (currentFilter === "categories") {
        matchesFilter = material.category !== null;
      } else if (currentFilter === "knowledge") {
        matchesFilter = material.navigation_id !== null;
      } else if (currentFilter === "types") {
        matchesFilter = material.format_id !== null;
      }

      let matchesStatus = true;
      if (currentStatus === "favorites") {
        matchesStatus = material.is_liked_by_user;
      }
      // Note: In progress and completed status would need additional backend support

      return matchesSearch && matchesFilter && matchesStatus;
    });
  }, [materials, searchQuery, currentFilter, currentStatus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
  };

  const handleMaterialLikeToggle = async (materialId: string) => {
    await MaterialsService.likeMaterial(materialId);
    // Refetch materials to update the UI
    // This could be optimized with react-query's setQueryData
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Materiais</h1>
          <p className="text-gray-500">Aprenda com conteúdos exclusivos</p>
        </div>

        <MaterialsFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onStatusChange={handleStatusChange}
          currentFilter={currentFilter}
          currentStatus={currentStatus}
        />

        <MaterialsList
          materials={filteredMaterials}
          isLoading={isMaterialsLoading}
          formats={formats}
          navigations={navigations}
          onMaterialLikeToggle={handleMaterialLikeToggle}
        />
      </div>
    </div>
  );
};

export default MaterialsPage;
