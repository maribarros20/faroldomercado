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
          .single();

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
    const { error } = await supabase.rpc('like_video_comment', { comment_id: commentId });

    if (error) {
      console.error('Error liking video comment:', error);
    }
  } catch (error) {
    console.error('Error in likeVideoComment:', error);
  }
};

export const unlikeVideoComment = async (commentId: string) => {
  try {
    const { error } = await supabase.rpc('unlike_video_comment', { comment_id: commentId });

    if (error) {
      console.error('Error unliking video comment:', error);
    }
  } catch (error) {
    console.error('Error in unlikeVideoComment:', error);
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
