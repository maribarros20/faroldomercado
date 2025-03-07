
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, ExternalLink, Youtube, Video, Tag, Bookmark } from "lucide-react";
import { Video as VideoType, VideoSource } from "@/services/VideosService";
import { KnowledgeNavigation } from "@/services/materials/types";

interface VideosListProps {
  videos: VideoType[];
  isLoading: boolean;
  error: Error | null;
  navigations: KnowledgeNavigation[];
  onEdit: (video: VideoType) => void;
  onDelete: (id: string) => void;
}

const VideosList = ({ 
  videos, 
  isLoading, 
  error, 
  navigations,
  onEdit, 
  onDelete 
}: VideosListProps) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Erro ao carregar vídeos: {error.message}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum vídeo encontrado</p>
      </div>
    );
  }

  return (
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
            <TableHead className="hidden md:table-cell">Duração</TableHead>
            <TableHead className="hidden md:table-cell text-right">Visualizações</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video, index) => (
            <TableRow key={video.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="font-medium">{video.title}</div>
                <div className="text-sm text-gray-500 md:hidden">{video.category}</div>
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
              <TableCell className="hidden md:table-cell">{video.duration}</TableCell>
              <TableCell className="hidden md:table-cell text-right">{video.views}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(video.url, '_blank')}>
                    <ExternalLink size={16} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(video)}>
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-red-500" 
                    onClick={() => onDelete(video.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VideosList;
