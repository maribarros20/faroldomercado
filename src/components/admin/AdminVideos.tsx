
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video as VideoType } from "@/services/VideosService";
import VideosService from "@/services/VideosService";
import MaterialsService from "@/services/MaterialsService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import VideosList from "./videos/VideosList";
import AddVideoDialog from "./videos/AddVideoDialog";
import EditVideoDialog from "./videos/EditVideoDialog";

// Mantendo para compatibilidade com outros componentes
const learningPaths = [
  { id: "1", name: "Iniciantes" },
  { id: "2", name: "Estratégias Avançadas" },
  { id: "3", name: "Análise Técnica" },
  { id: "4", name: "Gerenciamento de Risco" }
];

const AdminVideos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoType | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch videos
  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => VideosService.getVideos(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => MaterialsService.getMaterialCategories(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  // Fetch navigations
  const { data: navigations = [] } = useQuery({
    queryKey: ['knowledgeNavigations'],
    queryFn: () => MaterialsService.getKnowledgeNavigations(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  // Fetch formats
  const { data: formats = [] } = useQuery({
    queryKey: ['materialFormats'],
    queryFn: () => MaterialsService.getMaterialFormats(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  // Fetch themes
  const { data: themes = [] } = useQuery({
    queryKey: ['materialThemes'],
    queryFn: () => MaterialsService.getMaterialThemes(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const addVideoMutation = useMutation({
    mutationFn: (videoData: Omit<VideoType, 'id' | 'date_added' | 'views'>) => {
      return VideosService.createVideo(videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso!",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Falha ao adicionar vídeo: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateVideoMutation = useMutation({
    mutationFn: async (videoData: VideoType) => {
      return VideosService.updateVideo(videoData.id, videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: "Vídeo atualizado",
        description: "O vídeo foi atualizado com sucesso!",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar vídeo: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      return VideosService.deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso!",
      });
      
      logAuditAction('videos', videoToDelete || '', 'delete');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Falha ao remover vídeo: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsConfirmDeleteOpen(false);
      setVideoToDelete(null);
    }
  });

  const handleAddVideo = (videoData: Omit<VideoType, 'id' | 'date_added' | 'views'>) => {
    addVideoMutation.mutate(videoData);
  };

  const handleEditVideo = (video: VideoType) => {
    setCurrentVideo(video);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVideo = (videoData: VideoType) => {
    updateVideoMutation.mutate(videoData);
    logAuditAction('videos', videoData.id, 'update');
  };

  const handleDeleteClick = (id: string) => {
    setVideoToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (videoToDelete) {
      deleteVideoMutation.mutate(videoToDelete);
    }
  };

  const logAuditAction = async (entityType: string, entityId: string, action: string, details?: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session for audit logging");
        return;
      }
      
      const { error } = await supabase.from('admin_audit_logs').insert({
        user_id: session.user.id,
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        details: details || {}
      });
      
      if (error) {
        console.error("Error logging audit action:", error);
      }
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Vídeos</h2>
          <p className="text-sm text-gray-500">Adicione, edite ou remova vídeos educacionais</p>
        </div>
        
        <AddVideoDialog 
          isOpen={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddVideo}
          categories={categories}
          navigations={navigations}
          formats={formats}
          themes={themes}
          learningPaths={learningPaths}
        />
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Lista de Vídeos</CardTitle>
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10 py-2 border-gray-200" 
                placeholder="Buscar vídeos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VideosList 
            videos={filteredVideos}
            isLoading={isLoading}
            error={error as Error | null}
            navigations={navigations}
            onEdit={handleEditVideo}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {currentVideo && (
        <EditVideoDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdateVideo}
          video={currentVideo}
          categories={categories}
          navigations={navigations}
          formats={formats}
          themes={themes}
          learningPaths={learningPaths}
        />
      )}

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVideos;
