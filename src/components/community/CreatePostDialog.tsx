import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  onPostCreated?: () => void; // Make this prop optional
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ 
  open, 
  onOpenChange,
  channelId,
  onPostCreated
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      // Input validation
      if (!title.trim()) {
        throw new Error("O título não pode estar vazio.");
      }
      
      if (!content.trim()) {
        throw new Error("O conteúdo não pode estar vazio.");
      }
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado.");
      }
      
      // Create post
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          channel_id: channelId,
          user_id: session.user.id,
          title: title.trim(),
          content: content.trim()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }
      
      // Log activity
      await supabase.from('user_activities').insert({
        user_id: session.user.id,
        activity_type: 'comment',
        content_id: data.id,
        metadata: { channel_id: channelId, is_post: true }
      });
      
      return data;
    },
    onSuccess: () => {
      // Reset form
      setTitle('');
      setContent('');
      
      // Close dialog
      onOpenChange(false);
      
      // Invalidate and refetch posts query
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      
      // Show success toast
      toast({
        title: "Post criado com sucesso",
        description: "Seu post foi publicado no canal.",
      });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({
        title: "Erro ao criar post",
        description: error instanceof Error ? error.message : "Não foi possível criar o post. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      createPostMutation.mutate();
      
      if (props.onPostCreated) {
        props.onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erro ao criar post",
        description: error instanceof Error ? error.message : "Não foi possível criar o post. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar nova postagem</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da sua postagem"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Conteúdo
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sua mensagem aqui..."
                className="min-h-[150px]"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending || !title.trim() || !content.trim()}
            >
              {createPostMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Publicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
