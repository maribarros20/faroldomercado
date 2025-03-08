
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Post, Profile } from "@/types/community";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PostItem from './PostItem';
import CreatePostDialogComponent from './CreatePostDialog';
import { 
  fetchPosts, 
  fetchUserProfile, 
  createPost, 
  toggleLike, 
  addComment 
} from '@/services/community/PostsService';

interface CommunityPostsProps {
  channelId: string;
  userId: string;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId, userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Fetch posts when channelId changes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const postsData = await fetchPosts(channelId, userId);
        setPosts(postsData);
      } catch (error) {
        console.error('Error loading posts:', error);
        setError('Ocorreu um erro ao carregar as publicações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (channelId) {
      loadPosts();
    }
  }, [channelId, userId]);
  
  // Fetch user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      const profile = await fetchUserProfile(userId);
      if (profile) {
        setUser(profile);
      }
    };
    
    loadUserProfile();
  }, [userId]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      const result = await toggleLike(postId, user.id);
      
      // Update the local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { 
                ...post, 
                likes_count: result.liked ? post.likes_count + 1 : post.likes_count - 1, 
                user_has_liked: result.liked 
              }
            : post
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erro ao processar curtida",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleCreatePost = async (values: { title: string; content: string }) => {
    if (!user) return;
    
    try {
      const newPost = await createPost(channelId, user.id, values.title, values.content);
      
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setShowCreateDialog(false);
      
      toast({
        title: "Publicação criada",
        description: "Sua publicação foi criada com sucesso!",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erro ao criar publicação",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleAddComment = async (postId: string, commentContent: string) => {
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
      const newComment = await addComment(postId, user.id, commentContent);
      
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
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso!",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erro ao adicionar comentário",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleComments = (postId: string) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
          <PostItem 
            key={post.id}
            post={post}
            currentUser={user}
            activeCommentPostId={activeCommentPostId}
            onToggleComments={handleToggleComments}
            onLike={handleLike}
            onAddComment={handleAddComment}
          />
        ))
      )}

      {/* Create Post Dialog */}
      <CreatePostDialogComponent
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default CommunityPosts;
