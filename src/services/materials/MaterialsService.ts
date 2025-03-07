
import { supabase } from '@/integrations/supabase/client';
import { Material } from './types';

class MaterialsService {
  async getMaterials(): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*, material_theme_relations(theme_id, material_themes(id, name))')
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        throw new Error(error.message);
      }

      // Process the data to match our interface
      const processedData = data.map(material => {
        const themes = material.material_theme_relations 
          ? material.material_theme_relations
            .filter(relation => relation.material_themes)
            .map(relation => relation.material_themes) 
          : [];
        
        const result = {
          ...material,
          themes
        };
        
        delete result.material_theme_relations;
        return result;
      });

      return processedData as unknown as Material[] || [];
    } catch (error) {
      console.error('Error in getMaterials service:', error);
      throw error;
    }
  }

  async getMaterialById(id: string): Promise<Material> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*, material_theme_relations(theme_id, material_themes(id, name))')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching material by ID:', error);
        throw new Error(error.message);
      }

      // Process themes
      const themes = data.material_theme_relations 
        ? data.material_theme_relations
          .filter(relation => relation.material_themes)
          .map(relation => relation.material_themes) 
        : [];
      
      const result = {
        ...data,
        themes
      };
      
      delete result.material_theme_relations;

      return result as unknown as Material;
    } catch (error) {
      console.error('Error in getMaterialById service:', error);
      throw error;
    }
  }

  async getMaterialsByCategory(category: string): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*, material_theme_relations(theme_id, material_themes(id, name))')
        .eq('category', category)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching materials by category:', error);
        throw new Error(error.message);
      }

      // Process the data to match our interface
      const processedData = data.map(material => {
        const themes = material.material_theme_relations 
          ? material.material_theme_relations
            .filter(relation => relation.material_themes)
            .map(relation => relation.material_themes) 
          : [];
        
        const result = {
          ...material,
          themes
        };
        
        delete result.material_theme_relations;
        return result;
      });

      return processedData as unknown as Material[] || [];
    } catch (error) {
      console.error('Error in getMaterialsByCategory service:', error);
      throw error;
    }
  }

  async createMaterial(materialData: {
    title: string;
    description: string | null;
    category: string;
    type: string;
    thumbnail_url: string | null;
    file_url: string | null;
    navigation_id?: string | null;
    format_id?: string | null;
    themes?: string[];
  }): Promise<Material> {
    try {
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      // Separate themes from material data
      const { themes, ...materialFields } = materialData;
      
      // Insert material
      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...materialFields,
          downloads: 0,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating material:', error);
        throw new Error(error.message);
      }

      // If themes are provided, create theme relations
      if (themes && themes.length > 0 && data) {
        const themeRelations = themes.map(themeId => ({
          material_id: data.id,
          theme_id: themeId
        }));

        const { error: relationsError } = await supabase
          .from('material_theme_relations')
          .insert(themeRelations);

        if (relationsError) {
          console.error('Error creating theme relations:', relationsError);
          // We don't throw here to avoid losing the material creation
        }
      }

      return data as unknown as Material;
    } catch (error) {
      console.error('Error in createMaterial service:', error);
      throw error;
    }
  }

  async updateMaterial(id: string, materialData: {
    title?: string;
    description?: string | null;
    category?: string;
    type?: string;
    thumbnail_url?: string | null;
    file_url?: string | null;
    navigation_id?: string | null;
    format_id?: string | null;
    themes?: string[];
  }): Promise<Material> {
    try {
      // Separate themes from material data
      const { themes, ...materialFields } = materialData;
      
      // Update material
      const { data, error } = await supabase
        .from('materials')
        .update(materialFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating material:', error);
        throw new Error(error.message);
      }

      // If themes are provided, update theme relations
      if (themes && data) {
        // First delete existing relations
        const { error: deleteError } = await supabase
          .from('material_theme_relations')
          .delete()
          .eq('material_id', id);

        if (deleteError) {
          console.error('Error deleting theme relations:', deleteError);
          // We don't throw here to avoid losing the material update
        }

        // Then create new relations if there are themes
        if (themes.length > 0) {
          const themeRelations = themes.map(themeId => ({
            material_id: data.id,
            theme_id: themeId
          }));

          const { error: insertError } = await supabase
            .from('material_theme_relations')
            .insert(themeRelations);

          if (insertError) {
            console.error('Error creating theme relations:', insertError);
            // We don't throw here to avoid losing the material update
          }
        }
      }

      return data as unknown as Material;
    } catch (error) {
      console.error('Error in updateMaterial service:', error);
      throw error;
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      // Delete theme relations first (though CASCADE should handle this)
      await supabase
        .from('material_theme_relations')
        .delete()
        .eq('material_id', id);
        
      // Then delete the material
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteMaterial service:', error);
      throw error;
    }
  }

  async downloadMaterial(id: string): Promise<{ url: string | null; filename: string | null }> {
    try {
      // First get the material to get file URL
      const { data, error } = await supabase
        .from('materials')
        .select('file_url, thumbnail_url')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error getting material for download:', error);
        return { url: null, filename: null };
      }
      
      // If file_url is a Supabase storage URL, get a public URL
      if (data.file_url && data.file_url.includes('storage')) {
        // Extract path from storage URL
        const path = data.file_url.split('/').slice(-2).join('/');
        const filename = path.split('/').pop() || 'download';
        
        return { url: data.file_url, filename };
      }
      
      // If thumbnail_url is a Supabase storage URL, get a public URL
      if (data.thumbnail_url && data.thumbnail_url.includes('storage')) {
        // Extract path from storage URL
        const path = data.thumbnail_url.split('/').slice(-2).join('/');
        const filename = path.split('/').pop() || 'download';
        
        return { url: data.thumbnail_url, filename };
      }

      return { 
        url: data.file_url || data.thumbnail_url || null, 
        filename: 'download' 
      };
    } catch (error) {
      console.error('Error in downloadMaterial service:', error);
      return { url: null, filename: null };
    }
  }

  async incrementDownloads(id: string): Promise<void> {
    try {
      const { data: material } = await supabase
        .from('materials')
        .select('downloads')
        .eq('id', id)
        .single();
      
      const currentDownloads = material ? (material.downloads || 0) : 0;
      
      const { error } = await supabase
        .from('materials')
        .update({ downloads: currentDownloads + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing downloads:', error);
      }
    } catch (error) {
      console.error('Error in incrementDownloads service:', error);
    }
  }
}

export default new MaterialsService();
