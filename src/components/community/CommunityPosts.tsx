
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface CommunityPostsProps {
  channelId: string;
  onCreatePost: () => void;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId, onCreatePost }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  // Fetch channel info
  const { data: channelInfo } = useQuery({
    queryKey: ['channel-info', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq('id', channelId)
        .single();
      
      if (error) {
        console.error("Error fetching channel info:", error);
        throw error;
      }
      
      return data;
    }
  });

  // Fetch posts for the channel
  const { data: posts, isLoading } = useQuery({
    queryKey: ['channel-posts', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            company
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
      
      return data;
    }
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      return session.user;
    }
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      // First check if user already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', currentUser?.id)
        .eq('post_id', postId)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingLike) {
        // User already liked, so unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('id', existingLike.id);
          
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // User hasn't liked, so add like
        const { error } = await supabase
          .from('user_likes')
          .insert({
            user_id: currentUser?.id,
            post_id: postId
          });
          
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
    },
    onError: (error) => {
      console.error("Error with like action:", error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir a postagem.",
        variant: "destructive"
      });
    }
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string, content: string }) => {
      if (!content.trim()) {
        throw new Error("O comentário não pode estar vazio.");
      }
      
      const { error } = await supabase
        .from('post_comments')
        .insert({
          user_id: currentUser?.id,
          post_id: postId,
          content
        });
        
      if (error) throw error;
      
      // Also log this as an activity
      await supabase.from('user_activities').insert({
        user_id: currentUser?.id,
        activity_type: 'comment',
        content_id: postId,
        metadata: { channel_id: channelId }
      });
    },
    onSuccess: (_, variables) => {
      setNewComment({ ...newComment, [variables.postId]: '' });
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.postId] });
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível adicionar o comentário.",
        variant: "destructive"
      });
    }
  });

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
    
    return data;
  };

  // Toggle comments visibility
  const toggleComments = async (postId: string) => {
    // If not already showing, fetch comments
    if (!showComments[postId]) {
      try {
        await queryClient.fetchQuery({
          queryKey: ['post-comments', postId],
          queryFn: () => fetchComments(postId)
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os comentários.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Format initials for avatar
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return 'U';
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-trade-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Channel header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{channelInfo?.name}</h1>
          {channelInfo?.description && (
            <p className="text-gray-500 mt-1">{channelInfo.description}</p>
          )}
        </div>
        <Button onClick={onCreatePost}>Novo Post</Button>
      </div>

      {/* Posts list */}
      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              {/* Post header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-trade-blue text-white">
                      {getInitials(post.profiles?.first_name, post.profiles?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">
                      {post.profiles?.first_name} {post.profiles?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ description: "Link copiado para área de transferência" });
                    }}>
                      Copiar link
                    </DropdownMenuItem>
                    {post.user_id === currentUser?.id && (
                      <DropdownMenuItem className="text-red-600">
                        Excluir post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Post content */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{post.content}</p>
              </div>
              
              {/* Post actions */}
              <div className="px-4 py-3 border-t flex items-center gap-6">
                <button 
                  className="flex items-center gap-1.5 text-gray-500 hover:text-trade-blue transition-colors"
                  onClick={() => likeMutation.mutate({ postId: post.id })}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes_count} Curtidas</span>
                </button>
                
                <button 
                  className="flex items-center gap-1.5 text-gray-500 hover:text-trade-blue transition-colors"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments_count} Comentários</span>
                </button>
                
                <button 
                  className="flex items-center gap-1.5 text-gray-500 hover:text-trade-blue transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ description: "Link copiado para área de transferência" });
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar</span>
                </button>
              </div>
              
              {/* Comments section */}
              {showComments[post.id] && (
                <div className="border-t bg-gray-50">
                  {/* Comments list */}
                  <div className="p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">Comentários</h4>
                    
                    {/* Fetch and render comments */}
                    <CommentsSection postId={post.id} />
                    
                    {/* Add comment form */}
                    <div className="mt-4 flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-trade-blue text-white text-xs">
                          {currentUser && getInitials(currentUser.user_metadata?.first_name, currentUser.user_metadata?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Escreva um comentário..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                          className="min-h-[80px] bg-white"
                        />
                        <div className="mt-2 flex justify-end">
                          <Button 
                            onClick={() => commentMutation.mutate({ 
                              postId: post.id, 
                              content: newComment[post.id] || '' 
                            })}
                            disabled={!newComment[post.id]?.trim() || commentMutation.isPending}
                            size="sm"
                          >
                            {commentMutation.isPending && (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Comentar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg border shadow-sm">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum post ainda</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Seja o primeiro a iniciar uma conversa neste canal.
          </p>
          <Button onClick={onCreatePost}>Criar Primeiro Post</Button>
        </div>
      )}
    </div>
  );
};

// Comments section component
const CommentsSection: React.FC<{ postId: string }> = ({ postId }) => {
  const { data: comments, isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
      
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-trade-blue" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nenhum comentário. Seja o primeiro a comentar!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-trade-blue text-white text-xs">
              {comment.profiles?.first_name?.[0] || ''}
              {comment.profiles?.last_name?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900">
                  {comment.profiles?.first_name} {comment.profiles?.last_name}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(comment.created_at), "d MMM HH:mm", { locale: ptBR })}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
            <div className="flex gap-3 mt-1 ml-2">
              <button className="text-xs text-gray-500 hover:text-trade-blue">
                Curtir ({comment.likes_count})
              </button>
              <button className="text-xs text-gray-500 hover:text-trade-blue">
                Responder
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityPosts;
