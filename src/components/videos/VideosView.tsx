
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Tag, Bookmark } from "lucide-react";
import { useVideos, VideoSource, Video as VideoType, incrementVideoViews } from "@/services/VideosService";
import { Spinner } from "@/components/ui/spinner";
import MaterialsService from "@/services/MaterialsService";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideosFilters from "./VideosFilters";
import VideosStatusTabs from "./VideosStatusTabs";
import { useVideoProgress } from "@/services/videos/hooks/useVideoProgress";

const VideoCard = ({ video }: { video: VideoType }) => {
  const navigate = useNavigate();
  
  const { data: navigations = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const getSourceIcon = (source: VideoSource) => {
    switch (source) {
      case "youtube":
        return <div className="text-red-500">YT</div>;
      case "vimeo":
        return <div className="text-blue-500">VM</div>;
      default:
        return <div className="text-green-500">VD</div>;
    }
  };

  const handleClick = async () => {
    await incrementVideoViews(video.id);
    
    // Track view activity
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (userId) {
        await supabase.from('user_activities').insert({
          user_id: userId,
          content_id: video.id,
          activity_type: 'view_video'
        });
      }
    } catch (error) {
      console.error('Error recording video view activity:', error);
    }
    
    navigate(`/videos/${video.id}`);
  };

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
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedNavigation, setSelectedNavigation] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    checkSession();
  }, []);

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => MaterialsService.getMaterialCategories(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const { data: navigationsData = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const { data: formatsData = [] } = useQuery({
    queryKey: ['materialFormats'],
    queryFn: () => MaterialsService.getMaterialFormats(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const categoryFilter = selectedCategory !== "all" ?
    categoriesData.find(c => c.id === selectedCategory || c.name === selectedCategory)?.name : undefined;

  const { data: videos = [], isLoading: isVideosLoading, error } = useVideos(categoryFilter);

  // Apply text search filter
  const textFilteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply navigation filter
  const navigationFilteredVideos = selectedNavigation === "all" 
    ? textFilteredVideos 
    : textFilteredVideos.filter(video => video.navigation_id === selectedNavigation);

  // Apply format filter
  const formatFilteredVideos = selectedFormat === "all"
    ? navigationFilteredVideos
    : navigationFilteredVideos.filter(video => video.format_id === selectedFormat);

  // Use the custom hook for progress filtering
  const { filteredVideos, isLoading: isProgressLoading } = useVideoProgress(formatFilteredVideos, userId);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedNavigation("all");
    setSelectedFormat("all");
  };

  const isLoading = isVideosLoading || isProgressLoading;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Vídeos Educacionais</h1>
      
      <div className="mb-6">
        <VideosFilters
          categories={categoriesData}
          navigations={navigationsData}
          formats={formatsData}
          selectedCategory={selectedCategory}
          selectedNavigation={selectedNavigation}
          selectedFormat={selectedFormat}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onNavigationChange={setSelectedNavigation}
          onFormatChange={setSelectedFormat}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
        />
      </div>
      
      <VideosStatusTabs 
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
            <span className="ml-3">Carregando vídeos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Erro ao carregar vídeos: {(error as Error).message}</p>
          </div>
        ) : filteredVideos(activeStatus).length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-500">
              Não foi possível encontrar vídeos com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos(activeStatus).map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </VideosStatusTabs>
    </div>
  );
};

export default VideosView;
