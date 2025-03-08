
import { supabase } from "@/integrations/supabase/client";

export const incrementVideoViews = async (videoId: string) => {
  try {
    const { error } = await supabase.rpc('increment_video_views', { video_id: videoId })

    if (error) {
      console.error('Error incrementing video views:', error);
    }
  } catch (error) {
    console.error('Error in incrementVideoViews:', error);
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    const { data, error } = await supabase
      .from('video_comments')
      .select(`
        id,
        video_id,
        user_id,
        content,
        created_at,
        likes_count
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching video comments:', error);
      return [];
    }

    // If no comments, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // Get user profiles for each comment
    const formattedComments = await Promise.all(
      data.map(async (comment) => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, photo')
          .eq('id', comment.user_id)
          .maybeSingle();

        const userName = profileData 
          ? `${profileData.first_name} ${profileData.last_name}` 
          : 'Usuário';
        
        const userAvatar = profileData?.photo || null;

        return {
          id: comment.id,
          video_id: comment.video_id,
          user_id: comment.user_id,
          user_name: userName,
          user_avatar: userAvatar,
          content: comment.content,
          created_at: comment.created_at,
          likes_count: comment.likes_count || 0,
        };
      })
    );

    return formattedComments;
  } catch (error) {
    console.error('Error in getVideoComments:', error);
    return [];
  }
};

export const likeVideoComment = async (commentId: string) => {
  try {
    // Instead of using RPC, use a direct update approach
    // First, check if the comment exists
    const { data: comment, error: commentError } = await supabase
      .from('video_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();
    
    if (commentError) {
      console.error('Error fetching comment:', commentError);
      throw commentError;
    }
    
    // Increment likes_count by 1
    const currentLikes = comment.likes_count || 0;
    const { error, data } = await supabase
      .from('video_comments')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', commentId)
      .select();
    
    if (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Error liking comment:', err);
    throw err;
  }
};

export const unlikeVideoComment = async (commentId: string) => {
  try {
    // Instead of using RPC, use a direct update approach
    // First, check if the comment exists
    const { data: comment, error: commentError } = await supabase
      .from('video_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();
    
    if (commentError) {
      console.error('Error fetching comment:', commentError);
      throw commentError;
    }
    
    // Decrement likes_count by 1 (minimum 0)
    const currentLikes = comment.likes_count || 0;
    const newLikes = Math.max(0, currentLikes - 1);
    
    const { error, data } = await supabase
      .from('video_comments')
      .update({ likes_count: newLikes })
      .eq('id', commentId)
      .select();
    
    if (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Error unliking comment:', err);
    throw err;
  }
};

export const addVideoComment = async (videoId: string, content: string, userId: string) => {
  try {
    // Insert comment
    const { data, error } = await supabase
      .from('video_comments')
      .insert([
        { 
          video_id: videoId,
          user_id: userId,
          content
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, photo')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Format comment with user info
    return {
      id: data.id,
      video_id: data.video_id,
      user_id: data.user_id,
      user_name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Usuário',
      user_avatar: userProfile?.photo || null,
      content: data.content,
      created_at: data.created_at,
      likes_count: 0
    };
  } catch (error) {
    console.error('Error in addVideoComment:', error);
    return null;
  }
};

export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle standard YouTube URLs (https://www.youtube.com/watch?v=VIDEO_ID)
  const standardRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const standardMatch = url.match(standardRegex);
  
  if (standardMatch && standardMatch[1]) {
    return standardMatch[1];
  }
  
  // Handle shortened YouTube URLs (https://youtu.be/VIDEO_ID)
  const shortRegex = /youtu\.be\/([^\/\s]+)/i;
  const shortMatch = url.match(shortRegex);
  
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }
  
  return null;
};

export const processVideoWithThemes = async (video: any): Promise<any> => {
  if (!video) return null;
  
  try {
    const { data: themesData, error: themesError } = await supabase
      .from('video_theme_relations')
      .select(`
        theme_id,
        themes:theme_id (
          id,
          name,
          description
        )
      `)
      .eq('video_id', video.id);
    
    if (themesError) {
      console.error('Error fetching video themes:', themesError);
      return { ...video, themes: [] };
    }
    
    const themes = themesData.map(item => item.themes);
    return { ...video, themes };
  } catch (error) {
    console.error('Error in processVideoWithThemes:', error);
    return { ...video, themes: [] };
  }
};

export const processVideosWithThemes = async (videos: any[]): Promise<any[]> => {
  if (!videos || videos.length === 0) return [];
  
  try {
    return await Promise.all(videos.map(video => processVideoWithThemes(video)));
  } catch (error) {
    console.error('Error in processVideosWithThemes:', error);
    return videos.map(video => ({ ...video, themes: [] }));
  }
};

export const likeVideo = async (videoId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }
    
    const { data: existingLike, error: checkError } = await supabase
      .from('video_likes')
      .select()
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking video like:', checkError);
      return false;
    }
    
    if (existingLike) {
      // User already liked this video, remove the like
      const { error: deleteError } = await supabase
        .from('video_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error('Error removing video like:', deleteError);
        return false;
      }
      
      return false;
    } else {
      // User hasn't liked this video, add a like
      const { error: insertError } = await supabase
        .from('video_likes')
        .insert({ 
          video_id: videoId, 
          user_id: userId 
        });
        
      if (insertError) {
        console.error('Error adding video like:', insertError);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error in likeVideo:', error);
    return false;
  }
};

export const hasUserLikedVideo = async (videoId: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    
    if (!userId) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('video_likes')
      .select()
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking if user liked video:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in hasUserLikedVideo:', error);
    return false;
  }
};
