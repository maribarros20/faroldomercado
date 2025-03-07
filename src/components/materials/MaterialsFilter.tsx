
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Star, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MaterialsFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onStatusChange: (status: string) => void;
  currentFilter: string;
  currentStatus: string;
}

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({
  onSearch,
  onFilterChange,
  onStatusChange,
  currentFilter,
  currentStatus
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Pesquisar materiais..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            Filtros
          </Button>
        </div>
      </div>

      <Tabs defaultValue={currentFilter} onValueChange={onFilterChange} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="knowledge">Rotas do Conhecimento</TabsTrigger>
          <TabsTrigger value="types">Tipos</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs defaultValue={currentStatus} onValueChange={onStatusChange} className="w-full">
        <TabsList className="w-full justify-start bg-gray-50/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            <span className="flex items-center gap-2">
              Todos
            </span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-white">
            <span className="flex items-center gap-2">
              <Star size={16} />
              Favoritos
            </span>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-white">
            <span className="flex items-center gap-2">
              <Clock size={16} />
              Em Progresso
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} />
              Concluídos
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MaterialsFilter;
