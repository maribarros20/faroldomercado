
import { useState, useEffect } from "react";
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
  ArrowUpDown, 
  BarChart2, 
  Shield, 
  Brain,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

// Type definitions
type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  file_url: string | null;
  thumbnail_url: string | null;
  downloads: number;
  date_added: string;
  created_by: string | null;
};

// Categories with icons
const categories = [
  { id: "1", name: "Análise Técnica", icon: <BarChart2 size={16} /> },
  { id: "2", name: "Análise Fundamental", icon: <Search size={16} /> },
  { id: "3", name: "Gestão de Riscos", icon: <Shield size={16} /> },
  { id: "4", name: "Psicologia de Negociação", icon: <Brain size={16} /> },
];

const AdminMaterials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    category: "",
    type: "pdf"
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch materials from Supabase
  const { data: materials, isLoading, isError } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('date_added', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Material[];
    }
  });

  // Mutation for adding a material
  const addMaterialMutation = useMutation({
    mutationFn: async (materialData: any) => {
      // First insert the material record
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
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
        const { error: updateError } = await supabase
          .from('materials')
          .update({ file_url: publicUrlData.publicUrl })
          .eq('id', data.id);
          
        if (updateError) throw new Error(updateError.message);
        
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
      setNewMaterial({ title: "", description: "", category: "", type: "pdf" });
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
      const { id, ...updateData } = materialData;
      
      // Update the material
      const { data, error } = await supabase
        .from('materials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
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
        const { error: updateError } = await supabase
          .from('materials')
          .update({ file_url: publicUrlData.publicUrl })
          .eq('id', data.id);
          
        if (updateError) throw new Error(updateError.message);
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
      const { data: materialToDelete } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();
      
      // Delete the material
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
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

  // Handle add material submission
  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.category || !newMaterial.type) {
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
    });
  };

  // Handle edit material
  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
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
    });
  };

  // Handle delete material
  const handleDeleteMaterial = (id: string) => {
    deleteMaterialMutation.mutate(id);
  };

  // Increment download count
  const incrementDownloadCount = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({ downloads: materials?.find(m => m.id === id)?.downloads + 1 || 1 })
        .eq('id', id);
        
      if (error) throw error;
      
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
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={16} className="text-red-500" />;
      case "excel":
        return <FileText size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-blue-500" />;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <Plus size={16} className="mr-2" /> 
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
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
                />
              </div>
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
                          {category.icon}
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
                  </SelectContent>
                </Select>
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
                disabled={!newMaterial.title || !newMaterial.category || !newMaterial.type || addMaterialMutation.isPending}
              >
                {addMaterialMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Adicionando...
                  </>
                ) : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Downloads</TableHead>
                  <TableHead className="hidden md:table-cell">Data Adicionado</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
                        <div className="flex items-center">
                          {getTypeIcon(material.type)}
                          <span className="ml-2 capitalize">{material.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">{material.downloads}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(material.date_added)}</TableCell>
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

      {/* Edit Material Dialog */}
      {selectedMaterial && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Material</DialogTitle>
            </DialogHeader>
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
                />
              </div>
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
                          {category.icon}
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
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-file">Arquivo</Label>
                {selectedMaterial.file_url && (
                  <div className="mb-2 flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <a 
                      href={selectedMaterial.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => incrementDownloadCount(selectedMaterial.id)}
                    >
                      Arquivo atual
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="edit-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Clique para substituir arquivo</span> ou arraste e solte
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
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedMaterial(null);
                  setFileToUpload(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateMaterial}
                disabled={!selectedMaterial.title || !selectedMaterial.category || !selectedMaterial.type || updateMaterialMutation.isPending}
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
      )}
    </div>
  );
};

export default AdminMaterials;
