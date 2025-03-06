
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ThumbsUp, MessageSquare, Share2, Bookmark, Clock, Calendar } from "lucide-react";
import { Video, getRelatedVideos, incrementVideoViews } from "@/services/VideosService";

const VideoPlayer = ({ url, source }: { url: string; source: string }) => {
  const renderPlayer = () => {
    // YouTube embed
    if (source === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (videoId) {
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      }
    }
    
    // Vimeo embed
    if (source === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/([0-9]+)/)?.[1];
      if (videoId) {
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://player.vimeo.com/video/${videoId}`}
            title="Vimeo video player"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      }
    }
    
    // Simple HTML5 video player for storage videos
    return (
      <video
        controls
        width="100%"
        height="100%"
        src={url}
        className="w-full h-full"
      >
        Seu navegador não suporta o elemento de vídeo.
      </video>
    );
  };

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {renderPlayer()}
    </div>
  );
};

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sobre");

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error("Vídeo não encontrado");
        }
        
        setVideo(data as Video);
        
        // Increment views
        await incrementVideoViews(id);
        
        // Fetch related videos
        if (data.category) {
          const related = await getRelatedVideos(id, data.category);
          setRelatedVideos(related);
        }
        
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar o vídeo");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideo();
  }, [id]);

  const handleBackClick = () => {
    navigate('/videos');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p className="text-gray-500 mb-4">{error || "Vídeo não encontrado"}</p>
          <Button onClick={handleBackClick}>Voltar para lista de vídeos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0"
        onClick={handleBackClick}
      >
        <ChevronLeft size={18} className="mr-1" />
        Voltar para lista de vídeos
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer url={video.url} source={video.source} />
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
              <Badge variant="outline" className="bg-gray-100">
                {video.category}
              </Badge>
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                {video.duration}
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {new Date(video.date_added).toLocaleDateString()}
              </div>
              <div>{video.views} visualizações</div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant="outline" size="sm">
                <ThumbsUp size={16} className="mr-1" />
                Curtir
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark size={16} className="mr-1" />
                Salvar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 size={16} className="mr-1" />
                Compartilhar
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="sobre">Sobre</TabsTrigger>
                <TabsTrigger value="discussao">Discussão</TabsTrigger>
                <TabsTrigger value="recursos">Recursos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sobre" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-gray-700 whitespace-pre-line">{video.description}</p>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold mb-2">Trilha de Aprendizado</h3>
                      <p className="text-gray-600">{video.learning_path}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussao" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="border-b pb-4 mb-4">
                      <h3 className="font-semibold mb-3">Comentários (0)</h3>
                      <textarea
                        placeholder="Deixe seu comentário sobre este vídeo..."
                        className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      ></textarea>
                      <div className="mt-2 flex justify-end">
                        <Button size="sm">Comentar</Button>
                      </div>
                    </div>
                    
                    <div className="text-center py-4 text-gray-500">
                      Ainda não há comentários para este vídeo. Seja o primeiro a comentar!
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recursos" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center py-4 text-gray-500">
                      Não há recursos adicionais disponíveis para este vídeo.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Vídeos Relacionados</h2>
          {relatedVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              Não há vídeos relacionados
            </div>
          ) : (
            <div className="space-y-4">
              {relatedVideos.map(relatedVideo => (
                <Card key={relatedVideo.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex">
                    <img
                      src={relatedVideo.thumbnail || "https://via.placeholder.com/300x200"}
                      alt={relatedVideo.title}
                      className="w-24 h-20 object-cover"
                    />
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{relatedVideo.title}</h3>
                      <div className="text-xs text-gray-500">{relatedVideo.duration} • {relatedVideo.views} visualizações</div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
