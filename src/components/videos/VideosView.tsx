
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Youtube, Video, Play, Clock, Tag, Bookmark } from "lucide-react";
import { useVideos, VideoSource, Video as VideoType, incrementVideoViews } from "@/services/VideosService";
import { Spinner } from "@/components/ui/spinner";
import MaterialsService from "@/services/MaterialsService";
import { useQuery } from "@tanstack/react-query";

const learningPaths = [
  { id: "all", name: "Todos" },
  { id: "iniciantes", name: "Iniciantes" },
  { id: "estrategias-avancadas", name: "Estratégias Avançadas" },
  { id: "analise-tecnica", name: "Análise Técnica" },
  { id: "gerenciamento-risco", name: "Gerenciamento de Risco" }
];

const VideoCard = ({ video }: { video: VideoType }) => {
  const navigate = useNavigate();
  
  // Get navigations data
  const { data: navigations = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const getSourceIcon = (source: VideoSource) => {
    switch (source) {
      case "youtube":
        return <Youtube size={16} className="text-red-500" />;
      case "vimeo":
        return <Video size={16} className="text-blue-500" />;
      default:
        return <Video size={16} className="text-green-500" />;
    }
  };

  const handleClick = async () => {
    await incrementVideoViews(video.id);
    navigate(`/videos/${video.id}`);
  };

  // Get navigation name
  const getNavigationName = (id: string | null | undefined) => {
    if (!id) return null;
    const navigation = navigations.find(nav => nav.id === id);
    return navigation ? navigation.name : null;
  };

  const navigationName = getNavigationName(video.navigation_id);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col cursor-pointer" onClick={handleClick}>
      <div className="relative">
        <img
          src={video.thumbnail || "https://via.placeholder.com/300x200"}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full h-8 w-8"
          onClick={handleClick}
        >
          <Play size={14} />
        </Button>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <Clock size={12} className="mr-1" />
          {video.duration}
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1 mb-1">
          {getSourceIcon(video.source)}
          <Badge variant="outline" className="text-xs">
            {video.category}
          </Badge>
          {navigationName && (
            <Badge variant="outline" className="text-xs bg-blue-50">
              <Bookmark size={10} className="mr-1" />
              {navigationName}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-base line-clamp-2 mb-2">{video.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-3 flex-1">{video.description}</p>
        
        {video.themes && video.themes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.themes.slice(0, 3).map(theme => (
              <Badge key={theme.id} variant="outline" className="text-xs bg-green-50">
                <Tag size={10} className="mr-1" />
                {theme.name}
              </Badge>
            ))}
            {video.themes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{video.themes.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
          <span>{new Date(video.date_added).toLocaleDateString()}</span>
          <span>{video.views} visualizações</span>
        </div>
      </CardContent>
    </Card>
  );
};

const VideosView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => MaterialsService.getMaterialCategories(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const learningPathFilter = activeTab !== "all" ? 
    learningPaths.find(p => p.id === activeTab)?.name : undefined;
  
  const categoryFilter = activeCategory !== "all" ?
    categoriesData.find(c => c.id === activeCategory)?.name : undefined;

  const { data: videos = [], isLoading, error } = useVideos(categoryFilter, learningPathFilter);

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format categories from the real data
  const categories = [
    { id: "all", name: "Todos" },
    ...categoriesData.map(cat => ({ id: cat.id, name: cat.name }))
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Vídeos Educacionais</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
            {learningPaths.map(path => (
              <TabsTrigger key={path.id} value={path.id} className="text-xs md:text-sm">
                {path.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            className="pl-10 py-2 border-gray-200 w-full" 
            placeholder="Buscar vídeos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
          <span className="ml-3">Carregando vídeos...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Erro ao carregar vídeos: {(error as Error).message}</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
          <p className="text-gray-500">
            Não foi possível encontrar vídeos com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideosView;
