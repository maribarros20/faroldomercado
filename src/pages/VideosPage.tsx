
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Play, 
  ChevronDown, 
  BookOpen, 
  ArrowRight, 
  Clock,
  Youtube,
  Video,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

// Tipos para os vídeos
type VideoSource = "youtube" | "vimeo" | "storage";

type VideoItem = {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
  source: VideoSource;
  sourceUrl: string;
};

// Tipo para trilhas de estudo
type LearningPath = {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  progress: number;
};

// Categorias de vídeos
const categories = [
  "Todos",
  "Análise Técnica",
  "Análise Fundamental",
  "Day Trade",
  "Gestão de Risco",
  "Psicologia"
];

// Trilhas de estudo
const learningPaths: LearningPath[] = [
  {
    id: "1",
    title: "Fundamentos do Trading",
    description: "Série de vídeos para iniciantes que desejam aprender os conceitos básicos do trading",
    lessons: 12,
    duration: "8h 45min",
    progress: 30
  },
  {
    id: "2",
    title: "Análise Técnica Avançada",
    description: "Domine padrões complexos de análise técnica para trading profissional",
    lessons: 18,
    duration: "15h 20min",
    progress: 65
  },
  {
    id: "3",
    title: "Psicologia do Investidor",
    description: "Aprenda a dominar suas emoções e tomar decisões racionais",
    lessons: 8,
    duration: "5h 15min",
    progress: 10
  },
  {
    id: "4",
    title: "Estratégias para Iniciantes",
    description: "Estratégias simples e eficazes para quem está começando no mercado",
    lessons: 10,
    duration: "6h 30min",
    progress: 0
  }
];

// Vídeos em destaque
const featuredVideos: VideoItem[] = [
  {
    id: "1",
    title: "Dominando Análise Técnica: Guia Completo",
    description: "Aprenda os fundamentos e técnicas avançadas de análise técnica para aprimorar suas decisões de trading.",
    duration: "1h 32min",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Análise Técnica",
    source: "youtube",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "2",
    title: "Psicologia do Trader: Controle Emocional",
    description: "Descubra como gerenciar suas emoções e melhorar a tomada de decisões no trading.",
    duration: "58min",
    thumbnail: "https://images.unsplash.com/photo-1579226905180-636b76d96082?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Psicologia",
    source: "vimeo",
    sourceUrl: "https://vimeo.com/123456789"
  },
  {
    id: "3",
    title: "Estratégias de Gestão de Risco para Day Traders",
    description: "Aprenda técnicas essenciais para proteger seu capital e maximizar seus ganhos no day trade.",
    duration: "45min",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Gestão de Risco",
    source: "storage",
    sourceUrl: "/videos/risk-management.mp4"
  }
];

// Vídeos recentes
const allVideos: VideoItem[] = [
  ...featuredVideos,
  {
    id: "4",
    title: "Como Interpretar Candlesticks",
    description: "Aprenda a identificar padrões de candlesticks e como usá-los em suas análises.",
    duration: "28min",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Análise Técnica",
    source: "youtube",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "5",
    title: "Introdução a Índices e ETFs",
    description: "Entenda como funcionam os índices e ETFs e como investir nestes instrumentos.",
    duration: "42min",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Análise Fundamental",
    source: "vimeo",
    sourceUrl: "https://vimeo.com/123456789"
  },
  {
    id: "6",
    title: "Estratégias Intraday para Iniciantes",
    description: "Conheça estratégias de day trade simples e eficazes para iniciantes.",
    duration: "36min",
    thumbnail: "https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Day Trade",
    source: "youtube",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "7",
    title: "Análise de Demonstrações Financeiras",
    description: "Aprenda a analisar demonstrações financeiras para tomar melhores decisões de investimento.",
    duration: "52min",
    thumbnail: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80",
    category: "Análise Fundamental",
    source: "storage",
    sourceUrl: "/videos/financial-statements.mp4"
  },
  {
    id: "8",
    title: "Técnicas de Respiração para Traders",
    description: "Técnicas de respiração que ajudam a manter o foco e controlar a ansiedade durante operações.",
    duration: "19min",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Psicologia",
    source: "vimeo",
    sourceUrl: "https://vimeo.com/123456789"
  },
  {
    id: "9",
    title: "Configuração da Plataforma MetaTrader",
    description: "Guia completo para configurar a plataforma MetaTrader para day trade.",
    duration: "38min",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1415&q=80",
    category: "Day Trade",
    source: "youtube",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

// Função para obter o ícone da fonte do vídeo
const getSourceIcon = (source: VideoSource) => {
  switch (source) {
    case "youtube":
      return <Youtube size={20} className="text-red-500" />;
    case "vimeo":
      return <Video size={20} className="text-blue-500" />;
    case "storage":
      return <Video size={20} className="text-green-500" />;
    default:
      return <Video size={20} />;
  }
};

// Configurações de animação
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

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filtrar os vídeos por pesquisa e categoria
  const filteredVideos = allVideos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           video.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Manipular a mudança de categoria
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vídeos</h1>
          <p className="text-gray-500 mt-1">Aprenda com nossos cursos e conteúdos em vídeo</p>
        </div>
        <Button className="bg-trade-blue hover:bg-trade-blue/90">
          <Play size={18} className="mr-2" /> 
          Continuar assistindo
        </Button>
      </header>

      <Tabs defaultValue="all" className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <TabsList className="bg-gray-100 p-1 rounded-lg flex flex-wrap">
            {categories.map((category, index) => (
              <TabsTrigger 
                key={index} 
                value={index === 0 ? "all" : category.toLowerCase().replace(/\s+/g, '-')}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-trade-blue"
                onClick={() => handleCategoryChange(index === 0 ? "all" : category.toLowerCase())}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10 bg-white border-gray-200" 
                placeholder="Buscar vídeos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 border-gray-200 text-gray-700">
              <Filter size={18} />
              Filtro
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {/* Trilhas de Aprendizado */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trilhas de Aprendizado</h2>
              <Button variant="link" className="text-trade-blue gap-1">
                Ver todas <ArrowRight size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => (
                <div 
                  key={path.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">{path.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{path.description}</p>
                      </div>
                      <div className="bg-trade-light-blue rounded-lg p-2">
                        <BookOpen size={20} className="text-trade-blue" />
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {path.lessons} lições
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {path.duration}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div 
                        className="bg-trade-blue h-2 rounded-full" 
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{path.progress}% concluído</span>
                      <Button size="sm">Continuar</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vídeos em Destaque */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Destaques</h2>
            </div>
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {featuredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  variants={itemVariants}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Button className="rounded-full w-12 h-12 p-0 bg-white bg-opacity-25 hover:bg-opacity-40">
                        <Play size={24} className="text-white" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={12} />
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-trade-blue text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      {getSourceIcon(video.source)}
                      {video.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{video.description}</p>
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                      <Play size={16} />
                      Assistir agora
                      {video.source !== "storage" && <ExternalLink size={14} className="ml-auto" />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Vídeos Filtrados */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {searchQuery || selectedCategory !== "all" 
                  ? "Resultados da Pesquisa" 
                  : "Todos os Vídeos"}
              </h2>
              {filteredVideos.length > 0 && (
                <span className="text-sm text-gray-500">{filteredVideos.length} vídeos encontrados</span>
              )}
            </div>
            {filteredVideos.length === 0 ? (
              <div className="text-center py-10">
                <Video size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">Nenhum vídeo encontrado</h3>
                <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou termo de busca</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {filteredVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    variants={itemVariants}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Button className="rounded-full w-10 h-10 p-0 bg-white bg-opacity-25 hover:bg-opacity-40">
                          <Play size={20} className="text-white" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock size={12} />
                        {video.duration}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          {video.category}
                        </span>
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center">
                          {getSourceIcon(video.source)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg text-gray-900">{video.title}</h3>
                      <div className="flex justify-end mt-2">
                        <Button variant="ghost" size="sm" className="gap-1 text-gray-500 hover:text-trade-blue">
                          <Play size={16} />
                          Assistir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
