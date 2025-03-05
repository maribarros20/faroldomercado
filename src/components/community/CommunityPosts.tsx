
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { HeartIcon, MessageCircle, MoreVertical, Send, Trash2, Edit } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  channel_id: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  likes_count: number;
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
}

interface CommunityPostsProps {
  channelId: string | null;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId }) => {
  const [newPostContent, setNewPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [openedPostId, setOpenedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Reset states when channel changes
    setOpenedPostId(null);
    setNewPostContent("");
    setPostTitle("");
    setEditingPost(null);
    setEditingComment(null);
  }, [channelId]);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch posts for the selected channel
  const { 
    data: posts, 
    isLoading: postsLoading,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['channel-posts', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      // Fetch posts with user info
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For each post, check if the current user has liked it
      const postsWithLikeStatus = await Promise.all(
        postsData.map(async (post) => {
          const { data: likeData, error: likeError } = await supabase
            .from('user_likes')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('post_id', post.id)
            .maybeSingle();
          
          if (likeError) console.error("Error checking like status", likeError);
          
          return {
            ...post,
            is_liked: !!likeData
          };
        })
      );
      
      return postsWithLikeStatus as Post[];
    },
    enabled: !!channelId
  });

  // Fetch comments for an opened post
  const {
    data: comments,
    isLoading: commentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['post-comments', openedPostId],
    queryFn: async () => {
      if (!openedPostId) return [];
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      // Fetch comments with user info
      const { data: commentsData, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('post_id', openedPostId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // For each comment, check if the current user has liked it
      const commentsWithLikeStatus = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: likeData, error: likeError } = await supabase
            .from('user_likes')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('comment_id', comment.id)
            .maybeSingle();
          
          if (likeError) console.error("Error checking comment like status", likeError);
          
          return {
            ...comment,
            is_liked: !!likeData
          };
        })
      );
      
      return commentsWithLikeStatus as Comment[];
    },
    enabled: !!openedPostId
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!channelId) throw new Error("No channel selected");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title,
          content,
          channel_id: channelId,
          user_id: session.user.id
        })
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      setNewPostContent("");
      setPostTitle("");
      toast({
        title: "Post criado",
        description: "Seu post foi publicado com sucesso!"
      });
      
      // Log the activity
      logUserActivity('comment', { channel_id: channelId });
    },
    onError: (error: any) => {
      console.error("Error creating post:", error);
      toast({
        title: "Erro ao criar post",
        description: error.message || "Não foi possível criar seu post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from('community_posts')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      setEditingPost(null);
      toast({
        title: "Post atualizado",
        description: "Seu post foi atualizado com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error("Error updating post:", error);
      toast({
        title: "Erro ao atualizar post",
        description: error.message || "Não foi possível atualizar seu post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      if (openedPostId === postId) {
        setOpenedPostId(null);
      }
      toast({
        title: "Post removido",
        description: "Seu post foi removido com sucesso."
      });
    },
    onError: (error: any) => {
      console.error("Error deleting post:", error);
      toast({
        title: "Erro ao remover post",
        description: error.message || "Não foi possível remover seu post. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          content,
          user_id: session.user.id
        })
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', openedPostId] });
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      setNewComment("");
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso!"
      });
      
      // Log the activity
      logUserActivity('comment', { post_id: openedPostId });
    },
    onError: (error: any) => {
      console.error("Error creating comment:", error);
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message || "Não foi possível adicionar seu comentário. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from('post_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', openedPostId] });
      setEditingComment(null);
      toast({
        title: "Comentário atualizado",
        description: "Seu comentário foi atualizado com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error("Error updating comment:", error);
      toast({
        title: "Erro ao atualizar comentário",
        description: error.message || "Não foi possível atualizar seu comentário. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', openedPostId] });
      queryClient.invalidateQueries({ queryKey: ['channel-posts', channelId] });
      toast({
        title: "Comentário removido",
        description: "Seu comentário foi removido com sucesso."
      });
    },
    onError: (error: any) => {
      console.error("Error deleting comment:", error);
      toast({
        title: "Erro ao remover comentário",
        description: error.message || "Não foi possível remover seu comentário. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Toggle post like mutation
  const togglePostLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");
      
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', session.user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('user_likes')
          .insert({
            user_id: session.user.id,
            post_id: postId
          });
        
        if (error) throw error;
      }
      
      return { postId, liked: !isLiked };
    },
    onSuccess: ({ postId, liked }) => {
      // Optimistically update the UI
      queryClient.setQueryData(['channel-posts', channelId], (oldData: any) => {
        return oldData.map((post: Post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: liked ? post.likes_count + 1 : post.likes_count - 1,
              is_liked: liked
            };
          }
          return post;
        });
      });
    },
    onError: (error: any) => {
      console.error("Error toggling post like:", error);
      refetchPosts();
    }
  });

  // Toggle comment like mutation
  const toggleCommentLikeMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");
      
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', session.user.id)
          .eq('comment_id', commentId);
        
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('user_likes')
          .insert({
            user_id: session.user.id,
            comment_id: commentId
          });
        
        if (error) throw error;
      }
      
      return { commentId, liked: !isLiked };
    },
    onSuccess: ({ commentId, liked }) => {
      // Optimistically update the UI
      queryClient.setQueryData(['post-comments', openedPostId], (oldData: any) => {
        return oldData.map((comment: Comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: liked ? comment.likes_count + 1 : comment.likes_count - 1,
              is_liked: liked
            };
          }
          return comment;
        });
      });
    },
    onError: (error: any) => {
      console.error("Error toggling comment like:", error);
      refetchComments();
    }
  });

  // Function to log user activity
  const logUserActivity = async (activityType: string, metadata: any = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      await supabase.from('user_activities').insert({
        user_id: session.user.id,
        activity_type: activityType,
        metadata
      });
    } catch (error) {
      console.error("Error logging user activity:", error);
    }
  };

  // Handle post creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !postTitle.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios para criar um post.",
        variant: "destructive"
      });
      return;
    }
    
    createPostMutation.mutate({ 
      title: postTitle.trim(), 
      content: newPostContent.trim() 
    });
  };

  // Handle post update
  const handleUpdatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    
    if (!editingPost.content.trim() || !editingPost.title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios para atualizar um post.",
        variant: "destructive"
      });
      return;
    }
    
    updatePostMutation.mutate({
      id: editingPost.id,
      title: editingPost.title.trim(),
      content: editingPost.content.trim()
    });
  };

  // Handle comment creation
  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openedPostId) return;
    
    if (!newComment.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O comentário não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }
    
    createCommentMutation.mutate({
      postId: openedPostId,
      content: newComment.trim()
    });
  };

  // Handle comment update
  const handleUpdateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;
    
    if (!editingComment.content.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O comentário não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }
    
    updateCommentMutation.mutate({
      id: editingComment.id,
      content: editingComment.content.trim()
    });
  };

  // Handle opening a post to see comments
  const handleOpenPost = (postId: string) => {
    // If clicking on the same post, close it
    if (openedPostId === postId) {
      setOpenedPostId(null);
    } else {
      setOpenedPostId(postId);
      // Focus on comment input after a small delay to allow the comment section to render
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (firstName: string = "", lastName: string = "") => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  // Check if the user is the owner of a post/comment
  const isOwner = (userId: string) => {
    return currentUser && currentUser.id === userId;
  };

  // If no channel is selected
  if (!channelId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <h3 className="text-xl font-semibold mb-2">Selecione um canal</h3>
        <p className="text-gray-500">Escolha um canal para ver as discussões</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New post form */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h3 className="font-medium mb-3">Criar nova publicação</h3>
        <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-3">
          <input
            type="text"
            value={editingPost ? editingPost.title : postTitle}
            onChange={e => editingPost 
              ? setEditingPost({...editingPost, title: e.target.value}) 
              : setPostTitle(e.target.value)
            }
            placeholder="Título da publicação"
            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Textarea
            value={editingPost ? editingPost.content : newPostContent}
            onChange={e => editingPost 
              ? setEditingPost({...editingPost, content: e.target.value}) 
              : setNewPostContent(e.target.value)
            }
            placeholder="Em que você está pensando?"
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            {editingPost && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingPost(null)}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={
                editingPost 
                  ? !editingPost.content.trim() || !editingPost.title.trim() 
                  : !newPostContent.trim() || !postTitle.trim()
              }
            >
              {editingPost ? "Atualizar" : "Publicar"}
            </Button>
          </div>
        </form>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {postsLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border p-4 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))
        ) : posts && posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg border shadow-sm">
              {/* Post header */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.user?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(post.user?.first_name, post.user?.last_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{post.user?.first_name} {post.user?.last_name}</div>
                      <div className="text-xs text-gray-500">{formatDate(post.created_at)}</div>
                    </div>
                  </div>
                  
                  {isOwner(post.user_id) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => setEditingPost(post)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600"
                          onClick={() => deletePostMutation.mutate(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <h3 className="text-lg font-medium mt-3">{post.title}</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{post.content}</p>

                {/* Post actions */}
                <div className="flex items-center mt-4 pt-3 space-x-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 ${post.is_liked ? 'text-red-500' : ''}`}
                    onClick={() => togglePostLikeMutation.mutate({ postId: post.id, isLiked: !!post.is_liked })}
                  >
                    <HeartIcon className={`h-4 w-4 ${post.is_liked ? 'fill-red-500' : ''}`} />
                    <span>{post.likes_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleOpenPost(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                  </Button>
                </div>
              </div>
              
              {/* Comments section */}
              {openedPostId === post.id && (
                <div className="border-t bg-gray-50 p-4 space-y-4">
                  {/* Comments list */}
                  {commentsLoading ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, index) => (
                        <div key={index} className="flex space-x-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user?.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(comment.user?.first_name, comment.user?.last_name)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-sm">{comment.user?.first_name} {comment.user?.last_name}</span>
                                
                                {isOwner(comment.user_id) && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem 
                                        className="cursor-pointer text-xs"
                                        onClick={() => setEditingComment(comment)}
                                      >
                                        <Edit className="mr-2 h-3 w-3" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="cursor-pointer text-red-600 text-xs"
                                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                                      >
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              
                              {editingComment && editingComment.id === comment.id ? (
                                <form onSubmit={handleUpdateComment} className="mt-2">
                                  <Textarea
                                    value={editingComment.content}
                                    onChange={e => setEditingComment({...editingComment, content: e.target.value})}
                                    className="min-h-[60px] text-sm"
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setEditingComment(null)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      size="sm"
                                      disabled={!editingComment.content.trim()}
                                    >
                                      Salvar
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <p className="text-sm mt-1">{comment.content}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center mt-1 ml-1 space-x-4">
                              <button
                                className={`text-xs flex items-center gap-1 ${comment.is_liked ? 'text-red-500' : 'text-gray-500'}`}
                                onClick={() => toggleCommentLikeMutation.mutate({ 
                                  commentId: comment.id, 
                                  isLiked: !!comment.is_liked 
                                })}
                              >
                                <HeartIcon className={`h-3 w-3 ${comment.is_liked ? 'fill-red-500' : ''}`} />
                                <span>{comment.likes_count > 0 ? comment.likes_count : ''}</span>
                              </button>
                              <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    </div>
                  )}
                  
                  {/* New comment form */}
                  <Separator className="my-4" />
                  <form onSubmit={handleCreateComment} className="flex gap-3 items-start">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(currentUser?.first_name, currentUser?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-end gap-2">
                      <Textarea
                        ref={commentInputRef}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="min-h-[60px] flex-1"
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center">
            <h3 className="font-medium mb-2">Nenhuma publicação ainda</h3>
            <p className="text-gray-500 mb-4">Seja o primeiro a compartilhar algo neste canal!</p>
            <Badge variant="outline" className="mx-auto">Dica: Escreva uma publicação acima</Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPosts;
