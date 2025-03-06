import React, { useState, useEffect } from "react";
import { Post as PostType, Profile, Comment as CommentType } from "@/types/community";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommunityPostsProps {
  channelId: string;
  userId: string | undefined;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ channelId, userId }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [comments, setComments] = useState<{ [postId: string]: CommentType[] }>({});
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [channelId, userId]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select(`*, user:user_id(*)`)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        toast({
          title: "Erro ao carregar postagens",
          description: "Não foi possível carregar as postagens. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }

      // Convert to Post[] with proper typing
      const formattedPosts = postsData.map((post: any) => {
        return {
          id: post.id,
          channel_id: post.channel_id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.updated_at,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          user: post.user as Profile,
          user_has_liked: false, // Will be updated later
        };
      }) as PostType[];

      setPosts(formattedPosts);

      // Check which posts user has liked
      if (userId) {
        const { data: likesData } = await supabase
          .from("user_likes")
          .select("post_id")
          .eq("user_id", userId);

        if (likesData && likesData.length > 0) {
          const likedPostIds = new Set(likesData.map((like) => like.post_id));
          setPosts((prevPosts) =>
            prevPosts.map((post) => ({
              ...post,
              user_has_liked: likedPostIds.has(post.id),
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error in fetchPosts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPostTitle || !newPostContent) {
      toast({
        title: "Erro ao criar postagem",
        description: "Por favor, preencha o título e o conteúdo da postagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: post, error } = await supabase
        .from("community_posts")
        .insert([
          {
            channel_id: channelId,
            user_id: userId,
            title: newPostTitle,
            content: newPostContent,
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Erro ao criar postagem",
          description:
            "Não foi possível criar a postagem. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }

      setPosts((prevPosts) => [
        {
          id: post.id,
          channel_id: post.channel_id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.updated_at,
          likes_count: 0,
          comments_count: 0,
          user_has_liked: false,
          user: {
            id: userId || "",
            first_name: "Você",
            last_name: "",
            email: "",
            role: "user",
          },
        },
        ...prevPosts,
      ]);

      setNewPostTitle("");
      setNewPostContent("");

      toast({
        title: "Postagem criada com sucesso",
        description: "Sua postagem foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Error during post submission:", error);
      toast({
        title: "Erro ao criar postagem",
        description:
          "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!userId) {
      toast({
        title: "Acesso não autorizado",
        description: "Você precisa estar logado para curtir esta postagem.",
        variant: "destructive",
      });
      return;
    }

    setIsLiking(true);

    try {
      const post = posts.find((post) => post.id === postId);

      if (!post) {
        toast({
          title: "Erro ao curtir postagem",
          description: "Postagem não encontrada.",
          variant: "destructive",
        });
        return;
      }

      const userHasLiked = post.user_has_liked;

      if (userHasLiked) {
        // Unlike the post
        const { error } = await supabase
          .from("user_likes")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", postId);

        if (error) {
          console.error("Error unliking post:", error);
          toast({
            title: "Erro ao descurtir postagem",
            description: "Não foi possível descurtir a postagem. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        // Update likes count
        await supabase
          .from("community_posts")
          .update({ likes_count: post.likes_count - 1 })
          .eq("id", postId);

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, user_has_liked: false, likes_count: p.likes_count - 1 }
              : p
          )
        );

        toast({
          title: "Postagem descurtida",
          description: "Você descurtiu esta postagem.",
        });
      } else {
        // Like the post
        const { error } = await supabase
          .from("user_likes")
          .insert([{ user_id: userId, post_id: postId }]);

        if (error) {
          console.error("Error liking post:", error);
          toast({
            title: "Erro ao curtir postagem",
            description: "Não foi possível curtir a postagem. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        // Update likes count
        await supabase
          .from("community_posts")
          .update({ likes_count: post.likes_count + 1 })
          .eq("id", postId);

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, user_has_liked: true, likes_count: p.likes_count + 1 }
              : p
          )
        );

        toast({
          title: "Postagem curtida",
          description: "Você curtiu esta postagem.",
        });
      }
    } catch (error) {
      console.error("Error during like/unlike:", error);
      toast({
        title: "Erro ao curtir/descurtir postagem",
        description:
          "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("post_comments")
        .select(`*, user:user_id(*)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        return [];
      }

      // Convert to Comment[] with proper typing
      const formattedComments = commentsData.map((comment: any) => {
        return {
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          likes_count: comment.likes_count,
          user: comment.user as Profile,
          user_has_liked: false, // Will be updated later
        };
      }) as CommentType[];

      // Check which comments user has liked
      if (userId) {
        const { data: likesData } = await supabase
          .from("user_likes")
          .select("comment_id")
          .eq("user_id", userId);

        if (likesData && likesData.length > 0) {
          const likedCommentIds = new Set(likesData.map((like) => like.comment_id));
          return formattedComments.map((comment) => ({
            ...comment,
            user_has_liked: likedCommentIds.has(comment.id),
          }));
        }
      }

      return formattedComments;
    } catch (error) {
      console.error("Error in fetchComments:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadComments = async () => {
      const allComments: { [postId: string]: CommentType[] } = {};
      for (const post of posts) {
        const fetchedComments = await fetchComments(post.id);
        allComments[post.id] = fetchedComments;
      }
      setComments(allComments);
    };

    loadComments();
  }, [posts, userId]);

  const handleCommentChange = (postId: string, content: string) => {
    setNewComment((prevComments) => ({
      ...prevComments,
      [postId]: content,
    }));
  };

  const handleSubmitComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "Acesso não autorizado",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment[postId]) {
      toast({
        title: "Erro ao criar comentário",
        description: "Por favor, escreva um comentário.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: comment, error } = await supabase
        .from("post_comments")
        .insert([
          {
            post_id: postId,
            user_id: userId,
            content: newComment[postId],
          },
        ])
        .select(`*, user:user_id(*)`)
        .single();

      if (error) {
        console.error("Error creating comment:", error);
        toast({
          title: "Erro ao criar comentário",
          description:
            "Não foi possível criar o comentário. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }

      const formattedComment = {
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        likes_count: 0,
        user: comment.user as Profile,
        user_has_liked: false,
      };

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), formattedComment],
      }));

      setNewComment((prevComments) => ({
        ...prevComments,
        [postId]: "",
      }));

      // Update comments count
      const post = posts.find((post) => post.id === postId);
      if (post) {
        await supabase
          .from("community_posts")
          .update({ comments_count: post.comments_count + 1 })
          .eq("id", postId);

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
          )
        );
      }

      toast({
        title: "Comentário criado com sucesso",
        description: "Seu comentário foi criado com sucesso.",
      });
    } catch (error) {
      console.error("Error during comment submission:", error);
      toast({
        title: "Erro ao criar comentário",
        description:
          "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleLikeComment = async (commentId: string, postId: string) => {
    if (!userId) {
      toast({
        title: "Acesso não autorizado",
        description: "Você precisa estar logado para curtir este comentário.",
        variant: "destructive",
      });
      return;
    }

    setIsLiking(true);

    try {
      const commentList = comments[postId] || [];
      const comment = commentList.find((comment) => comment.id === commentId);

      if (!comment) {
        toast({
          title: "Erro ao curtir comentário",
          description: "Comentário não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const userHasLiked = comment.user_has_liked;

      if (userHasLiked) {
        // Unlike the comment
        const { error } = await supabase
          .from("user_likes")
          .delete()
          .eq("user_id", userId)
          .eq("comment_id", commentId);

        if (error) {
          console.error("Error unliking comment:", error);
          toast({
            title: "Erro ao descurtir comentário",
            description: "Não foi possível descurtir o comentário. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        // Update likes count
        await supabase
          .from("post_comments")
          .update({ likes_count: comment.likes_count - 1 })
          .eq("id", commentId);

        setComments((prevComments) => {
          const updatedComments = { ...prevComments };
          updatedComments[postId] = updatedComments[postId].map((c) =>
            c.id === commentId
              ? { ...c, user_has_liked: false, likes_count: c.likes_count - 1 }
              : c
          );
          return updatedComments;
        });

        toast({
          title: "Comentário descurtido",
          description: "Você descurtiu este comentário.",
        });
      } else {
        // Like the comment
        const { error } = await supabase
          .from("user_likes")
          .insert([{ user_id: userId, comment_id: commentId }]);

        if (error) {
          console.error("Error liking comment:", error);
          toast({
            title: "Erro ao curtir comentário",
            description: "Não foi possível curtir o comentário. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        // Update likes count
        await supabase
          .from("post_comments")
          .update({ likes_count: comment.likes_count + 1 })
          .eq("id", commentId);

        setComments((prevComments) => {
          const updatedComments = { ...prevComments };
          updatedComments[postId] = updatedComments[postId].map((c) =>
            c.id === commentId
              ? { ...c, user_has_liked: true, likes_count: c.likes_count + 1 }
              : c
          );
          return updatedComments;
        });

        toast({
          title: "Comentário curtido",
          description: "Você curtiu este comentário.",
        });
      }
    } catch (error) {
      console.error("Error during like/unlike:", error);
      toast({
        title: "Erro ao curtir/descurtir comentário",
        description:
          "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New Post Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Título da postagem"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Conteúdo da postagem"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Postar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando postagens...</div>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Nenhuma postagem encontrada.</div>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={post.user?.photo || ""} />
                  <AvatarFallback>{post.user?.first_name?.[0]}{post.user?.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    {post.user?.first_name} {post.user?.last_name} - {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p>{post.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => handleLikePost(post.id)}
                  disabled={isLiking}
                >
                  {post.user_has_liked ? "Descurtir" : "Curtir"} ({post.likes_count})
                </Button>
                <span className="ml-2">{post.comments_count} comentários</span>
              </div>
              <div>
                <form onSubmit={(e) => handleSubmitComment(post.id, e)} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Escreva um comentário..."
                    value={newComment[post.id] || ""}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  />
                  <Button type="submit" disabled={isLoading}>
                    Comentar
                  </Button>
                </form>
              </div>
            </CardFooter>

            {/* Comments List */}
            {comments[post.id] && comments[post.id].length > 0 ? (
              <CardContent className="p-6">
                <div className="space-y-4">
                  {comments[post.id].map((comment) => (
                    <Card key={comment.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={comment.user?.photo || ""} />
                            <AvatarFallback>{comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{comment.user?.first_name} {comment.user?.last_name}</CardTitle>
                            <CardDescription>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p>{comment.content}</p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          onClick={() => handleLikeComment(comment.id, post.id)}
                          disabled={isLiking}
                        >
                          {comment.user_has_liked ? "Descurtir" : "Curtir"} ({comment.likes_count})
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-6">
                <div className="text-center">Nenhum comentário ainda. Seja o primeiro!</div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default CommunityPosts;
