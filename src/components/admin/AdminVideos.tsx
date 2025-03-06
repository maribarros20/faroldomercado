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
  Edit, 
  Trash, 
  Upload,
  Video,
  Youtube,
  ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video as VideoType, VideoSource } from "@/services/VideosService";

// Video type
type VideoSource = "youtube" | "vimeo" | "storage";

type Video = {
  id: string;
  title: string;
  description: string;
  source: VideoSource;
  url: string;
  thumbnail: string;
  category: string;
  learning_path: string;
  duration: string;
  date_added: string;
  views: number;
};

// Sample data
const learningPaths = [
  { id: "1", name: "Iniciantes" },
  { id: "2", name: "Estratégias Avançadas" },
  { id: "3", name: "Análise Técnica" },
  { id: "4", name: "Gerenciamento de Risco" }
];

const categories = [
  { id: "1", name: "Day Trade" },
  { id: "2", name: "Swing Trade" },
  { id: "3", name: "Análise Técnica" },
  { id: "4", name: "Análise Fundamental" },
  { id: "5", name: "Psicologia" }
];

const AdminVideos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    source: "youtube" as VideoSource,
    url: "",
    category: "",
    learning_path: "",
    duration: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch videos from Supabase
  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      console.log("Fetching videos from Supabase");
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('date_added', { ascending: false });
      
      if (error) {
        console.error("Error fetching videos:", error);
        throw new Error(error.message);
      }
      
      console.log("Videos fetched:", data);
      return data as VideoType[];
    }
  });

  // Add video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (videoData: Omit<VideoType, 'id' | 'date_added' | 'views'>) => {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          ...videoData,
          date_added: new Date().toISOString(),
          views: 0
        })
        .select();
      
      if (error) throw new Error(error.message);
      return data[0] as VideoType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso!",
      });
      setIsAddDialogOpen(false);
      resetVideoForm();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao adicionar vídeo: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async (videoData: VideoType) => {
      const { data, error } = await supabase
        .from('videos')
        .update({
          title: videoData.title,
          description: videoData.description,
          source: videoData.source,
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          category: videoData.category,
          learning_path: videoData.learning_path,
          duration: videoData.duration
        })
        .eq('id', videoData.id)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0] as VideoType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: "Vídeo atualizado",
        description: "O vídeo foi atualizado com sucesso!",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar vídeo: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso!",
      });
      
      // Log audit trail
      logAuditAction('videos', id, 'delete');
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao remover vídeo: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Reset form after submission
  const resetVideoForm = () => {
    setNewVideo({
      title: "",
      description: "",
      source: "youtube",
      url: "",
      category: "",
      learning_path: "",
      duration: ""
    });
  };

  const handleAddVideo = () => {
    // Get thumbnail from YouTube if possible
    let thumbnail = "https://via.placeholder.com/300x200";
    
    if (newVideo.source === "youtube") {
      // Try to extract video ID from YouTube URL
      const youtubeIdMatch = newVideo.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeIdMatch && youtubeIdMatch[1]) {
        thumbnail = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/0.jpg`;
      }
    }
    
    const videoData = {
      title: newVideo.title,
      description: newVideo.description,
      source: newVideo.source,
      url: newVideo.url,
      thumbnail: thumbnail,
      category: newVideo.category,
      learning_path: newVideo.learning_path,
      duration: newVideo.duration
    };
    
    addVideoMutation.mutate(videoData);
  };

  const handleEditVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVideo = () => {
    if (!currentVideo) return;
    updateVideoMutation.mutate(currentVideo);
    
    // Log audit trail
    logAuditAction('videos', currentVideo.id, 'update');
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este vídeo?")) {
      deleteVideoMutation.mutate(id);
    }
  };

  // Log audit action for admin activities
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
    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.learning_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceIcon = (source: VideoSource) => {
    switch (source) {
      case "youtube":
        return <Youtube size={16} className="text-red-500" />;
      case "vimeo":
        return <Video size={16} className="text-blue-500" />;
      case "storage":
        return <Video size={16} className="text-green-500" />;
      default:
        return <Video size={16} />;
    }
  };

  const getSourceBadge = (source: VideoSource) => {
    switch (source) {
      case "youtube":
        return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">YouTube</Badge>;
      case "vimeo":
        return <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200">Vimeo</Badge>;
      case "storage":
        return <Badge variant="outline" className="bg-green-50 text-green-500 border-green-200">Storage</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Vídeos</h2>
          <p className="text-sm text-gray-500">Adicione, edite ou remova vídeos educacionais</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <Plus size={16} className="mr-2" /> 
              Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Vídeo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input 
                  id="title" 
                  value={newVideo.title} 
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  value={newVideo.description} 
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Fonte</Label>
                <Select 
                  value={newVideo.source} 
                  onValueChange={(value: VideoSource) => setNewVideo({...newVideo, source: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL do Vídeo</Label>
                <Input 
                  id="url" 
                  value={newVideo.url} 
                  onChange={(e) => setNewVideo({...newVideo, url: e.target.value})} 
                  placeholder={newVideo.source === "youtube" ? "https://www.youtube.com/watch?v=..." : 
                                newVideo.source === "vimeo" ? "https://vimeo.com/..." : 
                                "URL ou caminho para o vídeo"}
                />
              </div>
              {newVideo.source === "storage" && (
                <div className="grid gap-2">
                  <Label htmlFor="file">Arquivo de Vídeo</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para fazer upload</span> ou arraste e solte</p>
                        <p className="text-xs text-gray-500">MP4, WebM (MAX. 500MB)</p>
                      </div>
                      <input id="video-upload" type="file" accept="video/*" className="hidden" />
                    </label>
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="thumbnail-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para fazer upload</span> ou arraste e solte</p>
                      <p className="text-xs text-gray-500">JPG, PNG (MAX. 2MB)</p>
                    </div>
                    <input id="thumbnail-upload" type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={newVideo.category} 
                  onValueChange={(value) => setNewVideo({...newVideo, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="learningPath">Trilha de Aprendizado</Label>
                <Select 
                  value={newVideo.learning_path} 
                  onValueChange={(value) => setNewVideo({...newVideo, learning_path: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma trilha" />
                  </SelectTrigger>
                  <SelectContent>
                    {learningPaths.map((path) => (
                      <SelectItem key={path.id} value={path.name}>{path.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duração (MM:SS)</Label>
                <Input 
                  id="duration" 
                  value={newVideo.duration} 
                  onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})} 
                  placeholder="Ex: 15:30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddVideo} 
                disabled={!newVideo.title || !newVideo.url || !newVideo.category || !newVideo.learning_path || addVideoMutation.isPending}
              >
                {addVideoMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Video Dialog */}
        {currentVideo && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Vídeo</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Título</Label>
                  <Input 
                    id="edit-title" 
                    value={currentVideo.title} 
                    onChange={(e) => setCurrentVideo({...currentVideo, title: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea 
                    id="edit-description" 
                    value={currentVideo.description} 
                    onChange={(e) => setCurrentVideo({...currentVideo, description: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-source">Fonte</Label>
                  <Select 
                    value={currentVideo.source} 
                    onValueChange={(value: VideoSource) => setCurrentVideo({...currentVideo, source: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-url">URL do Vídeo</Label>
                  <Input 
                    id="edit-url" 
                    value={currentVideo.url} 
                    onChange={(e) => setCurrentVideo({...currentVideo, url: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select 
                    value={currentVideo.category} 
                    onValueChange={(value) => setCurrentVideo({...currentVideo, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-learningPath">Trilha de Aprendizado</Label>
                  <Select 
                    value={currentVideo.learning_path} 
                    onValueChange={(value) => setCurrentVideo({...currentVideo, learning_path: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma trilha" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningPaths.map((path) => (
                        <SelectItem key={path.id} value={path.name}>{path.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duração (MM:SS)</Label>
                  <Input 
                    id="edit-duration" 
                    value={currentVideo.duration} 
                    onChange={(e) => setCurrentVideo({...currentVideo, duration: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={handleUpdateVideo} 
                  disabled={updateVideoMutation.isPending}
                >
                  {updateVideoMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Erro ao carregar vídeos: {(error as Error).message}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-[250px]">Título</TableHead>
                    <TableHead className="hidden md:table-cell">Fonte</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                    <TableHead className="hidden md:table-cell">Trilha</TableHead>
                    <TableHead className="hidden md:table-cell">Duração</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Visualizações</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhum vídeo encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos.map((video, index) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{video.title}</div>
                          <div className="text-sm text-gray-500 md:hidden">{video.category} • {video.learning_path}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getSourceBadge(video.source)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{video.category}</TableCell>
                        <TableCell className="hidden md:table-cell">{video.learning_path}</TableCell>
                        <TableCell className="hidden md:table-cell">{video.duration}</TableCell>
                        <TableCell className="hidden md:table-cell text-right">{video.views}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(video.url, '_blank')}>
                              <ExternalLink size={16} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditVideo(video)}>
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-red-500" 
                              onClick={() => handleDeleteVideo(video.id)}
                              disabled={deleteVideoMutation.isPending && deleteVideoMutation.variables === video.id}
                            >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVideos;
