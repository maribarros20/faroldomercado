import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Post, Channel, Comment, Profile } from "@/types/community";
import { MoreHorizontal, Heart, MessageSquare, HeartOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from('posts')
        .select('*, user:profiles(id, first_name, last_name, email, photo, role, username, phone, cpf, cnpj, date_of_birth)')
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
      
      setPosts(data as Post[]);
    };
    
    fetchPosts();
  }, [channelId]);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      
      setUser(data as Profile);
    };
    
    fetchUser();
  }, [userId]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const { data: existingLike, error: existingLikeError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();
    
    if (existingLikeError && existingLikeError.code !== '404') {
      console.error('Error checking existing like:', existingLikeError);
      toast({
        title: "Erro ao curtir publicação",
        description: "Não foi possível curtir a publicação. Tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('post_likes')
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
        .from('post_likes')
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
  };

  // Ensure the new post includes a properly typed user object
  const handleCreatePost = async (values: { title: string; content: string }) => {
    if (!user) return;
    
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        title: values.title,
        content: values.content,
        channel_id: channelId,
        user_id: user.id
      })
      .select('*, user:profiles(id, first_name, last_name, email, photo, role, username, phone, cpf, cnpj, date_of_birth)')
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
      setPosts((prevPosts) => [postData as Post, ...prevPosts]);
      setShowCreateDialog(false);
    }
  };

  // Fix comment user handling
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
    
    const { data: commentData, error: commentError } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        content: commentContent,
        user_id: user?.id
      })
      .select('*, user:profiles(id, first_name, last_name, email, photo, role, username, phone, cpf, cnpj, date_of_birth)')
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
    
    // Update the post with the new comment
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const comments = post.comments || [];
        return {
          ...post,
          comments: [...comments, commentData as Comment],
          comments_count: (post.comments_count || 0) + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts as Post[]);
    setCommentContent('');
    setActiveCommentPostId(null);
  }

  return (
    <div>
      {/* Create Post Button */}
      <Button onClick={() => setShowCreateDialog(true)} className="mb-4">
        Criar Publicação
      </Button>

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={post.user?.photo || "https://avatar.vercel.sh/api/placeholder.svg"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
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
                <span>{post.likes_count}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveCommentPostId(post.id)}>
                <MessageSquare className="h-5 w-5" />
                <span>{post.comments_count}</span>
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          {activeCommentPostId === post.id && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={user?.photo || "https://avatar.vercel.sh/api/placeholder.svg"}
                  alt="User Avatar"
                  className="w-6 h-6 rounded-full"
                />
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
              {post.comments && post.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-100 rounded-lg p-2 mb-2">
                  <div className="flex items-start space-x-2">
                    <img
                      src={comment.user?.photo || "https://avatar.vercel.sh/api/placeholder.svg"}
                      alt="User Avatar"
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{comment.user?.first_name} {comment.user?.last_name}</div>
                      <div className="text-gray-700">{comment.content}</div>
                      <div className="text-gray-500 text-sm">{new Date(comment.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

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
