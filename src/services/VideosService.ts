
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { MaterialTheme } from './materials/types';

export interface Video {
  id: string;
  title: string;
  description: string;
  source: VideoSource;
  url: string;
  thumbnail: string;
  category: string;
  learning_path: string;
  duration: string;
  date_added: string;
  views: number;
  created_by: string;
  navigation_id?: string | null;
  format_id?: string | null;
  themes?: MaterialTheme[];
}

export type VideoSource = 'youtube' | 'vimeo' | 'url' | 'storage';

// Custom hook to fetch videos with optional filtering
export const useVideos = (categoryFilter?: string, learningPathFilter?: string) => {
  return useQuery({
    queryKey: ['videos', categoryFilter, learningPathFilter],
    queryFn: async () => {
      let query = supabase.from('videos').select(`
        *,
        video_theme_relations(theme_id, material_themes(id, name))
      `);
      
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }
      
      if (learningPathFilter) {
        query = query.eq('learning_path', learningPathFilter);
      }
      
      query = query.order('date_added', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching videos:', error);
        throw new Error(error.message);
      }
      
      // Process themes
      const processedData = data.map(video => {
        const themes = video.video_theme_relations 
          ? video.video_theme_relations
            .filter(relation => relation.material_themes)
            .map(relation => relation.material_themes) 
          : [];
        
        const result = {
          ...video,
          themes
        };
        
        delete result.video_theme_relations;
        return result;
      });
      
      return processedData as Video[];
    },
    staleTime: 30000 // 30 seconds
  });
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

class VideosService {
  async getVideos(): Promise<Video[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_theme_relations(theme_id, material_themes(id, name))
        `)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        throw new Error(error.message);
      }

      // Process themes
      const processedData = data.map(video => {
        const themes = video.video_theme_relations 
          ? video.video_theme_relations
            .filter(relation => relation.material_themes)
            .map(relation => relation.material_themes) 
          : [];
        
        const result = {
          ...video,
          themes
        };
        
        delete result.video_theme_relations;
        return result;
      });

      return processedData as Video[] || [];
    } catch (error) {
      console.error('Error in getVideos service:', error);
      throw error;
    }
  }

  async getVideoById(id: string): Promise<Video> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_theme_relations(theme_id, material_themes(id, name))
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching video by ID:', error);
        throw new Error(error.message);
      }

      // Process themes
      const themes = data.video_theme_relations 
        ? data.video_theme_relations
          .filter(relation => relation.material_themes)
          .map(relation => relation.material_themes) 
        : [];
      
      const result = {
        ...data,
        themes
      };
      
      delete result.video_theme_relations;

      // Increment view count
      await this.incrementViews(id);

      return result as Video;
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
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_theme_relations(theme_id, material_themes(id, name))
        `)
        .eq('category', category)
        .neq('id', currentVideoId)
        .limit(4);

      if (error) {
        console.error('Error fetching related videos:', error);
        throw new Error(error.message);
      }

      // Process themes
      const processedData = data.map(video => {
        const themes = video.video_theme_relations 
          ? video.video_theme_relations
            .filter(relation => relation.material_themes)
            .map(relation => relation.material_themes) 
          : [];
        
        const result = {
          ...video,
          themes
        };
        
        delete result.video_theme_relations;
        return result;
      });

      return processedData as Video[] || [];
    } catch (error) {
      console.error('Error in getRelatedVideos service:', error);
      throw error;
    }
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_theme_relations(theme_id, material_themes(id, name))
        `)
        .eq('category', category)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching videos by category:', error);
        throw new Error(error.message);
      }

      // Process themes
      const processedData = data.map(video => {
        const themes = video.video_theme_relations 
          ? video.video_theme_relations
            .filter(relation => relation.material_themes)
            .map(relation => relation.material_themes) 
          : [];
        
        const result = {
          ...video,
          themes
        };
        
        delete result.video_theme_relations;
        return result;
      });

      return processedData as Video[] || [];
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

      const { data, error } = await supabase
        .from('videos')
        .insert({
          ...videoFields,
          created_by: userId,
          views: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating video:', error);
        throw new Error(error.message);
      }

      // If themes are provided, create theme relations
      if (themes && themes.length > 0 && data) {
        const themeRelations = themes.map(theme => ({
          video_id: data.id,
          theme_id: theme.id
        }));

        const { error: relationsError } = await supabase
          .from('video_theme_relations')
          .insert(themeRelations);

        if (relationsError) {
          console.error('Error creating theme relations:', relationsError);
        }
      }

      return data as Video;
    } catch (error) {
      console.error('Error in createVideo service:', error);
      throw error;
    }
  }

  async updateVideo(id: string, videoData: Partial<Video>): Promise<Video> {
    try {
      // Extract themes from video data
      const { themes, ...videoFields } = videoData;
      
      // Update video
      const { data, error } = await supabase
        .from('videos')
        .update(videoFields)
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
          const themeRelations = themes.map(theme => ({
            video_id: data.id,
            theme_id: theme.id
          }));

          const { error: insertError } = await supabase
            .from('video_theme_relations')
            .insert(themeRelations);

          if (insertError) {
            console.error('Error creating theme relations:', insertError);
          }
        }
      }

      return data as Video;
    } catch (error) {
      console.error('Error in updateVideo service:', error);
      throw error;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    try {
      // Delete theme relations first (though CASCADE should handle this)
      await supabase
        .from('video_theme_relations')
        .delete()
        .eq('video_id', id);
        
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

export default new VideosService();
