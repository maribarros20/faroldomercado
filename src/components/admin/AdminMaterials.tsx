
import { useState } from "react";
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
  Brain
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Sample data for materials
const sampleMaterials = [
  {
    id: "1",
    title: "Introdução à Análise Técnica",
    description: "Aprenda os fundamentos da análise técnica e padrões gráficos",
    type: "pdf",
    category: "Análise Técnica",
    downloads: 145,
    dateAdded: "2023-09-15"
  },
  {
    id: "2",
    title: "Modelo de Calculadora de Risco",
    description: "Calcular tamanhos de posição e parâmetros de gerenciamento de risco",
    type: "excel",
    category: "Gestão de Riscos",
    downloads: 98,
    dateAdded: "2023-10-02"
  },
  {
    id: "3",
    title: "Modelo de diário de negociação",
    description: "Acompanhe suas negociações e analise seu desempenho",
    type: "doc",
    category: "Psicologia de Negociação",
    downloads: 210,
    dateAdded: "2023-08-20"
  },
  {
    id: "4",
    title: "Guia de Análise Fundamental",
    description: "Guia completo para análise de demonstrações financeiras",
    type: "pdf",
    category: "Análise Fundamental",
    downloads: 120,
    dateAdded: "2023-11-05"
  },
];

const categories = [
  { id: "1", name: "Análise Técnica", icon: <BarChart2 size={16} /> },
  { id: "2", name: "Análise Fundamental", icon: <Search size={16} /> },
  { id: "3", name: "Gestão de Riscos", icon: <Shield size={16} /> },
  { id: "4", name: "Psicologia de Negociação", icon: <Brain size={16} /> },
];

const AdminMaterials = () => {
  const [materials, setMaterials] = useState(sampleMaterials);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    category: "",
    type: "pdf"
  });
  const { toast } = useToast();

  const handleAddMaterial = () => {
    const material = {
      id: (materials.length + 1).toString(),
      title: newMaterial.title,
      description: newMaterial.description,
      type: newMaterial.type as "pdf" | "excel" | "doc",
      category: newMaterial.category,
      downloads: 0,
      dateAdded: new Date().toISOString().split("T")[0]
    };

    setMaterials([...materials, material]);
    setIsAddDialogOpen(false);
    setNewMaterial({ title: "", description: "", category: "", type: "pdf" });

    toast({
      title: "Material adicionado",
      description: "O material foi adicionado com sucesso!",
      variant: "default",
    });
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
    
    toast({
      title: "Material removido",
      description: "O material foi removido com sucesso!",
      variant: "default",
    });
  };

  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para fazer upload</span> ou arraste e solte</p>
                      <p className="text-xs text-gray-500">PDF, Excel, Doc (MAX. 10MB)</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddMaterial} 
                disabled={!newMaterial.title || !newMaterial.category || !newMaterial.type}
              >
                Adicionar
              </Button>
            </div>
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
                      <TableCell className="hidden md:table-cell">{material.dateAdded}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit size={16} />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteMaterial(material.id)}>
                            <Trash size={16} />
                          </Button>
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
    </div>
  );
};

export default AdminMaterials;
