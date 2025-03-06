
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Post, Comment, Profile } from "@/types/community";
import { MoreHorizontal, Heart, MessageSquare, HeartOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CommunityPostsProps {
  channelId: string;
  userId: string;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId, userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            *,
            user:profiles(id, first_name, last_name, email, photo, role, username, phone, cpf, date_of_birth)
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: false });
      
        if (error) {
          console.error('Error fetching posts:', error);
          toast({
            title: "Erro ao carregar publicações",
            description: "Não foi possível carregar as publicações. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      
        // Check if user has liked each post
        if (data && data.length > 0) {
          const postsWithLikes = await Promise.all(
            data.map(async (post) => {
              const { data: likeData, error: likeError } = await supabase
                .from('user_likes')
                .select('*')
                .eq('post_id', post.id)
                .eq('user_id', userId)
                .maybeSingle();
              
              return {
                ...post,
                user_has_liked: !!likeData
              };
            })
          );
          setPosts(postsWithLikes as Post[]);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error in fetchPosts:', error);
      }
    };
    
    if (channelId) {
      fetchPosts();
    }
  }, [channelId, userId, toast]);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      
      if (data) {
        setUser(data as Profile);
      }
    };
    
    fetchUser();
  }, [userId]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      const { data: existingLike, error: existingLikeError } = await supabase
        .from('user_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
    
      if (existingLikeError && existingLikeError.code !== 'PGRST116') {
        console.error('Error checking existing like:', existingLikeError);
        toast({
          title: "Erro ao verificar curtida",
          description: "Não foi possível verificar se você já curtiu esta publicação.",
          variant: "destructive"
        });
        return;
      }
    
      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('user_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      
        if (deleteError) {
          console.error('Error unliking post:', deleteError);
          toast({
            title: "Erro ao descurtir publicação",
            description: "Não foi possível descurtir a publicação. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      
        // Update the local state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likes_count: post.likes_count - 1, user_has_liked: false }
              : post
          )
        );
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('user_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      
        if (insertError) {
          console.error('Error liking post:', insertError);
          toast({
            title: "Erro ao curtir publicação",
            description: "Não foi possível curtir a publicação. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      
        // Update the local state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likes_count: post.likes_count + 1, user_has_liked: true }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
    }
  };

  const handleCreatePost = async (values: { title: string; content: string }) => {
    if (!user) return;
    
    try {
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .insert({
          title: values.title,
          content: values.content,
          channel_id: channelId,
          user_id: user.id
        })
        .select()
        .single();
    
      if (postError) {
        console.error('Error creating post:', postError);
        toast({
          title: "Erro ao criar publicação",
          description: "Não foi possível criar a publicação. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
    
      if (postData) {
        // Fetch the user data for the new post
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, photo, role, username, phone, cpf, date_of_birth')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user data for new post:', userError);
        }
        
        const newPost: Post = {
          ...postData,
          user: userData as Profile,
          comments_count: 0,
          likes_count: 0,
          user_has_liked: false
        };
        
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Error in handleCreatePost:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) return;
    
    if (!commentContent.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, insira um comentário.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: commentData, error: commentError } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          content: commentContent,
          user_id: user.id
        })
        .select()
        .single();
    
      if (commentError) {
        console.error('Error adding comment:', commentError);
        toast({
          title: "Erro ao adicionar comentário",
          description: "Não foi possível adicionar o comentário. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
    
      // Get user data for the comment
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, photo, role, username, phone, cpf, date_of_birth')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data for comment:', userError);
      }
      
      const newComment: Comment = {
        ...commentData,
        user: userData as Profile,
        user_has_liked: false
      };
      
      // Update the post with the new comment
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const comments = post.comments || [];
          return {
            ...post,
            comments: [...comments, newComment],
            comments_count: (post.comments_count || 0) + 1
          };
        }
        return post;
      });
    
      setPosts(updatedPosts);
      setCommentContent('');
      setActiveCommentPostId(null);
    } catch (error) {
      console.error('Error in handleAddComment:', error);
    }
  };

  return (
    <div>
      {/* Create Post Button */}
      <Button onClick={() => setShowCreateDialog(true)} className="mb-4">
        Criar Publicação
      </Button>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma publicação encontrada. Seja o primeiro a criar uma!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.user?.photo || ""} alt={`${post.user?.first_name} ${post.user?.last_name}`} />
                  <AvatarFallback>{post.user?.first_name?.[0]}{post.user?.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{post.user?.first_name} {post.user?.last_name}</div>
                  <div className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Deletar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h2 className="text-xl font-bold mt-2">{post.title}</h2>
            <p className="text-gray-700 mt-1">{post.content}</p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                  {post.user_has_liked ? (
                    <Heart className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartOff className="h-5 w-5" />
                  )}
                  <span className="ml-1">{post.likes_count}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}>
                  <MessageSquare className="h-5 w-5" />
                  <span className="ml-1">{post.comments_count}</span>
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {activeCommentPostId === post.id && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar>
                    <AvatarImage src={user?.photo || ""} alt={`${user?.first_name} ${user?.last_name}`} />
                    <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Input
                    type="text"
                    placeholder="Adicionar um comentário..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleAddComment(post.id)}>
                    Enviar
                  </Button>
                </div>

                {/* Load comments when needed */}
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-100 rounded-lg p-2 mb-2">
                      <div className="flex items-start space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={comment.user?.photo || ""} alt={`${comment.user?.first_name} ${comment.user?.last_name}`} />
                          <AvatarFallback>{comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">{comment.user?.first_name} {comment.user?.last_name}</div>
                          <div className="text-gray-700 text-sm">{comment.content}</div>
                          <div className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-2 text-gray-500 text-sm">
                    Seja o primeiro a comentar!
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Publicação</DialogTitle>
            <DialogDescription>
              Compartilhe algo com a comunidade!
            </DialogDescription>
          </DialogHeader>
          <CreatePostForm onSubmit={handleCreatePost} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CreatePostFormProps {
  onSubmit: (values: { title: string; content: string }) => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Publicar</Button>
    </form>
  );
};

export default CommunityPosts;
