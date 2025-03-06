
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  BarChart2, 
  FileText, 
  Shield, 
  Brain, 
  Download,
  BookOpen,
  Star,
  History,
  Bookmark,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

// Types
enum Level {
  BEGINNER = "Iniciante",
  INTERMEDIATE = "Intermediário",
  ADVANCED = "Avançado"
}

type MaterialCategory = {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
};

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  addedTime?: string;
  date_added: string;
  category: string;
  level?: Level;
  progress?: number;
  isFavorite?: boolean;
  isLocked?: boolean;
  tags?: string[];
  file_url?: string | null;
  downloads: number;
};

type LearningPath = {
  id: string;
  title: string;
  description: string;
  level: Level;
  category: string;
  materialCount: number;
  progress: number;
  image: string;
};

// Sample categories data (this could be moved to the database later)
const categories: MaterialCategory[] = [
  { 
    id: "1", 
    title: "Análise Técnica", 
    count: 24, 
    icon: <BarChart2 className="text-trade-blue" size={24} /> 
  },
  { 
    id: "2", 
    title: "Macroeconomia", 
    count: 18, 
    icon: <Search className="text-trade-blue" size={24} /> 
  },
  { 
    id: "3", 
    title: "Dados Econômicos", 
    count: 15, 
    icon: <BarChart2 className="text-trade-blue" size={24} /> 
  },
  { 
    id: "4", 
    title: "Psicologia do Trader", 
    count: 15, 
    icon: <Brain className="text-trade-blue" size={24} /> 
  },
  { 
    id: "5", 
    title: "Gestão de Risco", 
    count: 12, 
    icon: <Shield className="text-trade-blue" size={24} /> 
  },
  { 
    id: "6", 
    title: "Estratégias de Trading", 
    count: 21, 
    icon: <BookOpen className="text-trade-blue" size={24} /> 
  },
];

// Sample learning paths data
const learningPaths: LearningPath[] = [
  {
    id: "1",
    title: "Fundamentos de Trading",
    description: "Aprenda os princípios básicos do trading de mercados financeiros",
    level: Level.BEGINNER,
    category: "Misto",
    materialCount: 8,
    progress: 45,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: "2",
    title: "Análise Técnica Completa",
    description: "Domine todas as técnicas de análise gráfica para mercados financeiros",
    level: Level.INTERMEDIATE,
    category: "Análise Técnica",
    materialCount: 12,
    progress: 25,
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: "3",
    title: "Psicologia e Gestão de Risco",
    description: "Desenvolva disciplina e estratégias eficazes de gestão financeira",
    level: Level.INTERMEDIATE,
    category: "Misto",
    materialCount: 10,
    progress: 10,
    image: "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
];

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function MaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
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
      
      // Add some default values for the UI
      return data.map((material: any) => ({
        ...material,
        level: Level.BEGINNER, // You could make this dynamic based on some criteria
        // Convert the PostgreSQL timestamp to a relative time string
        addedTime: getRelativeTimeString(new Date(material.date_added)),
        // Set a default progress for UI demonstration
        progress: Math.floor(Math.random() * 100),
        // Random selection of materials as favorites for demo
        isFavorite: Math.random() > 0.5,
        // Lock some advanced materials for premium users
        isLocked: material.category === "Estratégias de Trading" && Math.random() > 0.5,
        // Generate some tags based on properties
        tags: [material.category.toLowerCase(), material.type.toLowerCase()]
      })) as Material[];
    }
  });

  // Function to convert date to relative time string
  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) {
      return 'hoje';
    } else if (diffInDays === 1) {
      return '1 dia';
    } else if (diffInDays < 7) {
      return `${diffInDays} dias`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 semana' : `${weeks} semanas`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 mês' : `${months} meses`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 ano' : `${years} anos`;
    }
  };

  // Mutation for incrementing download count
  const incrementDownloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const material = materials?.find(m => m.id === id);
      if (!material) throw new Error("Material não encontrado");
      
      const { data, error } = await supabase
        .from('materials')
        .update({ downloads: material.downloads + 1 })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (error: any) => {
      console.error('Erro ao incrementar downloads:', error);
    }
  });
  
  const toggleFavorite = (id: string) => {
    // In a real app, this would update state or call an API
    console.log(`Toggle favorite for material ${id}`);
  };

  // Download a material and increment download count
  const handleDownload = (material: Material) => {
    if (material.file_url) {
      // Open file in new tab
      window.open(material.file_url, '_blank');
      
      // Increment download count
      incrementDownloadMutation.mutate(material.id);
    } else {
      toast({
        title: "Arquivo não disponível",
        description: "Este material não possui um arquivo para download.",
        variant: "destructive"
      });
    }
  };

  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (material.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);
    
    const matchesCategory = selectedCategory ? material.category === selectedCategory : true;
    const matchesLevel = selectedLevel ? material.level === selectedLevel : true;
    const matchesFavorites = showOnlyFavorites ? material.isFavorite : true;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesFavorites;
  }) || [];

  const favoritesMaterials = materials?.filter(m => m.isFavorite) || [];
  const inProgressMaterials = materials?.filter(m => m.progress && m.progress > 0 && m.progress < 100) || [];
  const completedMaterials = materials?.filter(m => m.progress === 100) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-red-500" />
          </div>
        );
      case "excel":
        return (
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-green-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-blue-500" />
          </div>
        );
    }
  };

  const getLevelBadge = (level?: Level) => {
    if (!level) return null;
    
    switch (level) {
      case Level.BEGINNER:
        return <Badge className="bg-green-500 hover:bg-green-600">{level}</Badge>;
      case Level.INTERMEDIATE:
        return <Badge className="bg-blue-500 hover:bg-blue-600">{level}</Badge>;
      case Level.ADVANCED:
        return <Badge className="bg-purple-500 hover:bg-purple-600">{level}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen">
        <div className="text-center">
          <Spinner className="h-10 w-10 mx-auto mb-4" />
          <p>Carregando materiais...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar materiais</h3>
          <p>Ocorreu um erro ao carregar os materiais. Por favor, tente novamente mais tarde.</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['materials'] })}
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-500 mt-1">Aprenda com conteúdos exclusivos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <Plus size={18} className="mr-2" /> 
              Novo material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar novo material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-gray-600">
                Envie uma sugestão de material que você gostaria de ver disponível na plataforma.
              </p>
              <Input placeholder="Título do material" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Categoria</label>
                  <select className="w-full p-2 border rounded-md">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nível</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value={Level.BEGINNER}>{Level.BEGINNER}</option>
                    <option value={Level.INTERMEDIATE}>{Level.INTERMEDIATE}</option>
                    <option value={Level.ADVANCED}>{Level.ADVANCED}</option>
                  </select>
                </div>
              </div>
              <textarea className="w-full p-2 border rounded-md h-24" placeholder="Descreva o material que você gostaria de ver"></textarea>
              <Button className="w-full">Enviar sugestão</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      
      <Tabs defaultValue="categories" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="learning-paths">Trilhas de Aprendizado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer ${
                  selectedCategory === category.title 
                    ? "border-trade-blue bg-trade-light-blue" 
                    : "border-gray-100"
                }`}
                variants={itemVariants}
                onClick={() => {
                  setSelectedCategory(
                    selectedCategory === category.title ? null : category.title
                  );
                }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-trade-light-blue rounded-lg flex items-center justify-center mb-3">
                  {category.icon}
                </div>
                <h3 className="font-medium text-base text-gray-900 mb-1">{category.title}</h3>
                <p className="text-gray-500 text-sm">{category.count} materiais</p>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="learning-paths">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <motion.div
                key={path.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={path.image} 
                    alt={path.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getLevelBadge(path.level)}
                        <Badge className="bg-gray-500">{path.category}</Badge>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{path.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                    <span>{path.materialCount} materiais</span>
                    <span>{path.progress}% concluído</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                  <Button className="w-full mt-4">Continuar</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              className="pl-10 py-5 bg-white border-gray-200 rounded-xl" 
              placeholder="Pesquisar materiais..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-gray-200 text-gray-700">
                  <Filter size={18} />
                  Filtros
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filtrar materiais</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Categoria</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedCategory || ""}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.title}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nível</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedLevel || ""}
                      onChange={(e) => setSelectedLevel(e.target.value as Level || null)}
                    >
                      <option value="">Todos os níveis</option>
                      <option value={Level.BEGINNER}>{Level.BEGINNER}</option>
                      <option value={Level.INTERMEDIATE}>{Level.INTERMEDIATE}</option>
                      <option value={Level.ADVANCED}>{Level.ADVANCED}</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="favorites" 
                      className="mr-2"
                      checked={showOnlyFavorites}
                      onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                    />
                    <label htmlFor="favorites">Mostrar apenas favoritos</label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                      setSelectedCategory(null);
                      setSelectedLevel(null);
                      setShowOnlyFavorites(false);
                    }}>
                      Limpar filtros
                    </Button>
                    <Button>Aplicar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2 border-gray-200 text-gray-700">
              Organizar
              <ChevronDown size={18} />
            </Button>
          </div>
        </div>
        
        <Card className="bg-white border-gray-100 mb-6">
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all" className="text-sm md:text-base">Todos</TabsTrigger>
                <TabsTrigger value="favorites" className="text-sm md:text-base">Favoritos</TabsTrigger>
                <TabsTrigger value="in-progress" className="text-sm md:text-base">Em Progresso</TabsTrigger>
                <TabsTrigger value="completed" className="text-sm md:text-base">Concluídos</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {(activeTab === "all" ? filteredMaterials : 
            activeTab === "favorites" ? favoritesMaterials :
            activeTab === "in-progress" ? inProgressMaterials :
            completedMaterials).map((material) => (
            <motion.div
              key={material.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative"
              variants={itemVariants}
            >
              {material.isLocked && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="text-center p-4">
                    <Shield className="mx-auto mb-2 text-yellow-500" size={32} />
                    <p className="text-white font-medium mb-2">Conteúdo Premium</p>
                    <Button size="sm">Fazer Upgrade</Button>
                  </div>
                </div>
              )}
              
              <div className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  {getTypeIcon(material.type)}
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium text-base md:text-lg text-gray-900">{material.title}</h3>
                      <button 
                        onClick={() => toggleFavorite(material.id)}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        <Star 
                          size={18} 
                          fill={material.isFavorite ? "currentColor" : "none"} 
                          className={material.isFavorite ? "text-yellow-500" : ""} 
                        />
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{material.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getLevelBadge(material.level)}
                      <Badge variant="outline" className="text-xs">{material.category}</Badge>
                    </div>
                    {material.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progresso</span>
                          <span>{material.progress}%</span>
                        </div>
                        <Progress value={material.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    Adicionado há {material.addedTime}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full h-8 w-8 p-0"
                    onClick={() => handleDownload(material)}
                    disabled={incrementDownloadMutation.isPending}
                  >
                    {incrementDownloadMutation.isPending && incrementDownloadMutation.variables === material.id ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Download size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {(activeTab === "all" && filteredMaterials.length === 0) || 
           (activeTab === "favorites" && favoritesMaterials.length === 0) || 
           (activeTab === "in-progress" && inProgressMaterials.length === 0) || 
           (activeTab === "completed" && completedMaterials.length === 0) ? (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {activeTab === "favorites" ? (
                  <Bookmark size={24} className="text-gray-400" />
                ) : activeTab === "in-progress" ? (
                  <Clock size={24} className="text-gray-400" />
                ) : activeTab === "completed" ? (
                  <CheckCircle size={24} className="text-gray-400" />
                ) : (
                  <Search size={24} className="text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum material encontrado</h3>
              <p className="text-gray-500">
                {activeTab === "favorites" ? "Você ainda não adicionou materiais aos favoritos." : 
                 activeTab === "in-progress" ? "Você não está lendo nenhum material no momento." :
                 activeTab === "completed" ? "Você ainda não concluiu nenhum material." :
                 "Tente ajustar seus filtros ou termos de pesquisa."}
              </p>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
