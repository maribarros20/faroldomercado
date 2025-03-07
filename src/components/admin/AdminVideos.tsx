
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
  ExternalLink,
  AlertTriangle,
  Check,
  Tag,
  Bookmark
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video as VideoType, VideoSource } from "@/services/VideosService";
import VideosService from "@/services/VideosService";
import MaterialsService from "@/services/MaterialsService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { 
  MaterialCategory, 
  KnowledgeNavigation, 
  MaterialFormat, 
  MaterialTheme 
} from "@/services/materials/types";

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
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    source: "youtube" as VideoSource,
    url: "",
    category: "",
    learning_path: "",
    duration: "",
    navigation_id: null as string | null,
    format_id: null as string | null,
    themes: [] as MaterialTheme[]
  });
  
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
      resetVideoForm();
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

  const resetVideoForm = () => {
    setNewVideo({
      title: "",
      description: "",
      source: "youtube",
      url: "",
      category: "",
      learning_path: "",
      duration: "",
      navigation_id: null,
      format_id: null,
      themes: []
    });
    setSelectedThemes([]);
  };

  const handleAddVideo = () => {
    let thumbnail = "https://via.placeholder.com/300x200";
    
    if (newVideo.source === "youtube") {
      const youtubeIdMatch = newVideo.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeIdMatch && youtubeIdMatch[1]) {
        thumbnail = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/0.jpg`;
      }
    }
    
    const videoData = {
      ...newVideo,
      thumbnail,
      themes: newVideo.themes
    };
    
    addVideoMutation.mutate(videoData);
  };

  const handleEditVideo = (video: VideoType) => {
    setCurrentVideo(video);
    setSelectedThemes(video.themes ? video.themes.map(theme => theme.id) : []);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVideo = () => {
    if (!currentVideo) return;
    updateVideoMutation.mutate(currentVideo);
    
    logAuditAction('videos', currentVideo.id, 'update');
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

  // Handle theme selection for new video
  const handleThemeChange = (selectedIds: string[]) => {
    setSelectedThemes(selectedIds);
    const selectedThemeObjects = themes.filter(theme => 
      selectedIds.includes(theme.id)
    );
    setNewVideo({
      ...newVideo,
      themes: selectedThemeObjects
    });
  };

  // Handle theme selection for editing
  const handleEditThemeChange = (selectedIds: string[]) => {
    setSelectedThemes(selectedIds);
    if (currentVideo) {
      const selectedThemeObjects = themes.filter(theme => 
        selectedIds.includes(theme.id)
      );
      setCurrentVideo({
        ...currentVideo,
        themes: selectedThemeObjects
      });
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

  // Get navigation name
  const getNavigationName = (id: string | null | undefined) => {
    if (!id) return "Não especificado";
    const navigation = navigations.find(nav => nav.id === id);
    return navigation ? navigation.name : "Não especificado";
  };

  // Get format name
  const getFormatName = (id: string | null | undefined) => {
    if (!id) return "Não especificado";
    const format = formats.find(fmt => fmt.id === id);
    return format ? format.name : "Não especificado";
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Gerenciamento de Vídeos</h2>
          <p className="text-sm text-gray-500">Adicione, edite ou remova vídeos educacionais</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetVideoForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-trade-blue hover:bg-trade-blue/90">
              <Plus size={16} className="mr-2" /> 
              Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="navigation">Navegação do Conhecimento</Label>
                <Select 
                  value={newVideo.navigation_id || ''} 
                  onValueChange={(value) => setNewVideo({...newVideo, navigation_id: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma navegação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {navigations.map((navigation) => (
                      <SelectItem key={navigation.id} value={navigation.id}>{navigation.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="format">Formato</Label>
                <Select 
                  value={newVideo.format_id || ''} 
                  onValueChange={(value) => setNewVideo({...newVideo, format_id: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {formats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>{format.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="themes">Temas/Assuntos (Hashtags)</Label>
                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {themes.map((theme) => (
                    <div key={theme.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id={`theme-${theme.id}`}
                        checked={selectedThemes.includes(theme.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleThemeChange([...selectedThemes, theme.id]);
                          } else {
                            handleThemeChange(selectedThemes.filter(id => id !== theme.id));
                          }
                        }}
                        className="h-4 w-4 rounded"
                      />
                      <label htmlFor={`theme-${theme.id}`} className="text-sm">{theme.name}</label>
                    </div>
                  ))}
                  {themes.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum tema cadastrado</p>
                  )}
                </div>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddVideo} 
                disabled={!newVideo.title || !newVideo.url || !newVideo.category || !newVideo.learning_path || addVideoMutation.isPending}
              >
                {addVideoMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {currentVideo && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="edit-navigation">Navegação do Conhecimento</Label>
                  <Select 
                    value={currentVideo.navigation_id || ''} 
                    onValueChange={(value) => setCurrentVideo({...currentVideo, navigation_id: value || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma navegação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {navigations.map((navigation) => (
                        <SelectItem key={navigation.id} value={navigation.id}>{navigation.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-format">Formato</Label>
                  <Select 
                    value={currentVideo.format_id || ''} 
                    onValueChange={(value) => setCurrentVideo({...currentVideo, format_id: value || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {formats.map((format) => (
                        <SelectItem key={format.id} value={format.id}>{format.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-themes">Temas/Assuntos (Hashtags)</Label>
                  <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto">
                    {themes.map((theme) => (
                      <div key={theme.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id={`edit-theme-${theme.id}`}
                          checked={selectedThemes.includes(theme.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleEditThemeChange([...selectedThemes, theme.id]);
                            } else {
                              handleEditThemeChange(selectedThemes.filter(id => id !== theme.id));
                            }
                          }}
                          className="h-4 w-4 rounded"
                        />
                        <label htmlFor={`edit-theme-${theme.id}`} className="text-sm">{theme.name}</label>
                      </div>
                    ))}
                    {themes.length === 0 && (
                      <p className="text-sm text-gray-500">Nenhum tema cadastrado</p>
                    )}
                  </div>
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={handleUpdateVideo} 
                  disabled={updateVideoMutation.isPending}
                >
                  {updateVideoMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
              </DialogFooter>
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
                    <TableHead className="hidden md:table-cell">Navegação</TableHead>
                    <TableHead className="hidden md:table-cell">Temas</TableHead>
                    <TableHead className="hidden md:table-cell">Trilha</TableHead>
                    <TableHead className="hidden md:table-cell">Duração</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Visualizações</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
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
                        <TableCell className="hidden md:table-cell">
                          {video.navigation_id ? 
                            <Badge variant="outline" className="bg-blue-50 border-blue-200">
                              <Bookmark size={12} className="mr-1" />
                              {getNavigationName(video.navigation_id)}
                            </Badge>
                            : 
                            "Não especificado"
                          }
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {video.themes && video.themes.length > 0 ? (
                              video.themes.slice(0, 2).map(theme => (
                                <Badge key={theme.id} variant="outline" className="bg-green-50 border-green-200">
                                  <Tag size={10} className="mr-1" />
                                  {theme.name}
                                </Badge>
                              ))
                            ) : (
                              "Não especificado"
                            )}
                            {video.themes && video.themes.length > 2 && (
                              <Badge variant="outline" className="bg-green-50 border-green-200">
                                +{video.themes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
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
                              onClick={() => handleDeleteClick(video.id)}
                              disabled={deleteVideoMutation.isPending && videoToDelete === video.id}
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
