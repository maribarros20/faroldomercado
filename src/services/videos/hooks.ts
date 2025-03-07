
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video } from './types';
import { processVideosWithThemes } from './utils';

// Custom hook to fetch videos with optional filtering
export const useVideos = (categoryFilter?: string) => {
  return useQuery({
    queryKey: ['videos', categoryFilter],
    queryFn: async () => {
      try {
        // First, fetch videos with filters
        let query = supabase.from('videos').select('*');
        
        if (categoryFilter) {
          query = query.eq('category', categoryFilter);
        }
        
        query = query.order('date_added', { ascending: false });
        
        const { data: videosData, error: videosError } = await query;
        
        if (videosError) {
          console.error('Error fetching videos:', videosError);
          throw new Error(videosError.message);
        }
        
        return processVideosWithThemes(videosData);
      } catch (error) {
        console.error('Error in useVideos hook:', error);
        throw error;
      }
    },
    staleTime: 30000 // 30 seconds
  });
};
