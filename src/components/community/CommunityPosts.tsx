import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Post as PostType, Comment as CommentType, Profile } from '@/types/community';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageSquare, HeartOff } from 'lucide-react';

interface CommunityPostsProps {
  channelId: string;
  userId: string;
}

type Post = PostType & {
  user: Profile;
  comments?: CommentType[];
};

type Comment = CommentType & {
  user: Profile;
};

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId, userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [loadingLike, setLoadingLike] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<Profile | null>(null);

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
      } else {
        setPosts(data as Post[]);
      }
    };

    fetchPosts();
  }, [channelId, toast]);

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
      } else {
        setUser(data as Profile);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

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

  const handleLikePost = async (postId: string) => {
    setLoadingLike(true);
    try {
      const { data: existingLike, error: existingLikeError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
  
      if (existingLikeError && existingLikeError.status !== 404) {
        console.error('Error checking existing like:', existingLikeError);
        return;
      }
  
      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
  
        if (deleteError) {
          console.error('Error unliking post:', deleteError);
          return;
        }
  
        // Update likes count locally
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, likes_count: post.likes_count - 1, user_has_liked: false } : post
        ));
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });
  
        if (likeError) {
          console.error('Error liking post:', likeError);
          return;
        }
  
        // Update likes count locally
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, likes_count: post.likes_count + 1, user_has_liked: true } : post
        ));
      }
    } finally {
      setLoadingLike(false);
    }
  };

  const handleAddComment = async (postId: string) => {
  if (!commentContent.trim()) {
    toast({
      title: "Comentário vazio",
      description: "Por favor, insira um comentário.",
      variant: "destructive"
    });
    return;
  }
  
  if (!user) {
    toast({
      title: "Usuário não encontrado",
      description: "Por favor, faça login para comentar.",
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
      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Publicação</DialogTitle>
            <DialogDescription>
              Compartilhe suas ideias e experiências com a comunidade.
            </DialogDescription>
          </DialogHeader>
          <CreatePostForm onCreate={handleCreatePost} />
          <DialogFooter>
            <Button type="button" onClick={() => setShowCreateDialog(false)} variant="secondary">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Post Button */}
      <Button onClick={() => setShowCreateDialog(true)} className="mb-4">
        Nova Publicação
      </Button>

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post.id} className="mb-6 border rounded-md p-4">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={post.user?.photo || ""} />
              <AvatarFallback>{post.user?.first_name?.[0]}{post.user?.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-gray-500 text-sm">
                {post.user?.first_name} {post.user?.last_name} - {new Date(post.created_at).toLocaleDateString()}
              </p>
              <p className="mt-2">{post.content}</p>
              <div className="mt-4 flex items-center space-x-4">
                <button 
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  onClick={() => handleLikePost(post.id)}
                  disabled={loadingLike}
                >
                  {post.user_has_liked ? <HeartOff size={20} /> : <Heart size={20} />}
                  <span>{post.likes_count}</span>
                </button>
                <button 
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  onClick={() => setActiveCommentPostId(post.id)}
                >
                  <MessageSquare size={20} />
                  <span>{post.comments_count || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              {activeCommentPostId === post.id && (
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Adicionar um comentário..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => handleAddComment(post.id)}>Enviar</Button>
                  </div>
                  {/* Display Comments */}
                  {posts.find(p => p.id === post.id)?.comments?.map(comment => (
                    <div key={comment.id} className="mt-2 p-2 border rounded-md">
                      <div className="flex items-start space-x-2">
                        <Avatar>
                          <AvatarImage src={comment.user?.photo || ""} />
                          <AvatarFallback>{comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{comment.user?.first_name} {comment.user?.last_name}</p>
                          <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
                          <p>{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface CreatePostFormProps {
  onCreate: (values: { title: string; content: string }) => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Título da publicação"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Textarea
          placeholder="Conteúdo da publicação"
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
