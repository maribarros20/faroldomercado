
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

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
}

export type VideoSource = 'youtube' | 'vimeo' | 'url' | 'storage';

class VideosService {
  async getVideos(): Promise<Video[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        throw new Error(error.message);
      }

      return data as unknown as Video[] || [];
    } catch (error) {
      console.error('Error in getVideos service:', error);
      throw error;
    }
  }

  async getVideoById(id: string): Promise<Video> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id as any)
        .single();

      if (error) {
        console.error('Error fetching video by ID:', error);
        throw new Error(error.message);
      }

      // Increment view count
      await this.incrementViews(id);

      return data as unknown as Video;
    } catch (error) {
      console.error('Error in getVideoById service:', error);
      throw error;
    }
  }

  async incrementViews(videoId: string): Promise<void> {
    try {
      // Use the RPC function to increment views safely
      const { error } = await supabase.rpc('increment_video_views', {
        video_id: videoId as any
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
        .select('*')
        .eq('category', category as any)
        .neq('id', currentVideoId as any)
        .limit(4);

      if (error) {
        console.error('Error fetching related videos:', error);
        throw new Error(error.message);
      }

      return data as unknown as Video[] || [];
    } catch (error) {
      console.error('Error in getRelatedVideos service:', error);
      throw error;
    }
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('category', category as any)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching videos by category:', error);
        throw new Error(error.message);
      }

      return data as unknown as Video[] || [];
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

      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: videoData.title,
          description: videoData.description,
          source: videoData.source,
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          category: videoData.category,
          learning_path: videoData.learning_path,
          duration: videoData.duration,
          created_by: userId,
          views: 0
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating video:', error);
        throw new Error(error.message);
      }

      return data as unknown as Video;
    } catch (error) {
      console.error('Error in createVideo service:', error);
      throw error;
    }
  }

  async updateVideo(id: string, videoData: Partial<Video>): Promise<Video> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(videoData as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) {
        console.error('Error updating video:', error);
        throw new Error(error.message);
      }

      return data as unknown as Video;
    } catch (error) {
      console.error('Error in updateVideo service:', error);
      throw error;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id as any);

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
