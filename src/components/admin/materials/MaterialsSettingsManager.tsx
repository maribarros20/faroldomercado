
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import MaterialsService from "@/services/MaterialsService";

interface Item {
  id: string;
  name: string;
}

interface ItemListProps {
  title: string;
  items: Item[];
  isLoading: boolean;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  isAdding: boolean;
  isDeleting: boolean;
  deletingId: string | null;
}

const ItemList: React.FC<ItemListProps> = ({
  title,
  items,
  isLoading,
  onAdd,
  onDelete,
  isAdding,
  isDeleting,
  deletingId
}) => {
  const [newItemName, setNewItemName] = useState("");

  const handleAdd = () => {
    if (newItemName.trim()) {
      onAdd(newItemName.trim());
      setNewItemName("");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Novo ${title.toLowerCase()}`}
          />
          <Button 
            onClick={handleAdd} 
            disabled={isAdding || !newItemName.trim()}
            size="sm"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum item cadastrado
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{item.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0"
                >
                  {isDeleting && deletingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MaterialsSettingsManager: React.FC = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries for each entity type
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["materialCategories"],
    queryFn: () => MaterialsService.getMaterialCategories(),
  });

  const { data: navigations = [], isLoading: isLoadingNavigations } = useQuery({
    queryKey: ["knowledgeNavigations"],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
  });

  const { data: formats = [], isLoading: isLoadingFormats } = useQuery({
    queryKey: ["materialFormats"],
    queryFn: () => MaterialsService.getMaterialFormats(),
  });

  const { data: themes = [], isLoading: isLoadingThemes } = useQuery({
    queryKey: ["materialThemes"],
    queryFn: () => MaterialsService.getMaterialThemes(),
  });

  // Mutations for categories
  const addCategoryMutation = useMutation({
    mutationFn: (name: string) => MaterialsService.createMaterialCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialCategories"] });
      toast({
        title: "Categoria adicionada com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => {
      setDeletingId(id);
      return MaterialsService.deleteMaterialCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialCategories"] });
      toast({
        title: "Categoria removida com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover categoria",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Mutations for navigations
  const addNavigationMutation = useMutation({
    mutationFn: (name: string) => MaterialsService.createKnowledgeNavigation(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeNavigations"] });
      toast({
        title: "Navegação adicionada com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar navegação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNavigationMutation = useMutation({
    mutationFn: (id: string) => {
      setDeletingId(id);
      return MaterialsService.deleteKnowledgeNavigation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeNavigations"] });
      toast({
        title: "Navegação removida com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover navegação",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Mutations for formats
  const addFormatMutation = useMutation({
    mutationFn: (name: string) => MaterialsService.createMaterialFormat(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialFormats"] });
      toast({
        title: "Formato adicionado com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar formato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFormatMutation = useMutation({
    mutationFn: (id: string) => {
      setDeletingId(id);
      return MaterialsService.deleteMaterialFormat(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialFormats"] });
      toast({
        title: "Formato removido com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover formato",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Mutations for themes
  const addThemeMutation = useMutation({
    mutationFn: (name: string) => MaterialsService.createMaterialTheme(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialThemes"] });
      toast({
        title: "Tema adicionado com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar tema",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: (id: string) => {
      setDeletingId(id);
      return MaterialsService.deleteMaterialTheme(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialThemes"] });
      toast({
        title: "Tema removido com sucesso",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover tema",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gerenciamento de Atributos dos Materiais</h2>
      
      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="navigations">Navegação do Conhecimento</TabsTrigger>
          <TabsTrigger value="formats">Formatos</TabsTrigger>
          <TabsTrigger value="themes">Temas/Assuntos</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <ItemList
            title="Categorias de Materiais"
            items={categories}
            isLoading={isLoadingCategories}
            onAdd={(name) => addCategoryMutation.mutate(name)}
            onDelete={(id) => deleteCategoryMutation.mutate(id)}
            isAdding={addCategoryMutation.isPending}
            isDeleting={deleteCategoryMutation.isPending}
            deletingId={deletingId}
          />
        </TabsContent>

        <TabsContent value="navigations">
          <ItemList
            title="Navegação do Conhecimento"
            items={navigations}
            isLoading={isLoadingNavigations}
            onAdd={(name) => addNavigationMutation.mutate(name)}
            onDelete={(id) => deleteNavigationMutation.mutate(id)}
            isAdding={addNavigationMutation.isPending}
            isDeleting={deleteNavigationMutation.isPending}
            deletingId={deletingId}
          />
        </TabsContent>

        <TabsContent value="formats">
          <ItemList
            title="Formatos de Materiais"
            items={formats}
            isLoading={isLoadingFormats}
            onAdd={(name) => addFormatMutation.mutate(name)}
            onDelete={(id) => deleteFormatMutation.mutate(id)}
            isAdding={addFormatMutation.isPending}
            isDeleting={deleteFormatMutation.isPending}
            deletingId={deletingId}
          />
        </TabsContent>

        <TabsContent value="themes">
          <ItemList
            title="Temas/Assuntos (Hashtags)"
            items={themes}
            isLoading={isLoadingThemes}
            onAdd={(name) => addThemeMutation.mutate(name)}
            onDelete={(id) => deleteThemeMutation.mutate(id)}
            isAdding={addThemeMutation.isPending}
            isDeleting={deleteThemeMutation.isPending}
            deletingId={deletingId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterialsSettingsManager;
