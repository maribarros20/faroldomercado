
import { supabase } from '@/integrations/supabase/client';
import { Material } from './types';

class MaterialsProgressService {
  /**
   * Get materials that are in progress for the current user
   */
  async getUserInProgressMaterials(): Promise<Material[]> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('Error getting session or user not logged in:', sessionError);
        return [];
      }
      
      const userId = sessionData.session.user.id;
      
      // Using the database function to get in-progress materials
      const { data, error } = await supabase
        .rpc('get_user_in_progress_materials', { user_uuid: userId });
      
      if (error) {
        console.error('Error fetching in-progress materials:', error);
        return [];
      }
      
      if (!data) {
        return [];
      }
      
      // If user is logged in, check which materials are liked by the user
      const { data: likedMaterials, error: likesError } = await supabase
        .from('material_likes')
        .select('material_id')
        .eq('user_id', userId);

      // Add the is_liked_by_user property to each material
      const materialsWithLikes = data.map((material: any) => {
        return {
          ...material,
          is_liked_by_user: likedMaterials ? 
            likedMaterials.some(like => like.material_id === material.id) : 
            false
        };
      });
      
      return materialsWithLikes as Material[];
    } catch (error) {
      console.error('Error in getUserInProgressMaterials service:', error);
      return [];
    }
  }
  
  /**
   * Get materials that are completed by the current user
   */
  async getUserCompletedMaterials(): Promise<Material[]> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('Error getting session or user not logged in:', sessionError);
        return [];
      }
      
      const userId = sessionData.session.user.id;
      
      // Using the database function to get completed materials
      const { data, error } = await supabase
        .rpc('get_user_completed_materials', { user_uuid: userId });
      
      if (error) {
        console.error('Error fetching completed materials:', error);
        return [];
      }
      
      if (!data) {
        return [];
      }
      
      // If user is logged in, check which materials are liked by the user
      const { data: likedMaterials, error: likesError } = await supabase
        .from('material_likes')
        .select('material_id')
        .eq('user_id', userId);

      // Add the is_liked_by_user property to each material
      const materialsWithLikes = data.map((material: any) => {
        return {
          ...material,
          is_liked_by_user: likedMaterials ? 
            likedMaterials.some(like => like.material_id === material.id) : 
            false
        };
      });
      
      return materialsWithLikes as Material[];
    } catch (error) {
      console.error('Error in getUserCompletedMaterials service:', error);
      return [];
    }
  }
  
  /**
   * Update progress for a material
   */
  async updateMaterialProgress(materialId: string, progress: number): Promise<boolean> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('Error getting session or user not logged in:', sessionError);
        return false;
      }
      
      const userId = sessionData.session.user.id;
      
      // Get the material to get its navigation_id
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .select('navigation_id')
        .eq('id', materialId)
        .single();
        
      if (materialError) {
        console.error('Error fetching material:', materialError);
        return false;
      }
      
      // Check if there's already a progress record
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_material_progress')
        .select('*')  // Select all columns to get the full record
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .maybeSingle();
        
      const isCompleted = progress >= 100;
      
      if (!existingProgress) {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_material_progress')
          .insert({
            user_id: userId,
            material_id: materialId,
            navigation_id: material?.navigation_id,
            progress_percentage: progress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });
          
        if (insertError) {
          console.error('Error creating progress record:', insertError);
          return false;
        }
      } else {
        // Update existing progress record
        const { error: updateError } = await supabase
          .from('user_material_progress')
          .update({
            progress_percentage: progress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : existingProgress.is_completed ? existingProgress.completed_at : null,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
          
        if (updateError) {
          console.error('Error updating progress record:', updateError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateMaterialProgress service:', error);
      return false;
    }
  }
  
  /**
   * Get progress for a specific material
   */
  async getMaterialProgress(materialId: string): Promise<number> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        return 0;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('user_material_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .maybeSingle();
        
      if (error || !data) {
        return 0;
      }
      
      return data.progress_percentage;
    } catch (error) {
      console.error('Error in getMaterialProgress service:', error);
      return 0;
    }
  }
}

export default new MaterialsProgressService();
