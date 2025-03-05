import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Heart, Share2, MoreVertical, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes: number;
  comments: number;
  user_has_liked?: boolean;
  user?: UserProfile;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  cnpj: string;
  phone: string;
  cpf: string;
  updated_at: string;
  role: 'user' | 'admin';
  avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  user?: UserProfile;
}

const CommunityPosts = () => {
  const [newPostContent, setNewPostContent] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
      
      return data;
    }
  });

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return [];
      }
      
      // Get posts with user info
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
      
      // For each post, check if the current user has liked it
      const postsWithLikeStatus = await Promise.all(
        posts.map(async (post) => {
          const { data: likeData, error: likeError } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (likeError) {
            console.error('Error checking like status:', likeError);
          }
          
          return {
            ...post,
            user_has_liked: !!likeData
          };
        })
      );
      
      return postsWithLikeStatus;
    }
  });

  // Fetch comments for a specific post
  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id (*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    return data;
  };

  // Get comments for expanded post
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['post-comments', expandedPost],
    queryFn: () => fetchComments(expandedPost!),
    enabled: !!expandedPost
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            content,
            user_id: session.user.id,
            likes: 0,
            comments: 0
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Post criado",
        description: "Seu post foi publicado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string, isLiked: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      if (isLiked) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session.user.id);
        
        if (unlikeError) {
          throw unlikeError;
        }
        
        // Decrement likes count
        const { error: updateError } = await supabase
          .rpc('decrement_post_likes', { post_id: postId });
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert([
            {
              post_id: postId,
              user_id: session.user.id
            }
          ]);
        
        if (likeError) {
          throw likeError;
        }
        
        // Increment likes count
        const { error: updateError } = await supabase
          .rpc('increment_post_likes', { post_id: postId });
        
        if (updateError) {
          throw updateError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      console.error('Error liking/unliking post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string, content: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            post_id: postId,
            user_id: session.user.id
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Increment comments count
      const { error: updateError } = await supabase
        .rpc('increment_post_comments', { post_id: postId });
      
      if (updateError) {
        throw updateError;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      setCommentContent(prev => ({ ...prev, [variables.postId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Post excluído",
        description: "Seu post foi excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Handle post submission
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      createPostMutation.mutate(newPostContent);
    }
  };

  // Handle like/unlike
  const handleLike = (postId: string, isLiked: boolean) => {
    likePostMutation.mutate({ postId, isLiked });
  };

  // Handle comment submission
  const handleSubmitComment = (postId: string) => {
    const content = commentContent[postId];
    if (content && content.trim()) {
      createCommentMutation.mutate({ postId, content });
    }
  };

  // Handle post deletion
  const handleDeletePost = (postId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Create post card */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser?.avatar_url} />
                <AvatarFallback>
                  {currentUser ? getInitials(currentUser.first_name, currentUser.last_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Compartilhe algo com a comunidade..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="flex-1 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newPostContent.trim() || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts list */}
      {postsLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post: Post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="pt-6">
                {/* Post header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.user?.avatar_url} />
                      <AvatarFallback>
                        {post.user ? getInitials(post.user.first_name, post.user.last_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {post.user?.first_name} {post.user?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Post actions dropdown */}
                  {currentUser?.id === post.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {/* Post content */}
                <div className="mb-4">
                  <p className="whitespace-pre-line">{post.content}</p>
                </div>
                
                {/* Post stats */}
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{post.likes} curtidas</span>
                  </div>
                  <div className="mx-2">•</div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{post.comments} comentários</span>
                  </div>
                </div>
                
                {/* Post actions */}
                <div className="flex border-t border-b py-2 mb-4">
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => handleLike(post.id, !!post.user_has_liked)}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${post.user_has_liked ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                    Curtir
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comentar
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
                
                {/* Comments section */}
                {expandedPost === post.id && (
                  <div className="space-y-4">
                    {/* Comment input */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser?.avatar_url} />
                        <AvatarFallback>
                          {currentUser ? getInitials(currentUser.first_name, currentUser.last_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="Escreva um comentário..."
                          value={commentContent[post.id] || ''}
                          onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 resize-none min-h-[40px]"
                        />
                        <Button 
                          size="icon" 
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!commentContent[post.id]?.trim() || createCommentMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Comments list */}
                    {commentsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    ) : comments && comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment: Comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.user?.avatar_url} />
                              <AvatarFallback>
                                {comment.user ? getInitials(comment.user.first_name, comment.user.last_name) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="font-semibold text-sm">
                                  {comment.user?.first_name} {comment.user?.last_name}
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(comment.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Nenhum comentário ainda. Seja o primeiro a comentar!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">Nenhum post encontrado. Seja o primeiro a compartilhar algo!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;
