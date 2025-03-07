
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MaterialCategory, MaterialFormat, KnowledgeNavigation } from "@/services/materials/types";
import { Spinner } from "@/components/ui/spinner";

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
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar materiais..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:w-2/3">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedNavigation} onValueChange={onNavigationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Roteiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os roteiros</SelectItem>
              {navigations.map((navigation) => (
                <SelectItem key={navigation.id} value={navigation.id}>
                  {navigation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedFormat} onValueChange={onFormatChange}>
            <SelectTrigger>
              <SelectValue placeholder="Formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os formatos</SelectItem>
              {formats.map((format) => (
                <SelectItem key={format.id} value={format.id}>
                  {format.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="whitespace-nowrap"
        >
          Limpar filtros
        </Button>
      </div>
    </div>
  );
};

export default MaterialsFilters;
