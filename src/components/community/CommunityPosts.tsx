import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ThumbsUp, MessageSquare, Send, AlertCircle, Loader2 } from "lucide-react";
import CreatePostDialog from "./CreatePostDialog";
import { Post, Comment, Profile } from "@/types/community";

interface CommunityPostsProps {
  channelId: string;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId }) => {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [activePost, setActivePost] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, photo, role, username')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id
  });

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, is_active, is_canceled, expires_at')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }
      
      if (data) {
        const now = new Date();
        const expiryDate = new Date(data.expires_at);
        const isExpired = now > expiryDate;
        
        if (isExpired || data.is_canceled) {
          return { ...data, isValid: false };
        }
        
        return { ...data, isValid: true };
      }
      
      return null;
    },
    enabled: !!session?.user?.id
  });

  const { 
    data: posts = [], 
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['channel-posts', channelId],
    queryFn: async () => {
      try {
        if (subscription && !subscription.isValid) {
          throw new Error("Subscription expired or canceled");
        }
        
        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            *,
            user:user_id (id, first_name, last_name, email, photo, role, username)
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (session?.user?.id) {
          const { data: userLikes, error: likesError } = await supabase
            .from('user_likes')
            .select('post_id')
            .eq('user_id', session.user.id)
            .is('comment_id', null);
            
          if (likesError) throw likesError;
          
          return data.map((post: any) => ({
            ...post,
            user: post.user,
            user_has_liked: userLikes?.some((like: any) => like.post_id === post.id) || false
          })) as Post[];
        }
        
        return data as Post[];
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
    },
    enabled: !!channelId && (subscription?.isValid !== false)
  });

  const fetchComments = async (postId: string) => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para ver os comentários.",
        variant: "destructive"
      });
      return [];
    }
    
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:user_id (id, first_name, last_name, email, photo, role, username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (session?.user?.id) {
        const { data: userLikes, error: likesError } = await supabase
          .from('user_likes')
          .select('comment_id')
          .eq('user_id', session.user.id)
          .is('post_id', null);
          
        if (likesError) throw likesError;
        
        return data.map((comment: any) => ({
          ...comment,
          user: comment.user,
          user_has_liked: userLikes?.some((like: any) => like.comment_id === comment.id) || false
        })) as Comment[];
      }
      
      return data as Comment[];
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários deste post.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('user_likes')
        .insert({
          user_id: session.user.id,
          post_id: postId
        });
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
    },
    onError: (error) => {
      console.error("Error liking post:", error);
      toast({
        title: "Erro ao curtir post",
        description: "Não foi possível curtir o post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', session.user.id)
        .eq('post_id', postId);
        
      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
    },
    onError: (error) => {
      console.error("Error unliking post:", error);
      toast({
        title: "Erro ao descurtir post",
        description: "Não foi possível descurtir o post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string, content: string }) => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          user_id: session.user.id,
          post_id: postId,
          content
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      setNewComment("");
      
      fetchComments(variables.postId).then(comments => {
        queryClient.setQueryData(['post-comments', variables.postId], comments);
      });
      
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleLikePost = (post: Post) => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir posts.",
        variant: "destructive"
      });
      return;
    }
    
    if (post.user_has_liked) {
      unlikePostMutation.mutate(post.id);
    } else {
      likePostMutation.mutate(post.id);
    }
  };

  const handleViewComments = async (postId: string) => {
    setActivePost(activePost === postId ? null : postId);
    
    if (activePost !== postId) {
      const comments = await fetchComments(postId);
      queryClient.setQueryData(['post-comments', postId], comments);
    }
  };

  const handleSubmitComment = (postId: string) => {
    if (!newComment.trim()) return;
    
    createCommentMutation.mutate({
      postId,
      content: newComment.trim()
    });
  };

  const handleRefresh = () => {
    refetchPosts();
  };

  if (subscription && !subscription.isValid) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assinatura inativa</h3>
          <p className="text-center text-muted-foreground mb-4">
            Sua assinatura está inativa, expirada ou foi cancelada. 
            Para acessar a comunidade, por favor, renove ou reative sua assinatura.
          </p>
          <Button onClick={() => window.location.href = "/plans"}>
            Ver planos disponíveis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Postagens</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={postsLoading}
              >
                {postsLoading ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  "Atualizar"
                }
              </Button>
              <Button 
                size="sm"
                onClick={() => setCreatePostOpen(true)}
              >
                Nova postagem
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {postsLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando postagens...</span>
          </CardContent>
        </Card>
      ) : postsError ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <span>Erro ao carregar postagens. Tente novamente.</span>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col justify-center items-center p-8">
            <p className="text-muted-foreground mb-4">Nenhuma postagem neste canal.</p>
            <Button onClick={() => setCreatePostOpen(true)}>
              Criar primeira postagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const comments = queryClient.getQueryData<Comment[]>(['post-comments', post.id]) || [];
            
            return (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.user?.photo || ''} alt={post.user?.first_name} />
                        <AvatarFallback>
                          {post.user?.first_name?.[0]}{post.user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {post.user?.first_name} {post.user?.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(post.created_at), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                        <h4 className="font-medium mt-2">{post.title}</h4>
                        <p className="mt-1 text-base">{post.content}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 flex justify-between items-center">
                    <div className="flex gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleLikePost(post)}
                      >
                        <ThumbsUp className={`h-4 w-4 ${post.user_has_liked ? 'fill-primary' : ''}`} />
                        <span>{post.likes_count}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleViewComments(post.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                      </Button>
                    </div>
                  </div>
                  
                  {activePost === post.id && (
                    <div className="border-t">
                      <div className="p-4">
                        <h4 className="font-medium mb-3">Comentários</h4>
                        
                        {loadingComments[post.id] ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : comments.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            Nenhum comentário ainda. Seja o primeiro a comentar!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.user?.photo || ''} alt={comment.user?.first_name} />
                                  <AvatarFallback>
                                    {comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-muted p-3 rounded-md">
                                    <div className="flex justify-between items-start">
                                      <h5 className="font-medium text-sm">
                                        {comment.user?.first_name} {comment.user?.last_name}
                                      </h5>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm")}
                                      </span>
                                    </div>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center mt-1 ml-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 px-2"
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      <span className="text-xs">{comment.likes_count}</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {session && (
                          <div className="mt-4 flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userProfile?.photo || ''} alt={userProfile?.first_name} />
                              <AvatarFallback>
                                {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Textarea 
                                placeholder="Escreva um comentário..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-0"
                                rows={1}
                              />
                              <Button 
                                size="sm"
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!newComment.trim() || createCommentMutation.isPending}
                              >
                                {createCommentMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <CreatePostDialog 
        open={createPostOpen} 
        onOpenChange={setCreatePostOpen}
        channelId={channelId}
        onPostCreated={handleRefresh}
      />
    </>
  );
};

export default CommunityPosts;
