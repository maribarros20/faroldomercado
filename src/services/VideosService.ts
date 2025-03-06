
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

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

// Add a type guard to validate video objects
function isValidVideo(video: any): video is Video {
  return (
    video &&
    typeof video.id === 'string' &&
    typeof video.title === 'string' &&
    typeof video.url === 'string'
  );
}

export const useVideos = (categoryFilter?: string, learningPathFilter?: string) => {
  return useQuery({
    queryKey: ['videos', categoryFilter, learningPathFilter],
    queryFn: async () => {
      try {
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
        
        if (!data) return [];
        
        // Validate each video object
        const validVideos = data.filter(isValidVideo);
        return validVideos as Video[];
      } catch (error) {
        console.error("Error in useVideos query:", error);
        return [] as Video[];
      }
    }
  });
};

export const incrementVideoViews = async (videoId: string) => {
  try {
    // Specifically type the function name for the RPC call
    const { data, error } = await supabase.rpc(
      'increment_video_views', 
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
    // Use a defensive approach with explicit error handling
    if (!videoId || !category) {
      console.error("Missing required parameters for getRelatedVideos");
      return [];
    }
    
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
    
    if (!data) return [];
    
    // Validate each video object
    const validVideos = data.filter(isValidVideo);
    return validVideos as Video[];
  } catch (error) {
    console.error("Failed to get related videos:", error);
    return [];
  }
};
