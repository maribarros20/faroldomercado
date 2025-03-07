
import { supabase } from '@/integrations/supabase/client';
import { Material } from './types';

class MaterialsProgressService {
  // Get all materials that are in progress for the current user
  async getUserInProgressMaterials(): Promise<Material[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        throw new Error('You must be logged in to see your in-progress materials');
      }

      // Call the function we created to get in-progress materials
      const { data, error } = await supabase.rpc(
        'get_user_in_progress_materials',
        { user_uuid: userId }
      );

      if (error) {
        console.error('Error fetching in-progress materials:', error);
        throw new Error(error.message);
      }

      // Process the data to match our interface
      return data as unknown as Material[] || [];
    } catch (error) {
      console.error('Error in getUserInProgressMaterials service:', error);
      throw error;
    }
  }

  // Get all materials that are completed for the current user
  async getUserCompletedMaterials(): Promise<Material[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        throw new Error('You must be logged in to see your completed materials');
      }

      // Call the function we created to get completed materials
      const { data, error } = await supabase.rpc(
        'get_user_completed_materials',
        { user_uuid: userId }
      );

      if (error) {
        console.error('Error fetching completed materials:', error);
        throw new Error(error.message);
      }

      // Process the data to match our interface
      return data as unknown as Material[] || [];
    } catch (error) {
      console.error('Error in getUserCompletedMaterials service:', error);
      throw error;
    }
  }

  // Update progress for a material
  async updateMaterialProgress(
    materialId: string, 
    navigationId: string | null, 
    progressPercentage: number, 
    isCompleted: boolean = false
  ): Promise<void> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        throw new Error('You must be logged in to update material progress');
      }

      // Check if a progress record already exists for this user and material
      const { data: existingProgress } = await supabase
        .from('user_material_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .single();

      const now = new Date().toISOString();
      
      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_material_progress')
          .update({
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
            completed_at: isCompleted ? now : null,
            last_accessed_at: now
          })
          .eq('id', existingProgress.id);

        if (error) {
          console.error('Error updating material progress:', error);
          throw new Error(error.message);
        }
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_material_progress')
          .insert({
            user_id: userId,
            material_id: materialId,
            navigation_id: navigationId,
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
            completed_at: isCompleted ? now : null,
            started_at: now,
            last_accessed_at: now
          });

        if (error) {
          console.error('Error creating material progress:', error);
          throw new Error(error.message);
        }
      }

      // Track this activity
      await supabase.from("user_activities").insert({
        user_id: userId,
        activity_type: isCompleted ? "complete_material" : "progress_material",
        content_id: materialId,
        metadata: { 
          material_id: materialId,
          progress_percentage: progressPercentage,
          navigation_id: navigationId
        }
      } as any);

    } catch (error) {
      console.error('Error in updateMaterialProgress service:', error);
      throw error;
    }
  }

  // Get progress for a specific material
  async getMaterialProgress(materialId: string): Promise<{
    progressPercentage: number;
    isCompleted: boolean;
    lastAccessed: string | null;
  }> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        return { progressPercentage: 0, isCompleted: false, lastAccessed: null };
      }

      const { data, error } = await supabase
        .from('user_material_progress')
        .select('progress_percentage, is_completed, last_accessed_at')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No progress record found
          return { progressPercentage: 0, isCompleted: false, lastAccessed: null };
        }
        console.error('Error fetching material progress:', error);
        throw new Error(error.message);
      }

      return {
        progressPercentage: data.progress_percentage,
        isCompleted: data.is_completed,
        lastAccessed: data.last_accessed_at
      };
    } catch (error) {
      console.error('Error in getMaterialProgress service:', error);
      return { progressPercentage: 0, isCompleted: false, lastAccessed: null };
    }
  }

  // Get progress statistics for a navigation path
  async getNavigationProgress(navigationId: string): Promise<{
    totalMaterials: number;
    completedMaterials: number;
    inProgressMaterials: number;
    progressPercentage: number;
  }> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        return {
          totalMaterials: 0,
          completedMaterials: 0,
          inProgressMaterials: 0,
          progressPercentage: 0
        };
      }

      const { data, error } = await supabase.rpc(
        'get_navigation_progress',
        { 
          user_uuid: userId,
          nav_id: navigationId
        }
      );

      if (error) {
        console.error('Error fetching navigation progress:', error);
        throw new Error(error.message);
      }

      return {
        totalMaterials: data[0].total_materials,
        completedMaterials: data[0].completed_materials,
        inProgressMaterials: data[0].in_progress_materials,
        progressPercentage: data[0].progress_percentage
      };
    } catch (error) {
      console.error('Error in getNavigationProgress service:', error);
      return {
        totalMaterials: 0,
        completedMaterials: 0,
        inProgressMaterials: 0,
        progressPercentage: 0
      };
    }
  }
}

export default new MaterialsProgressService();
