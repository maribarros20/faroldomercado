
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import VideosService, { Video } from '@/services/VideosService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        setUserId(sessionData.session?.user.id || null);
        
        // Get video details
        const videoData = await VideosService.getVideoById(id);
        setVideo(videoData);
        
        // Get related videos
        const related = await VideosService.getRelatedVideos(videoData.category, id);
        setRelatedVideos(related);
        
        // Log activity
        if (sessionData.session?.user.id) {
          await supabase.from('user_activities').insert({
            user_id: sessionData.session.user.id,
            activity_type: 'watch_video',
            content_id: id,
            metadata: { video_id: id, title: videoData.title }
          } as any);
        }
      } catch (error) {
        console.error('Error loading video:', error);
        toast({
          title: "Erro ao carregar vídeo",
          description: "Não foi possível carregar o vídeo solicitado.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderVideoPlayer = () => {
    if (!video) return null;
    
    if (video.source === 'youtube') {
      // Extract YouTube video ID
      const videoId = video.url.includes('v=') 
        ? new URLSearchParams(new URL(video.url).search).get('v')
        : video.url.split('/').pop();
      
      return (
        <div className="aspect-video w-full">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`} 
            className="w-full h-full" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      );
    } else if (video.source === 'vimeo') {
      // Extract Vimeo video ID
      const videoId = video.url.split('/').pop();
      
      return (
        <div className="aspect-video w-full">
          <iframe 
            src={`https://player.vimeo.com/video/${videoId}`} 
            className="w-full h-full" 
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowFullScreen
          />
        </div>
      );
    } else if (video.source === 'storage') {
      // Render direct video file from storage
      return (
        <div className="aspect-video w-full">
          <video 
            src={video.url} 
            className="w-full h-full" 
            controls
            poster={video.thumbnail}
          />
        </div>
      );
    } else {
      // Default URL video
      return (
        <div className="aspect-video w-full">
          <video 
            src={video.url} 
            className="w-full h-full" 
            controls
            poster={video.thumbnail}
          />
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/videos')} 
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para vídeos
      </Button>
      
      {loading ? (
        <>
          <Skeleton className="w-full h-[400px] mb-4" />
          <Skeleton className="w-2/3 h-8 mb-2" />
          <Skeleton className="w-1/3 h-6 mb-4" />
          <Skeleton className="w-full h-24" />
        </>
      ) : video ? (
        <>
          {renderVideoPlayer()}
          
          <div className="mt-6">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            
            <div className="flex flex-wrap gap-2 mt-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center mr-4">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(video.date_added)}
              </div>
              <div className="flex items-center mr-4">
                <Clock className="w-4 h-4 mr-1" />
                {video.duration}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {video.views} visualizações
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copiado",
                    description: "Link do vídeo copiado para a área de transferência."
                  });
                }}
              >
                <Share2 className="w-4 h-4 mr-1" /> Compartilhar
              </Button>
            </div>
            
            <div className="mt-4 text-gray-700">
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="whitespace-pre-line">{video.description}</p>
            </div>
          </div>
          
          {relatedVideos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Vídeos relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedVideos.map(related => (
                  <Card 
                    key={related.id} 
                    className="h-full cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/videos/${related.id}`)}
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={related.thumbnail || '/placeholder.svg'} 
                        alt={related.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2">{related.title}</h3>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>{formatDate(related.date_added)}</span>
                        <span>{related.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Vídeo não encontrado</h2>
          <p className="mt-2 text-gray-600">O vídeo que você está procurando não está disponível.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/videos')}
          >
            Voltar para lista de vídeos
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
