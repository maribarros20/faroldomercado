
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type VideoSource = "youtube" | "vimeo" | "storage";

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
}

export const useVideos = (categoryFilter?: string, learningPathFilter?: string) => {
  return useQuery({
    queryKey: ['videos', categoryFilter, learningPathFilter],
    queryFn: async () => {
      let query = supabase
        .from('videos')
        .select('*')
        .order('date_added', { ascending: false });
      
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }
      
      if (learningPathFilter) {
        query = query.eq('learning_path', learningPathFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching videos:", error);
        throw new Error(error.message);
      }
      
      return data as unknown as Video[];
    }
  });
};

export const incrementVideoViews = async (videoId: string) => {
  try {
    // Using rpc with explicit type assertion for the function name
    const { data, error } = await supabase.rpc(
      'increment_video_views' as any, 
      {
        video_id: videoId
      }
    );
    
    if (error) {
      console.error("Error incrementing views:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to increment views:", error);
    return false;
  }
};

export const getRelatedVideos = async (videoId: string, category: string) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('category', category)
      .neq('id', videoId)
      .limit(4);
      
    if (error) {
      console.error("Error fetching related videos:", error);
      return [];
    }
    
    return data as unknown as Video[];
  } catch (error) {
    console.error("Failed to get related videos:", error);
    return [];
  }
};
