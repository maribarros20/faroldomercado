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
  duration?: string;
  date_added: string;
  views: number;
  created_by?: string;
  navigation_id?: string | null;
  format_id?: string | null;
  themes?: MaterialTheme[];
}

export type VideoSource = 'youtube' | 'vimeo' | 'storage';

// Função para extrair o ID do YouTube da URL
const extractYoutubeId = (url: string): string | null => {
  const youtubeIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return youtubeIdMatch && youtubeIdMatch[1] ? youtubeIdMatch[1] : null;
};

// Custom hook to fetch videos with optional filtering
export const useVideos = (categoryFilter?: string) => {
  return useQuery({
    queryKey: ['videos', categoryFilter],
    queryFn: async () => {
      try {
        // Primeiro, buscamos os vídeos com filtros
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
        
        if (!videosData || videosData.length === 0) {
          return [] as Video[];
        }
        
        // Para cada vídeo, buscamos seus temas
        const processedVideos = await Promise.all(
          videosData.map(async (video) => {
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
          })
        );
        
        return processedVideos as Video[];
      } catch (error) {
        console.error('Error in useVideos hook:', error);
        throw error;
      }
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
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('date_added', { ascending: false });

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        throw new Error(videosError.message);
      }

      if (!videos || videos.length === 0) {
        return [] as Video[];
      }

      // Para cada vídeo, buscamos seus temas
      const processedVideos = await Promise.all(
        videos.map(async (video) => {
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
        })
      );
      
      return processedVideos as Video[];
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
      
      // Buscar temas relacionados
      const { data: themeRelations, error: themeError } = await supabase
        .from('video_theme_relations')
        .select('theme_id')
        .eq('video_id', id);
      
      if (themeError) {
        console.error('Error fetching theme relations:', themeError);
        // Continuar com o vídeo sem temas
      }
      
      let themes: MaterialTheme[] = [];
      
      if (themeRelations && themeRelations.length > 0) {
        const themeIds = themeRelations.map(relation => relation.theme_id);
        
        const { data: themesData, error: themesError } = await supabase
          .from('material_themes')
          .select('*')
          .in('id', themeIds);
        
        if (!themesError && themesData) {
          themes = themesData;
        }
      }
      
      const result = {
        ...video,
        themes
      };

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

      if (!videos || videos.length === 0) {
        return [] as Video[];
      }

      // Para cada vídeo, buscamos seus temas
      const processedVideos = await Promise.all(
        videos.map(async (video) => {
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
        })
      );
      
      return processedVideos as Video[];
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

      if (!videos || videos.length === 0) {
        return [] as Video[];
      }

      // Para cada vídeo, buscamos seus temas
      const processedVideos = await Promise.all(
        videos.map(async (video) => {
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
        })
      );
      
      return processedVideos as Video[];
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

      // Estimar duração do vídeo automaticamente
      let duration = "00:00";
      if (videoData.source === 'youtube') {
        const youtubeId = extractYoutubeId(videoData.url);
        if (youtubeId) {
          // A duração será calculada em uma atualização futura
          // Por enquanto, definiremos um valor padrão
          duration = "Automático";
        }
      }

      const { data, error } = await supabase
        .from('videos')
        .insert({
          ...videoFields,
          created_by: userId || videoFields.created_by,
          views: 0,
          duration,
          learning_path: '' // Campo mantido vazio, será removido futuramente
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
      
      // Estimar duração do vídeo automaticamente se a URL foi alterada
      let updatedFields = {...videoFields};
      if (videoData.source === 'youtube' && videoData.url) {
        const youtubeId = extractYoutubeId(videoData.url);
        if (youtubeId) {
          // Aqui podemos implementar a lógica para buscar a duração real do vídeo no futuro
          updatedFields.duration = "Automático";
        }
      }

      // Remover campos desnecessários
      if ('learning_path' in updatedFields) {
        delete updatedFields.learning_path;
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

export default new VideosService();
