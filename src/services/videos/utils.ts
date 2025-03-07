
import { supabase } from '@/integrations/supabase/client';
import { Video, VideoSource } from './types';
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
