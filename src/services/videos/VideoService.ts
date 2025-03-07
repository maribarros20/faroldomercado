
import { supabase } from '@/integrations/supabase/client';
import { Video, VideoSource } from './types';
import { extractYoutubeId, processVideoWithThemes, processVideosWithThemes } from './utils';

class VideoService {
  async getVideos(): Promise<Video[]> {
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('date_added', { ascending: false });

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        throw new Error(videosError.message);
      }

      return processVideosWithThemes(videos);
    } catch (error) {
      console.error('Error in getVideos service:', error);
      throw error;
    }
  }

  async getVideoById(id: string): Promise<Video> {
    try {
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (videoError) {
        console.error('Error fetching video by ID:', videoError);
        throw new Error(videoError.message);
      }
      
      const result = await processVideoWithThemes(video);

      // Increment view count
      await this.incrementViews(id);

      return result;
    } catch (error) {
      console.error('Error in getVideoById service:', error);
      throw error;
    }
  }

  async incrementViews(videoId: string): Promise<void> {
    try {
      // Use the RPC function to increment views safely
      const { error } = await supabase.rpc('increment_video_views', {
        video_id: videoId
      });

      if (error) {
        console.error('Error incrementing video views:', error);
      }
    } catch (error) {
      console.error('Error in incrementViews service:', error);
    }
  }

  async getRelatedVideos(category: string, currentVideoId: string): Promise<Video[]> {
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('category', category)
        .neq('id', currentVideoId)
        .limit(4);

      if (videosError) {
        console.error('Error fetching related videos:', videosError);
        throw new Error(videosError.message);
      }

      return processVideosWithThemes(videos);
    } catch (error) {
      console.error('Error in getRelatedVideos service:', error);
      throw error;
    }
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('category', category)
        .order('date_added', { ascending: false });

      if (videosError) {
        console.error('Error fetching videos by category:', videosError);
        throw new Error(videosError.message);
      }

      return processVideosWithThemes(videos);
    } catch (error) {
      console.error('Error in getVideosByCategory service:', error);
      throw error;
    }
  }

  async createVideo(videoData: Omit<Video, 'id' | 'date_added' | 'views'>): Promise<Video> {
    try {
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      // Extract themes from video data
      const { themes, ...videoFields } = videoData;

      // Estimate video duration automatically
      let duration = "00:00";
      if (videoData.source === 'youtube') {
        const youtubeId = extractYoutubeId(videoData.url);
        if (youtubeId) {
          // Duration will be calculated in a future update
          // For now, we'll set a default value
          duration = "Automático";
        }
      }

      const { data, error } = await supabase
        .from('videos')
        .insert({
          ...videoFields,
          created_by: userId || videoFields.created_by,
          views: 0,
          duration
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating video:', error);
        throw new Error(error.message);
      }

      // If themes are provided, create theme relations
      if (themes && themes.length > 0 && data) {
        for (const theme of themes) {
          const { error: relationError } = await supabase
            .from('video_theme_relations')
            .insert({
              video_id: data.id,
              theme_id: theme.id
            });

          if (relationError) {
            console.error('Error creating theme relation:', relationError);
          }
        }
      }

      return { ...data, themes: themes || [] } as Video;
    } catch (error) {
      console.error('Error in createVideo service:', error);
      throw error;
    }
  }

  async updateVideo(id: string, videoData: Partial<Video>): Promise<Video> {
    try {
      // Extract themes from video data
      const { themes, ...videoFields } = videoData;
      
      // Estimate video duration automatically if URL was changed
      let updatedFields = {...videoFields};
      if (videoData.source === 'youtube' && videoData.url) {
        const youtubeId = extractYoutubeId(videoData.url);
        if (youtubeId) {
          // Here we can implement the logic to fetch the actual video duration in the future
          updatedFields.duration = "Automático";
        }
      }

      // Update video
      const { data, error } = await supabase
        .from('videos')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating video:', error);
        throw new Error(error.message);
      }

      // If themes are provided, update theme relations
      if (themes && data) {
        // First delete existing relations
        const { error: deleteError } = await supabase
          .from('video_theme_relations')
          .delete()
          .eq('video_id', id);

        if (deleteError) {
          console.error('Error deleting theme relations:', deleteError);
        }

        // Then create new relations if there are themes
        if (themes.length > 0) {
          for (const theme of themes) {
            const { error: relationError } = await supabase
              .from('video_theme_relations')
              .insert({
                video_id: data.id,
                theme_id: theme.id
              });
    
            if (relationError) {
              console.error('Error creating theme relation:', relationError);
            }
          }
        }
      }

      return { ...data, themes: themes || [] } as Video;
    } catch (error) {
      console.error('Error in updateVideo service:', error);
      throw error;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    try {
      // Delete theme relations first (though CASCADE should handle this)
      const { error: relationsError } = await supabase
        .from('video_theme_relations')
        .delete()
        .eq('video_id', id);
        
      if (relationsError) {
        console.error('Error deleting video theme relations:', relationsError);
      }

      // Then delete the video
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting video:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteVideo service:', error);
      throw error;
    }
  }
}

export default new VideoService();
