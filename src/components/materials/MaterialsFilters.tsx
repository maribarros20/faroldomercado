
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, SlidersHorizontal } from "lucide-react";
import { 
  MaterialCategory, 
  KnowledgeNavigation, 
  MaterialFormat 
} from "@/services/materials/types";

interface MaterialsFiltersProps {
  categories: MaterialCategory[];
  navigations: KnowledgeNavigation[];
  formats: MaterialFormat[];
  selectedCategory: string;
  selectedNavigation: string;
  selectedFormat: string;
  searchQuery: string;
  onCategoryChange: (value: string) => void;
  onNavigationChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

const MaterialsFilters: React.FC<MaterialsFiltersProps> = ({
  categories,
  navigations,
  formats,
  selectedCategory,
  selectedNavigation,
  selectedFormat,
  searchQuery,
  onCategoryChange,
  onNavigationChange,
  onFormatChange,
  onSearchChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory || selectedNavigation || selectedFormat || searchQuery;
  
  return (
    <div className="space-y-4">
      {/* Search and filter header */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-start">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar materiais..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          className="w-full md:w-auto flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          <span>Filtros Avançados</span>
        </Button>
      </div>
      
      {/* Filter selections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Categoria</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Rota do Conhecimento</label>
          <Select value={selectedNavigation} onValueChange={onNavigationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as rotas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as rotas</SelectItem>
              {navigations.map(navigation => (
                <SelectItem key={navigation.id} value={navigation.id}>{navigation.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Formato</label>
          <Select value={selectedFormat} onValueChange={onFormatChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os formatos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os formatos</SelectItem>
              {formats.map(format => (
                <SelectItem key={format.id} value={format.id}>{format.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Categoria: {categories.find(c => c.id === selectedCategory)?.name}
              <X 
                size={14} 
                className="cursor-pointer ml-1" 
                onClick={() => onCategoryChange("")} 
              />
            </Badge>
          )}
          
          {selectedNavigation && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Rota: {navigations.find(n => n.id === selectedNavigation)?.name}
              <X 
                size={14} 
                className="cursor-pointer ml-1" 
                onClick={() => onNavigationChange("")} 
              />
            </Badge>
          )}
          
          {selectedFormat && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Formato: {formats.find(f => f.id === selectedFormat)?.name}
              <X 
                size={14} 
                className="cursor-pointer ml-1" 
                onClick={() => onFormatChange("")} 
              />
            </Badge>
          )}
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="h-auto py-1 px-2 text-xs"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialsFilters;
