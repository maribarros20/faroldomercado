
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VideoSource = "youtube" | "vimeo" | "storage";

export interface Video {
  id: string;
  title: string;
  description: string;
  source: VideoSource;
  url: string;
  thumbnail: string | null;
  category: string;
  learning_path: string;
  duration: string | null;
  date_added: string;
  views: number;
  created_by: string | null;
}

export const useVideos = (category?: string, learningPath?: string) => {
  const [data, setData] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase.from("videos").select("*");

        if (category) {
          query = query.eq("category", category);
        }

        if (learningPath) {
          query = query.eq("learning_path", learningPath);
        }

        const { data, error } = await query.order("date_added", { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        setData(data as Video[]);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch videos"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [category, learningPath]);

  return { data, isLoading, error };
};

export const getVideoById = async (id: string): Promise<Video | null> => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as Video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
};

export const getRelatedVideos = async (
  currentVideoId: string,
  category: string,
  limit = 5
): Promise<Video[]> => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("category", category)
      .neq("id", currentVideoId)
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Video[];
  } catch (error) {
    console.error("Error fetching related videos:", error);
    return [];
  }
};

export const incrementVideoViews = async (videoId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('increment_video_views', { video_id: videoId });
    
    if (error) {
      console.error("Error incrementing video views:", error);
      return false;
    }
    
    return data as boolean;
  } catch (error) {
    console.error("Exception incrementing video views:", error);
    return false;
  }
};
