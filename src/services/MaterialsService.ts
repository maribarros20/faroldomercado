
import { supabase } from '@/integrations/supabase/client';

export interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  thumbnail_url: string | null;
  file_url: string | null;
  date_added: string | null;
  updated_at: string | null;
  downloads: number | null;
  created_by: string | null;
}

class MaterialsService {
  async getMaterials(): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        throw new Error(error.message);
      }

      return data as unknown as Material[] || [];
    } catch (error) {
      console.error('Error in getMaterials service:', error);
      throw error;
    }
  }

  async getMaterialById(id: string): Promise<Material> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id as any)
        .single();

      if (error) {
        console.error('Error fetching material by ID:', error);
        throw new Error(error.message);
      }

      return data as unknown as Material;
    } catch (error) {
      console.error('Error in getMaterialById service:', error);
      throw error;
    }
  }

  async getMaterialsByCategory(category: string): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('category', category as any)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching materials by category:', error);
        throw new Error(error.message);
      }

      return data as unknown as Material[] || [];
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
  }): Promise<Material> {
    try {
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      const { data, error } = await supabase
        .from('materials')
        .insert({
          title: materialData.title,
          description: materialData.description,
          category: materialData.category,
          type: materialData.type,
          thumbnail_url: materialData.thumbnail_url,
          file_url: materialData.file_url,
          downloads: 0,
          created_by: userId
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating material:', error);
        throw new Error(error.message);
      }

      return data as unknown as Material;
    } catch (error) {
      console.error('Error in createMaterial service:', error);
      throw error;
    }
  }

  async updateMaterial(id: string, materialData: Partial<Material>): Promise<Material> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(materialData as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) {
        console.error('Error updating material:', error);
        throw new Error(error.message);
      }

      return data as unknown as Material;
    } catch (error) {
      console.error('Error in updateMaterial service:', error);
      throw error;
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id as any);

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
        .eq('id', id as any)
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
        .eq('id', id as any)
        .single();
      
      const currentDownloads = material ? (material.downloads || 0) : 0;
      
      const { error } = await supabase
        .from('materials')
        .update({ downloads: currentDownloads + 1 } as any)
        .eq('id', id as any);

      if (error) {
        console.error('Error incrementing downloads:', error);
      }
    } catch (error) {
      console.error('Error in incrementDownloads service:', error);
    }
  }
}

export default new MaterialsService();
