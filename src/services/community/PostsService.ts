
import { supabase } from "@/integrations/supabase/client";
import { Post, Profile, Comment } from "@/types/community";

export const fetchPosts = async (channelId: string, userId: string): Promise<Post[]> => {
  try {
    // First, fetch all posts for the channel
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
  
    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw new Error('Não foi possível carregar as publicações. Tente novamente.');
    }
  
    // If no posts, just return empty array
    if (!postsData || postsData.length === 0) {
      return [];
    }

    // For each post, fetch the user (author)
    const postsWithUsers = await Promise.all(
      postsData.map(async (post) => {
        // Fetch user profile for each post
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, photo, role, username, phone, cpf, date_of_birth')
          .eq('id', post.user_id)
          .single();
        
        if (userError) {
          console.error(`Error fetching user for post ${post.id}:`, userError);
        }

        // Check if current user has liked this post
        const { data: likeData, error: likeError } = await supabase
          .from('user_likes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (likeError && likeError.code !== 'PGRST116') {
          console.error(`Error checking like status for post ${post.id}:`, likeError);
        }

        // Count total likes for this post
        const { count: likesCount, error: countError } = await supabase
          .from('user_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        if (countError) {
          console.error(`Error counting likes for post ${post.id}:`, countError);
        }

        // Count comments for this post
        const { count: commentsCount, error: commentsCountError } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        if (commentsCountError) {
          console.error(`Error counting comments for post ${post.id}:`, commentsCountError);
        }

        return {
          ...post,
          user: userData || null,
          user_has_liked: !!likeData,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0
        } as Post;
      })
    );
    
    return postsWithUsers;
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    throw error;
  }
};

export const createPost = async (channelId: string, userId: string, title: string, content: string): Promise<Post> => {
  try {
    const { data: postData, error: postError } = await supabase
      .from('community_posts')
      .insert({
        title: title,
        content: content,
        channel_id: channelId,
        user_id: userId
      })
      .select()
      .single();
  
    if (postError) {
      console.error('Error creating post:', postError);
      throw new Error("Não foi possível criar a publicação. Tente novamente.");
    }
  
    if (postData) {
      // Fetch the user data for the new post
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, photo, role, username, phone, cpf, date_of_birth')
        .eq('id', userId)
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
      
      return newPost;
    }
    
    throw new Error("Erro ao criar publicação");
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
};

export const toggleLike = async (postId: string, userId: string): Promise<{ liked: boolean }> => {
  try {
    const { data: existingLike, error: existingLikeError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
  
    if (existingLikeError && existingLikeError.code !== 'PGRST116') {
      console.error('Error checking existing like:', existingLikeError);
      throw new Error("Não foi possível verificar se você já curtiu esta publicação.");
    }
  
    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('user_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    
      if (deleteError) {
        console.error('Error unliking post:', deleteError);
        throw new Error("Não foi possível descurtir a publicação. Tente novamente.");
      }
    
      return { liked: false };
    } else {
      // Like the post
      const { error: insertError } = await supabase
        .from('user_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });
    
      if (insertError) {
        console.error('Error liking post:', insertError);
        throw new Error("Não foi possível curtir a publicação. Tente novamente.");
      }
    
      return { liked: true };
    }
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw error;
  }
};

export const addComment = async (postId: string, userId: string, content: string): Promise<Comment> => {
  try {
    const { data: commentData, error: commentError } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        content: content,
        user_id: userId
      })
      .select()
      .single();
  
    if (commentError) {
      console.error('Error adding comment:', commentError);
      throw new Error("Não foi possível adicionar o comentário. Tente novamente.");
    }
  
    // Get user data for the comment
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, photo, role, username, phone, cpf, date_of_birth')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user data for comment:', userError);
    }
    
    const newComment: Comment = {
      ...commentData,
      user: userData as Profile,
      user_has_liked: false
    };
    
    return newComment;
  } catch (error) {
    console.error('Error in addComment:', error);
    throw error;
  }
};

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data as Profile;
  } catch (err) {
    console.error('Error in fetchUserProfile:', err);
    return null;
  }
};
