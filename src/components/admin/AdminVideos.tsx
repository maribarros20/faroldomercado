
import { useState } from "react";
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
  ArrowUpDown,
  ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

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
  learningPath: string;
  duration: string;
  dateAdded: string;
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

const sampleVideos: Video[] = [
  {
    id: "1",
    title: "Introdução ao Day Trading",
    description: "Aprenda os conceitos básicos do day trading e como começar",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=example1",
    thumbnail: "https://via.placeholder.com/300x200",
    category: "Day Trade",
    learningPath: "Iniciantes",
    duration: "15:30",
    dateAdded: "2023-10-15",
    views: 1250
  },
  {
    id: "2",
    title: "Análise de Candlesticks",
    description: "Guia completo sobre padrões de candlestick",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=example2",
    thumbnail: "https://via.placeholder.com/300x200",
    category: "Análise Técnica",
    learningPath: "Iniciantes",
    duration: "23:45",
    dateAdded: "2023-09-20",
    views: 875
  },
  {
    id: "3",
    title: "Estratégias de Swing Trading",
    description: "As melhores estratégias para swing trading no mercado atual",
    source: "vimeo",
    url: "https://vimeo.com/example3",
    thumbnail: "https://via.placeholder.com/300x200",
    category: "Swing Trade",
    learningPath: "Estratégias Avançadas",
    duration: "42:10",
    dateAdded: "2023-11-05",
    views: 632
  },
  {
    id: "4",
    title: "Gerenciamento de Risco Avançado",
    description: "Técnicas avançadas para gerenciar seu risco no trading",
    source: "storage",
    url: "https://storage.example.com/video4.mp4",
    thumbnail: "https://via.placeholder.com/300x200",
    category: "Gerenciamento de Risco",
    learningPath: "Estratégias Avançadas",
    duration: "35:20",
    dateAdded: "2023-12-01",
    views: 410
  }
];

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>(sampleVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    source: "youtube" as VideoSource,
    url: "",
    category: "",
    learningPath: "",
    duration: ""
  });
  const { toast } = useToast();

  const handleAddVideo = () => {
    const video: Video = {
      id: (videos.length + 1).toString(),
      title: newVideo.title,
      description: newVideo.description,
      source: newVideo.source,
      url: newVideo.url,
      thumbnail: "https://via.placeholder.com/300x200", // Placeholder thumbnail
      category: newVideo.category,
      learningPath: newVideo.learningPath,
      duration: newVideo.duration,
      dateAdded: new Date().toISOString().split("T")[0],
      views: 0
    };

    setVideos([...videos, video]);
    setIsAddDialogOpen(false);
    setNewVideo({
      title: "",
      description: "",
      source: "youtube",
      url: "",
      category: "",
      learningPath: "",
      duration: ""
    });

    toast({
      title: "Vídeo adicionado",
      description: "O vídeo foi adicionado com sucesso!",
      variant: "default",
    });
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter(video => video.id !== id));
    
    toast({
      title: "Vídeo removido",
      description: "O vídeo foi removido com sucesso!",
      variant: "default",
    });
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.learningPath.toLowerCase().includes(searchQuery.toLowerCase())
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
                  value={newVideo.learningPath} 
                  onValueChange={(value) => setNewVideo({...newVideo, learningPath: value})}
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
                disabled={!newVideo.title || !newVideo.url || !newVideo.category || !newVideo.learningPath}
              >
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                        <div className="text-sm text-gray-500 md:hidden">{video.category} • {video.learningPath}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getSourceBadge(video.source)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{video.category}</TableCell>
                      <TableCell className="hidden md:table-cell">{video.learningPath}</TableCell>
                      <TableCell className="hidden md:table-cell">{video.duration}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">{video.views}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(video.url, '_blank')}>
                            <ExternalLink size={16} />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit size={16} />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteVideo(video.id)}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVideos;
