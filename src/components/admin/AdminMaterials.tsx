
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash, 
  Upload,
  FileSpreadsheet,
  Book,
  Presentation,
  FilePieChart,
  FileBarChart2,
  Hash,
  BarChart2, 
  Shield, 
  Brain,
  AlertCircle,
  Settings2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MaterialsService from "@/services/MaterialsService";
import { Material, MaterialCategory, KnowledgeNavigation, MaterialFormat, MaterialTheme } from "@/services/materials/types";
import MaterialsSettingsManager from "@/components/admin/materials/MaterialsSettingsManager";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AdminMaterials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    category: "",
    type: "pdf",
    navigation_id: "",
    format_id: "",
    selectedThemes: [] as string[],
    icon: "file-text" // Default icon
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch materials from Supabase
  const { data: materials, isLoading, isError } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      return MaterialsService.getMaterials();
    }
  });

  // Fetch categories, navigations, formats, and themes
  const { data: categories = [] } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => MaterialsService.getMaterialCategories(),
  });

  const { data: navigations = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
  });

  const { data: formats = [] } = useQuery({
    queryKey: ['materialFormats'],
    queryFn: () => MaterialsService.getMaterialFormats(),
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['materialThemes'],
    queryFn: () => MaterialsService.getMaterialThemes(),
  });

  // Available icons for materials
  const availableIcons = [
    { name: "file-text", component: <FileText className="h-5 w-5 text-blue-600" /> },
    { name: "file-spreadsheet", component: <FileSpreadsheet className="h-5 w-5 text-green-600" /> },
    { name: "book", component: <Book className="h-5 w-5 text-purple-600" /> },
    { name: "presentation", component: <Presentation className="h-5 w-5 text-orange-600" /> },
    { name: "file-bar-chart", component: <FileBarChart2 className="h-5 w-5 text-yellow-600" /> },
    { name: "file-pie-chart", component: <FilePieChart className="h-5 w-5 text-pink-600" /> },
  ];

  // Mutation for adding a material
  const addMaterialMutation = useMutation({
    mutationFn: async (materialData: any) => {
      // First insert the material record
      const { selectedThemes, icon, ...materialFields } = materialData;
      
      // Create material
      const data = await MaterialsService.createMaterial({
        ...materialFields,
        themes: selectedThemes,
        icon: icon
      });
      
      // If there's a file to upload
      if (fileToUpload && data) {
        const fileExt = fileToUpload.name.split('.').pop();
        const filePath = `${data.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('materials')
          .upload(filePath, fileToUpload);
          
        if (uploadError) throw new Error(uploadError.message);
        
        // Get the public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('materials')
          .getPublicUrl(filePath);
          
        // Update the material with the file URL
        await MaterialsService.updateMaterial(data.id, { 
          file_url: publicUrlData.publicUrl 
        });
          
        // Log the action
        await logAdminAction('create', 'material', data.id, {
          title: data.title,
          file_type: fileExt
        });
      }
      
      return data;
    },
    onSuccess: () => {
      // Reset form and refetch data
      setNewMaterial({ 
        title: "", 
        description: "", 
        category: "", 
        type: "pdf",
        navigation_id: "",
        format_id: "",
        selectedThemes: [],
        icon: "file-text"
      });
      setFileToUpload(null);
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      toast({
        title: "Material adicionado",
        description: "O material foi adicionado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar material",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating a material
  const updateMaterialMutation = useMutation({
    mutationFn: async (materialData: any) => {
      const { id, selectedThemes, icon, ...updateData } = materialData;
      
      // Update the material
      const data = await MaterialsService.updateMaterial(id, {
        ...updateData,
        themes: selectedThemes,
        icon: icon
      });
      
      // If there's a file to upload
      if (fileToUpload && data) {
        const fileExt = fileToUpload.name.split('.').pop();
        const filePath = `${data.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('materials')
          .upload(filePath, fileToUpload);
          
        if (uploadError) throw new Error(uploadError.message);
        
        // Get the public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('materials')
          .getPublicUrl(filePath);
          
        // Update the material with the file URL
        await MaterialsService.updateMaterial(data.id, { 
          file_url: publicUrlData.publicUrl 
        });
      }
      
      // Log the action
      await logAdminAction('update', 'material', id, {
        title: data.title
      });
      
      return data;
    },
    onSuccess: () => {
      setSelectedMaterial(null);
      setFileToUpload(null);
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      toast({
        title: "Material atualizado",
        description: "O material foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar material",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting a material
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get the material to log its data before deletion
      const materialToDelete = await MaterialsService.getMaterialById(id);
      
      // Delete the material
      await MaterialsService.deleteMaterial(id);
      
      // If there's a file, delete it from storage
      if (materialToDelete?.file_url) {
        // Extract the path from the URL
        const urlParts = materialToDelete.file_url.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('materials') + 1).join('/');
        
        const { error: storageError } = await supabase
          .storage
          .from('materials')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting file:', storageError);
        }
      }
      
      // Log the action
      await logAdminAction('delete', 'material', id, {
        title: materialToDelete?.title
      });
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover material",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Function to log admin actions
  const logAdminAction = async (action: string, entityType: string, entityId: string, details: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      await supabase
        .from('admin_audit_logs')
        .insert({
          user_id: session.user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // Handle theme selection toggle
  const handleThemeToggle = (themeId: string, isSelected: boolean, isNewMaterial: boolean) => {
    if (isNewMaterial) {
      if (isSelected) {
        setNewMaterial(prev => ({
          ...prev,
          selectedThemes: prev.selectedThemes.filter(id => id !== themeId)
        }));
      } else {
        setNewMaterial(prev => ({
          ...prev,
          selectedThemes: [...prev.selectedThemes, themeId]
        }));
      }
    } else if (selectedMaterial) {
      const currentThemes = selectedMaterial.themes?.map(theme => theme.id) || [];
      
      if (isSelected) {
        setSelectedMaterial({
          ...selectedMaterial,
          themes: (selectedMaterial.themes || []).filter(theme => theme.id !== themeId)
        });
      } else {
        const newTheme = themes.find(theme => theme.id === themeId);
        if (newTheme) {
          setSelectedMaterial({
            ...selectedMaterial,
            themes: [...(selectedMaterial.themes || []), newTheme]
          });
        }
      }
    }
  };

  // Handle add material submission
  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.category) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    addMaterialMutation.mutate({
      title: newMaterial.title,
      description: newMaterial.description,
      category: newMaterial.category,
      type: newMaterial.type,
      navigation_id: newMaterial.navigation_id || null,
      format_id: newMaterial.format_id || null,
      selectedThemes: newMaterial.selectedThemes,
      icon: newMaterial.icon
    });
  };

  // Handle edit material
  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial({
      ...material,
      themes: material.themes || [],
      icon: material.icon || "file-text"
    });
    setIsEditDialogOpen(true);
  };

  // Handle update material submission
  const handleUpdateMaterial = () => {
    if (!selectedMaterial) return;
    
    updateMaterialMutation.mutate({
      id: selectedMaterial.id,
      title: selectedMaterial.title,
      description: selectedMaterial.description,
      category: selectedMaterial.category,
      type: selectedMaterial.type,
      navigation_id: selectedMaterial.navigation_id || null,
      format_id: selectedMaterial.format_id || null,
      selectedThemes: selectedMaterial.themes?.map(theme => theme.id) || [],
      icon: selectedMaterial.icon || "file-text"
    });
  };

  // Handle delete material
  const handleDeleteMaterial = (id: string) => {
    deleteMaterialMutation.mutate(id);
  };

  // Increment download count
  const incrementDownloadCount = async (id: string) => {
    try {
      await MaterialsService.incrementDownloads(id);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  // Filter materials based on search query
  const filteredMaterials = materials?.filter(material => 
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Helper function to get type icon
  const getTypeIcon = (type: string, iconName: string | undefined) => {
    if (iconName) {
      const icon = availableIcons.find(i => i.name === iconName);
      if (icon) return icon.component;
    }
    
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText size={16} className="text-red-500" />;
      case "excel":
        return <FileSpreadsheet size={16} className="text-green-500" />;
      case "ebook":
        return <Book size={16} className="text-purple-500" />;
      case "apresentação":
        return <Presentation size={16} className="text-blue-500" />;
      case "relatório":
        return <FileBarChart2 size={16} className="text-orange-500" />;
      case "mapa mental":
        return <FilePieChart size={16} className="text-pink-500" />;
      default:
        return <FileText size={16} className="text-blue-500" />;
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Análise Técnica":
        return <BarChart2 size={16} />;
      case "Análise Fundamental":
        return <Search size={16} />;
      case "Gestão de Riscos":
        return <Shield size={16} />;
      case "Psicologia de Negociação":
        return <Brain size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Find the format name by ID
  const getFormatName = (formatId: string | null) => {
    if (!formatId) return "Não especificado";
    const format = formats.find(f => f.id === formatId);
    return format ? format.name : "Não especificado";
  };

  // Find the navigation name by ID
  const getNavigationName = (navigationId: string | null) => {
    if (!navigationId) return "Não especificado";
    const navigation = navigations.find(n => n.id === navigationId);
    return navigation ? navigation.name : "Não especificado";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Spinner className="h-10 w-10 mx-auto mb-4" />
          <p>Carregando materiais...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar materiais</h3>
          <p>Ocorreu um erro ao carregar os materiais. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Materiais</h2>
          <p className="text-sm text-gray-500">Adicione, edite ou remova materiais educacionais</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings2 size={16} className="mr-2" /> 
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configurações de Materiais</DialogTitle>
              </DialogHeader>
              <MaterialsSettingsManager />
            </DialogContent>
          </Dialog>
          
          <Button 
            className="bg-trade-blue hover:bg-trade-blue/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus size={16} className="mr-2" /> 
            Adicionar Material
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Materiais</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <CardTitle>Lista de Materiais</CardTitle>
                <div className="relative w-full md:w-72">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    className="pl-10 py-2 border-gray-200" 
                    placeholder="Buscar materiais..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead className="w-[250px]">Título</TableHead>
                      <TableHead className="hidden md:table-cell">Categoria</TableHead>
                      <TableHead className="hidden md:table-cell">Navegação</TableHead>
                      <TableHead className="hidden md:table-cell">Tipo/Formato</TableHead>
                      <TableHead className="hidden lg:table-cell">Temas</TableHead>
                      <TableHead className="hidden md:table-cell text-right">Downloads</TableHead>
                      <TableHead className="hidden md:table-cell">Data Adicionado</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          Nenhum material encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMaterials.map((material, index) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{material.title}</div>
                            <div className="text-sm text-gray-500 md:hidden">{material.category}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{material.category}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {material.navigation_id ? getNavigationName(material.navigation_id) : "Não especificado"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                {getTypeIcon(material.type, material.icon)}
                                <span className="ml-2 capitalize">{material.type}</span>
                              </div>
                              {material.format_id && (
                                <span className="text-xs text-gray-500 mt-1">
                                  Formato: {getFormatName(material.format_id)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {material.themes && material.themes.length > 0 ? (
                                material.themes.map(theme => (
                                  <Badge key={theme.id} variant="outline" className="text-xs">
                                    <Hash size={10} className="mr-1" /> {theme.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">Nenhum tema</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right">{material.downloads || 0}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(material.date_added || '')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditMaterial(material)}
                              >
                                <Edit size={16} />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
                                    <Trash size={16} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover o material "{material.title}"? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteMaterial(material.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      {deleteMaterialMutation.isPending && material.id === deleteMaterialMutation.variables ? (
                                        <>
                                          <Spinner className="mr-2 h-4 w-4" />
                                          Removendo...
                                        </>
                                      ) : "Remover"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <MaterialsSettingsManager />
        </TabsContent>
      </Tabs>

      {/* Add Material Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Material</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                value={newMaterial.title} 
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                value={newMaterial.description} 
                onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})} 
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={newMaterial.category} 
                  onValueChange={(value) => setNewMaterial({...newMaterial, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center">
                          {getCategoryIcon(category.name)}
                          <span className="ml-2">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={newMaterial.type} 
                  onValueChange={(value) => setNewMaterial({...newMaterial, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="doc">Documento</SelectItem>
                    <SelectItem value="presentation">Apresentação</SelectItem>
                    <SelectItem value="ebook">eBook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="navigation">Navegação do Conhecimento</Label>
                <Select 
                  value={newMaterial.navigation_id} 
                  onValueChange={(value) => setNewMaterial({...newMaterial, navigation_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    {navigations.map((navigation) => (
                      <SelectItem key={navigation.id} value={navigation.id}>
                        {navigation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="format">Formato</Label>
                <Select 
                  value={newMaterial.format_id} 
                  onValueChange={(value) => setNewMaterial({...newMaterial, format_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    {formats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Ícone</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    {getTypeIcon("", newMaterial.icon)} 
                    <span className="ml-2">Selecionar Ícone</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {availableIcons.map((icon) => (
                      <Button 
                        key={icon.name}
                        variant="outline"
                        className={`p-2 ${newMaterial.icon === icon.name ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setNewMaterial({...newMaterial, icon: icon.name})}
                      >
                        {React.cloneElement(icon.component as React.ReactElement)}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Temas/Assuntos (Hashtags)</Label>
              <div className="flex flex-wrap gap-2 border p-2 rounded-md min-h-[100px]">
                {themes.length === 0 ? (
                  <div className="text-gray-500 text-sm p-2">
                    Nenhum tema disponível. Adicione temas nas configurações.
                  </div>
                ) : (
                  themes.map((theme) => {
                    const isSelected = newMaterial.selectedThemes.includes(theme.id);
                    return (
                      <Badge 
                        key={theme.id} 
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleThemeToggle(theme.id, isSelected, true)}
                      >
                        <Hash size={12} className="mr-1" /> 
                        {theme.name}
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo</Label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PDF, Excel, Doc (MAX. 10MB)</p>
                    {fileToUpload && (
                      <p className="mt-2 text-sm text-green-600 font-medium">{fileToUpload.name}</p>
                    )}
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setFileToUpload(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddMaterial}
              disabled={addMaterialMutation.isPending}
            >
              {addMaterialMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Adicionando...
                </>
              ) : "Adicionar Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input 
                  id="edit-title" 
                  value={selectedMaterial.title} 
                  onChange={(e) => setSelectedMaterial({...selectedMaterial, title: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedMaterial.description || ''} 
                  onChange={(e) => setSelectedMaterial({...selectedMaterial, description: e.target.value})} 
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select 
                    value={selectedMaterial.category} 
                    onValueChange={(value) => setSelectedMaterial({...selectedMaterial, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center">
                            {getCategoryIcon(category.name)}
                            <span className="ml-2">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Tipo</Label>
                  <Select 
                    value={selectedMaterial.type} 
                    onValueChange={(value) => setSelectedMaterial({...selectedMaterial, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="doc">Documento</SelectItem>
                      <SelectItem value="presentation">Apresentação</SelectItem>
                      <SelectItem value="ebook">eBook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-navigation">Navegação do Conhecimento</Label>
                  <Select 
                    value={selectedMaterial.navigation_id || 'none'} 
                    onValueChange={(value) => setSelectedMaterial({...selectedMaterial, navigation_id: value === 'none' ? null : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não especificado</SelectItem>
                      {navigations.map((navigation) => (
                        <SelectItem key={navigation.id} value={navigation.id}>
                          {navigation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-format">Formato</Label>
                  <Select 
                    value={selectedMaterial.format_id || 'none'} 
                    onValueChange={(value) => setSelectedMaterial({...selectedMaterial, format_id: value === 'none' ? null : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não especificado</SelectItem>
                      {formats.map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Ícone</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      {getTypeIcon("", selectedMaterial.icon)} 
                      <span className="ml-2">Selecionar Ícone</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2">
                    <div className="grid grid-cols-3 gap-2">
                      {availableIcons.map((icon) => (
                        <Button 
                          key={icon.name}
                          variant="outline"
                          className={`p-2 ${selectedMaterial.icon === icon.name ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedMaterial({...selectedMaterial, icon: icon.name})}
                        >
                          {React.cloneElement(icon.component as React.ReactElement)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Temas/Assuntos (Hashtags)</Label>
                <div className="flex flex-wrap gap-2 border p-2 rounded-md min-h-[100px]">
                  {themes.length === 0 ? (
                    <div className="text-gray-500 text-sm p-2">
                      Nenhum tema disponível. Adicione temas nas configurações.
                    </div>
                  ) : (
                    themes.map((theme) => {
                      const isSelected = selectedMaterial.themes?.some(t => t.id === theme.id) || false;
                      return (
                        <Badge 
                          key={theme.id} 
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleThemeToggle(theme.id, isSelected, false)}
                        >
                          <Hash size={12} className="mr-1" /> 
                          {theme.name}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-file">Arquivo</Label>
                <div className="flex flex-col gap-2">
                  {selectedMaterial.file_url && (
                    <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                      <div className="flex items-center">
                        {getTypeIcon(selectedMaterial.type, selectedMaterial.icon)}
                        <span className="ml-2 text-sm">Arquivo atual</span>
                      </div>
                      <a 
                        href={selectedMaterial.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Visualizar
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="edit-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para trocar o arquivo</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">PDF, Excel, Doc (MAX. 10MB)</p>
                        {fileToUpload && (
                          <p className="mt-2 text-sm text-green-600 font-medium">{fileToUpload.name}</p>
                        )}
                      </div>
                      <input 
                        id="edit-file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setFileToUpload(null);
                setSelectedMaterial(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateMaterial}
              disabled={updateMaterialMutation.isPending}
            >
              {updateMaterialMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Atualizando...
                </>
              ) : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMaterials;
