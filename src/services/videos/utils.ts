
import { supabase } from '@/integrations/supabase/client';
import { Video, VideoSource, VideoComment } from './types';
import { MaterialTheme } from '../materials/types';

// Function to extract YouTube ID from URL
export const extractYoutubeId = (url: string): string | null => {
  const youtubeIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return youtubeIdMatch && youtubeIdMatch[1] ? youtubeIdMatch[1] : null;
};

// Function to increment video views
export const incrementVideoViews = async (videoId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_video_views', {
      video_id: videoId
    });

    if (error) {
      console.error('Error incrementing video views:', error);
    }
  } catch (error) {
    console.error('Error in incrementVideoViews:', error);
  }
};

// Process video data with themes
export const processVideoWithThemes = async (video: any): Promise<Video> => {
  const { data: themeRelations, error: themeError } = await supabase
    .from('video_theme_relations')
    .select('theme_id')
    .eq('video_id', video.id);
  
  if (themeError) {
    console.error('Error fetching theme relations:', themeError);
    return { ...video, themes: [] };
  }
  
  if (!themeRelations || themeRelations.length === 0) {
    return { ...video, themes: [] };
  }
  
  const themeIds = themeRelations.map(relation => relation.theme_id);
  
  const { data: themesData, error: themesError } = await supabase
    .from('material_themes')
    .select('*')
    .in('id', themeIds);
  
  if (themesError) {
    console.error('Error fetching themes:', themesError);
    return { ...video, themes: [] };
  }
  
  return {
    ...video,
    themes: themesData || []
  };
};

// Process multiple videos with themes
export const processVideosWithThemes = async (videos: any[]): Promise<Video[]> => {
  if (!videos || videos.length === 0) {
    return [] as Video[];
  }
  
  return Promise.all(videos.map(processVideoWithThemes));
};

// Like a video
export const likeVideo = async (videoId: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    // Check if user already liked this video
    const { data: existingLike } = await supabase
      .from('video_likes')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // User already liked, so unlike
      const { error: unlikeError } = await supabase
        .from('video_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', userId);

      if (unlikeError) {
        console.error('Error removing like:', unlikeError);
      }

      // Decrease like count
      const { error: updateError } = await supabase
        .from('videos')
        .update({ likes: supabase.rpc('decrement', { row_id: videoId, table_name: 'videos', column_name: 'likes' }) })
        .eq('id', videoId);

      if (updateError) {
        console.error('Error updating video like count:', updateError);
      }
    } else {
      // User hasn't liked, so add like
      const { error: likeError } = await supabase
        .from('video_likes')
        .insert({ video_id: videoId, user_id: userId });

      if (likeError) {
        console.error('Error adding like:', likeError);
      }

      // Increase like count
      const { error: updateError } = await supabase
        .from('videos')
        .update({ 
          likes: supabase.rpc('increment', { row_id: videoId, table_name: 'videos', column_name: 'likes' }) 
        })
        .eq('id', videoId);

      if (updateError) {
        console.error('Error updating video like count:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in likeVideo:', error);
  }
};

// Check if user has liked a video
export const hasUserLikedVideo = async (videoId: string): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      return false;
    }

    const { data, error } = await supabase
      .from('video_likes')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasUserLikedVideo:', error);
    return false;
  }
};

// Get video comments
export const getVideoComments = async (videoId: string): Promise<VideoComment[]> => {
  try {
    const { data, error } = await supabase
      .from('video_comments')
      .select(`
        id,
        video_id,
        user_id,
        content,
        created_at,
        likes_count,
        profiles(first_name, last_name, avatar_url)
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching video comments:', error);
      return [];
    }

    return data.map(comment => ({
      id: comment.id,
      video_id: comment.video_id,
      user_id: comment.user_id,
      user_name: `${comment.profiles.first_name} ${comment.profiles.last_name}`,
      user_avatar: comment.profiles.avatar_url,
      content: comment.content,
      created_at: comment.created_at,
      likes_count: comment.likes_count || 0
    }));
  } catch (error) {
    console.error('Error in getVideoComments:', error);
    return [];
  }
};

// Add a comment to a video
export const addVideoComment = async (videoId: string, content: string): Promise<VideoComment | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        user_id: userId,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    // Get user profile info
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      return null;
    }

    return {
      id: data.id,
      video_id: data.video_id,
      user_id: data.user_id,
      user_name: `${userProfile.first_name} ${userProfile.last_name}`,
      user_avatar: userProfile.avatar_url,
      content: data.content,
      created_at: data.created_at,
      likes_count: 0
    };
  } catch (error) {
    console.error('Error in addVideoComment:', error);
    return null;
  }
};
