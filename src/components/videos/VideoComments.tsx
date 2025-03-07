
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, User } from 'lucide-react';
import { VideoComment } from '@/services/videos/types';
import { getVideoComments, addVideoComment } from '@/services/videos/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VideoCommentsProps {
  videoId: string;
}

const VideoComments = ({ videoId }: VideoCommentsProps) => {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const fetchedComments = await getVideoComments(videoId);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          title: "Erro ao carregar comentários",
          description: "Não foi possível carregar os comentários deste vídeo.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      loadComments();
    }
  }, [videoId, toast]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const comment = await addVideoComment(videoId, newComment);
      if (comment) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        toast({
          title: "Comentário adicionado",
          description: "Seu comentário foi publicado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar seu comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comentários</h2>
      
      {/* Comment Input */}
      <div className="mb-6">
        <Textarea
          placeholder="Adicione um comentário..."
          className="w-full p-3 mb-2"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment} 
            disabled={!newComment.trim() || isSubmitting}
            className="flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Comentar
          </Button>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center py-4 text-gray-500">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-center py-4 text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  {comment.user_avatar ? (
                    <AvatarImage src={comment.user_avatar} alt={comment.user_name} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{comment.user_name}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      <Heart className="w-4 h-4" />
                      {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoComments;
