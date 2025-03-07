
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video as VideoType, VideoSource } from "@/services/VideosService";
import { MaterialCategory, KnowledgeNavigation, MaterialFormat, MaterialTheme } from "@/services/materials/types";
import { useToast } from "@/components/ui/use-toast";

interface EditVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (videoData: VideoType) => void;
  video: VideoType;
  categories: MaterialCategory[];
  navigations: KnowledgeNavigation[];
  formats: MaterialFormat[];
  themes: MaterialTheme[];
  learningPaths: { id: string; name: string }[];
}

const EditVideoDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  video,
  categories,
  navigations,
  formats,
  themes
}: EditVideoDialogProps) => {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoType>(video);
  const { toast } = useToast();

  useEffect(() => {
    if (video && isOpen) {
      setCurrentVideo(video);
      setSelectedThemes(video.themes ? video.themes.map(theme => theme.id) : []);
    }
  }, [video, isOpen]);

  const handleEditThemeChange = (selectedIds: string[]) => {
    setSelectedThemes(selectedIds);
    const selectedThemeObjects = themes.filter(theme => 
      selectedIds.includes(theme.id)
    );
    setCurrentVideo({
      ...currentVideo,
      themes: selectedThemeObjects
    });
  };

  const handleSubmit = () => {
    if (!currentVideo.title || !currentVideo.url || !currentVideo.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      onSubmit(currentVideo);
    } catch (error) {
      console.error("Erro ao atualizar vídeo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o vídeo",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Vídeo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Título <span className="text-red-500">*</span></Label>
            <Input 
              id="edit-title" 
              value={currentVideo.title} 
              onChange={(e) => setCurrentVideo({...currentVideo, title: e.target.value})} 
              required
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
            <Label htmlFor="edit-source">Fonte <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="edit-url">URL do Vídeo <span className="text-red-500">*</span></Label>
            <Input 
              id="edit-url" 
              value={currentVideo.url} 
              onChange={(e) => setCurrentVideo({...currentVideo, url: e.target.value})} 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-category">Categoria <span className="text-red-500">*</span></Label>
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
              value={currentVideo.navigation_id || "none"} 
              onValueChange={(value) => setCurrentVideo({...currentVideo, navigation_id: value === "none" ? null : value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma navegação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {navigations.map((navigation) => (
                  <SelectItem key={navigation.id} value={navigation.id}>{navigation.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-format">Formato</Label>
            <Select 
              value={currentVideo.format_id || "none"} 
              onValueChange={(value) => setCurrentVideo({...currentVideo, format_id: value === "none" ? null : value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!currentVideo.title || !currentVideo.url || !currentVideo.category}
          >
            Atualizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVideoDialog;
