
import { supabase } from '@/integrations/supabase/client';

export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  thumbnail_url: string | null;
  file_url: string | null;
  date_added: string;
  created_by: string | null;
  downloads: number;
}

export type MaterialType = 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'presentation' | 'other';

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

      return data || [];
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching material by ID:', error);
        throw new Error(error.message);
      }

      return data;
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
        .eq('category', category)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching materials by category:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMaterialsByCategory service:', error);
      throw error;
    }
  }

  async createMaterial(
    materialData: Omit<Material, 'id' | 'date_added' | 'downloads'>,
    file?: File,
    thumbnail?: File
  ): Promise<Material> {
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      let fileUrl = materialData.file_url;
      let thumbnailUrl = materialData.thumbnail_url;

      // Check if materials bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const materialsBucket = buckets?.find(bucket => bucket.name === 'materials');
      
      if (!materialsBucket) {
        await supabase.storage.createBucket('materials', {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });
      }

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${materialData.type}/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('materials')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw new Error(uploadError.message);
        }

        // Get public URL for the file
        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
      }

      // Upload thumbnail if provided
      if (thumbnail) {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbName = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbName}`;

        const { error: thumbError } = await supabase.storage
          .from('materials')
          .upload(thumbPath, thumbnail);

        if (thumbError) {
          console.error('Error uploading thumbnail:', thumbError);
          throw new Error(thumbError.message);
        }

        // Get public URL for the thumbnail
        const { data: thumbUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(thumbPath);

        thumbnailUrl = thumbUrlData.publicUrl;
      }

      // Create material record in the database
      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...materialData,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          created_by: userId,
          downloads: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating material:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in createMaterial service:', error);
      throw error;
    }
  }

  async updateMaterial(
    id: string, 
    materialData: Partial<Material>,
    file?: File,
    thumbnail?: File
  ): Promise<Material> {
    try {
      const updates: Partial<Material> = { ...materialData };

      // Upload new file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${materialData.type || 'other'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw new Error(uploadError.message);
        }

        // Get public URL for the file
        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);

        updates.file_url = publicUrlData.publicUrl;
      }

      // Upload new thumbnail if provided
      if (thumbnail) {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbName = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbName}`;

        const { error: thumbError } = await supabase.storage
          .from('materials')
          .upload(thumbPath, thumbnail);

        if (thumbError) {
          console.error('Error uploading thumbnail:', thumbError);
          throw new Error(thumbError.message);
        }

        // Get public URL for the thumbnail
        const { data: thumbUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(thumbPath);

        updates.thumbnail_url = thumbUrlData.publicUrl;
      }

      // Update material record in the database
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating material:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in updateMaterial service:', error);
      throw error;
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      // Get material info first to delete associated files
      const { data: material, error: getError } = await supabase
        .from('materials')
        .select('file_url, thumbnail_url')
        .eq('id', id)
        .single();

      if (getError) {
        console.error('Error fetching material for deletion:', getError);
        throw new Error(getError.message);
      }

      // Delete the material record from the database
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material:', error);
        throw new Error(error.message);
      }

      // Delete associated files if they exist
      if (material) {
        if (material.file_url) {
          // Extract the path from the URL
          const filePath = material.file_url.split('/').slice(-2).join('/');
          await supabase.storage.from('materials').remove([filePath]);
        }
        
        if (material.thumbnail_url) {
          // Extract the path from the URL
          const thumbPath = material.thumbnail_url.split('/').slice(-2).join('/');
          await supabase.storage.from('materials').remove([thumbPath]);
        }
      }
    } catch (error) {
      console.error('Error in deleteMaterial service:', error);
      throw error;
    }
  }

  async incrementDownloads(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_material_downloads', { material_id: id });
    } catch (error) {
      console.error('Error incrementing downloads:', error);
    }
  }
}

export default new MaterialsService();
