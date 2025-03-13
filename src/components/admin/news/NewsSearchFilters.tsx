
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface NewsSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSource: string;
  setSelectedSource: (value: string) => void;
  showOnlyFinancialNews: boolean;
  toggleFinancialNewsFilter: () => void;
  handleSearch: (e: React.FormEvent) => void;
  uniqueSources: string[];
  financeCategories: string[];
}

export const NewsSearchFilters: React.FC<NewsSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSource,
  setSelectedSource,
  showOnlyFinancialNews,
  toggleFinancialNewsFilter,
  handleSearch,
  uniqueSources,
  financeCategories,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar notícias..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      <div className="w-full md:w-[200px]">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {financeCategories.slice(1).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-[200px]">
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fontes</SelectItem>
            {uniqueSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant={showOnlyFinancialNews ? "default" : "outline"}
        onClick={toggleFinancialNewsFilter}
        className="flex items-center gap-2"
      >
        <Filter size={16} />
        {showOnlyFinancialNews ? "Apenas Mercado Financeiro" : "Todas as Notícias"}
      </Button>
    </div>
  );
};
