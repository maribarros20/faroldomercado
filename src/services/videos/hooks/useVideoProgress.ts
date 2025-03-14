
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/services/videos/types';

export const useVideoProgress = (videos: Video[], userId?: string | null) => {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user activity for watched videos
        const { data: viewedData, error: viewedError } = await supabase
          .from('user_activities')
          .select('content_id')
          .eq('user_id', userId)
          .eq('activity_type', 'view_video');

        if (viewedError) {
          console.error('Error fetching watched videos:', viewedError);
        } else if (viewedData) {
          const watchedIds = new Set(viewedData.map(item => item.content_id));
          setWatchedVideos(watchedIds);
        }

        // Fetch liked videos
        const { data: likedData, error: likedError } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', userId);

        if (likedError) {
          console.error('Error fetching liked videos:', likedError);
        } else if (likedData) {
          const likedIds = new Set(likedData.map(item => item.video_id));
          setLikedVideos(likedIds);
        }
      } catch (error) {
        console.error('Error in useVideoProgress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, [userId, videos.length]);

  const filteredVideos = (status: string) => {
    if (status === 'all') return videos;
    if (status === 'liked') return videos.filter(video => likedVideos.has(video.id));
    if (status === 'watched') return videos.filter(video => watchedVideos.has(video.id));
    if (status === 'unwatched') return videos.filter(video => !watchedVideos.has(video.id));
    return videos;
  };

  return {
    watchedVideos,
    likedVideos,
    isLoading,
    filteredVideos
  };
};
