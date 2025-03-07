
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { Video as VideoType, VideoSource } from "@/services/VideosService";
import { MaterialCategory, KnowledgeNavigation, MaterialFormat, MaterialTheme } from "@/services/materials/types";

interface AddVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (videoData: Omit<VideoType, 'id' | 'date_added' | 'views'>) => void;
  categories: MaterialCategory[];
  navigations: KnowledgeNavigation[];
  formats: MaterialFormat[];
  themes: MaterialTheme[];
  learningPaths: { id: string; name: string }[];
}

const AddVideoDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  categories,
  navigations,
  formats,
  themes,
  learningPaths
}: AddVideoDialogProps) => {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
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

  const handleSubmit = () => {
    let thumbnail = "https://via.placeholder.com/300x200";
    
    if (newVideo.source === "youtube") {
      const youtubeIdMatch = newVideo.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeIdMatch && youtubeIdMatch[1]) {
        thumbnail = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/0.jpg`;
      }
    }
    
    onSubmit({
      ...newVideo,
      thumbnail
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!newVideo.title || !newVideo.url || !newVideo.category || !newVideo.learning_path}
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoDialog;
