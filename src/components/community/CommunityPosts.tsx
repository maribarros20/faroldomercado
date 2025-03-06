import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageCircle, SendIcon, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  onPostCreated?: () => void;
}

import CreatePostDialog from "./CreatePostDialog";

type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: "user" | "admin";
  updated_at?: string;
  photo?: string | null;
  company_id?: string | null;
  cpf?: string | null;
  phone?: string | null;
};

type Post = {
  id: string;
  user_id: string;
  content: string;
  title?: string;
  created_at: string;
  updated_at: string;
  channel_id: string;
  likes_count: number;
  comments_count: number;
  user?: Profile;
  user_has_liked?: boolean;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  user?: Profile;
  user_has_liked?: boolean;
};

type CommunityPostsProps = {
  channelId: string;
};

const CommunityPosts = ({ channelId }: CommunityPostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchPosts();
      }
    };

    getSession();
  }, [channelId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select(`*, user:profiles(id, first_name, last_name, role, updated_at)`)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }

      const { data: userLikes, error: likesError } = await supabase
        .from("user_likes")
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', 'is.not.null');
      
      if (likesError) {
        console.error("Error fetching user likes:", likesError);
      }

      const postsWithLikes = postsData.map((post: any) => {
        const postWithTypedUser: Post = {
          ...post,
          user: post.user as Profile,
          user_has_liked: userLikes ? userLikes.some((like: any) => like.post_id === post.id) : false
        };
        return postWithTypedUser;
      });

      setPosts(postsWithLikes);
      
      const initialCommentsVisibility: { [key: string]: boolean } = {};
      postsWithLikes.forEach((post: Post) => {
        initialCommentsVisibility[post.id] = false;
      });
      setShowComments(initialCommentsVisibility);
      
      const initialNewComments: { [key: string]: string } = {};
      postsWithLikes.forEach((post: Post) => {
        initialNewComments[post.id] = "";
      });
      setNewComment(initialNewComments);
      
    } catch (error) {
      console.error("Error in fetchPosts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("post_comments")
        .select(`*, user:profiles(id, first_name, last_name, role, updated_at)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        return;
      }
      
      const { data: userLikes, error: likesError } = await supabase
        .from("user_likes")
        .select('*')
        .eq('user_id', user.id)
        .eq('comment_id', 'is.not.null');
      
      if (likesError) {
        console.error("Error fetching comment likes:", likesError);
      }
      
      const commentsWithLikes = commentsData.map((comment: any) => {
        const commentWithTypedUser: Comment = {
          ...comment,
          user: comment.user as Profile,
          user_has_liked: userLikes ? userLikes.some((like: any) => like.comment_id === comment.id) : false
        };
        return commentWithTypedUser;
      });
      
      setComments(prev => ({
        ...prev,
        [postId]: commentsWithLikes
      }));
      
    } catch (error) {
      console.error("Error in fetchComments:", error);
    }
  };

  const handleToggleComments = async (postId: string) => {
    const newValue = !showComments[postId];
    setShowComments({ ...showComments, [postId]: newValue });
    
    if (newValue && (!comments[postId] || comments[postId].length === 0)) {
      await fetchComments(postId);
    }
  };

  const handleLikePost = async (post: Post) => {
    if (!user) return;
    
    try {
      if (post.user_has_liked) {
        const { error } = await supabase
          .from("user_likes")
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
        
        if (error) {
          console.error("Error unliking post:", error);
          return;
        }
        
        setPosts(posts.map(p => 
          p.id === post.id 
            ? { ...p, likes_count: p.likes_count - 1, user_has_liked: false } 
            : p
        ));
        
      } else {
        const { error } = await supabase
          .from("user_likes")
          .insert({
            user_id: user.id,
            post_id: post.id
          });
        
        if (error) {
          console.error("Error liking post:", error);
          return;
        }
        
        setPosts(posts.map(p => 
          p.id === post.id 
            ? { ...p, likes_count: p.likes_count + 1, user_has_liked: true } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error in handleLikePost:", error);
    }
  };

  const handleSubmitComment = async (postId: string) => {
    if (!user || !newComment[postId].trim()) return;
    
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          content: newComment[postId].trim()
        })
        .select();
      
      if (error) {
        console.error("Error submitting comment:", error);
        toast({
          title: "Erro ao enviar comentário",
          description: "Ocorreu um problema ao enviar seu comentário.",
          variant: "destructive"
        });
        return;
      }
      
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, comments_count: p.comments_count + 1 } 
          : p
      ));
      
      setNewComment({ ...newComment, [postId]: "" });
      
      await fetchComments(postId);
      
    } catch (error) {
      console.error("Error in handleSubmitComment:", error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm");
    } catch (e) {
      return timestamp;
    }
  };

  const getInitials = (profile: Profile | undefined) => {
    if (!profile) return "U";
    const firstInitial = profile.first_name ? profile.first_name.charAt(0).toUpperCase() : "";
    const lastInitial = profile.last_name ? profile.last_name.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const getFullName = (profile: Profile | undefined) => {
    if (!profile) return "Usuário";
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Usuário";
  };

  const handleNewPost = () => {
    setIsCreatePostOpen(true);
  };

  const handlePostCreated = () => {
    fetchPosts();
    setIsCreatePostOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comunidade</h2>
        <Button onClick={handleNewPost}>Nova Publicação</Button>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <div>Carregando publicações...</div>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <div>
              <p className="text-center text-muted-foreground mb-4">
                Não há publicações neste canal ainda.
              </p>
              <Button onClick={handleNewPost} className="mx-auto block">
                Criar primeira publicação
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        posts.map((post: Post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(post.user)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getFullName(post.user)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(post.created_at)}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="px-4 py-2">
                <p className="whitespace-pre-line">{post.content}</p>
              </div>
              
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center space-x-2 ${post.user_has_liked ? 'text-blue-500' : ''}`}
                    onClick={() => handleLikePost(post)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes_count}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2"
                    onClick={() => handleToggleComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {showComments[post.id] && (
                <div className="p-4 bg-muted/20">
                  <div className="space-y-4 mb-4">
                    {comments[post.id]?.length > 0 ? (
                      comments[post.id].map((comment: Comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(comment.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-background rounded-lg p-3">
                              <div className="font-medium text-sm">
                                {getFullName(comment.user)}
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(comment.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Sem comentários. Seja o primeiro a comentar!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user ? getInitials(user) : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center">
                      <Input
                        value={newComment[post.id] || ""}
                        onChange={(e) => setNewComment({
                          ...newComment,
                          [post.id]: e.target.value
                        })}
                        placeholder="Escreva um comentário..."
                        className="flex-1 bg-background"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitComment(post.id);
                          }
                        }}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="ml-2"
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                      >
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
      
      <CreatePostDialog 
        open={isCreatePostOpen} 
        onOpenChange={setIsCreatePostOpen}
        channelId={channelId}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default CommunityPosts;
