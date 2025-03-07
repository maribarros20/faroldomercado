
import { supabase } from '@/integrations/supabase/client';
import { MaterialCategory } from './types';

class CategoryService {
  async getMaterialCategories(): Promise<MaterialCategory[]> {
    try {
      const { data, error } = await supabase
        .from('material_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching material categories:', error);
        throw new Error(error.message);
      }

      return data as MaterialCategory[];
    } catch (error) {
      console.error('Error in getMaterialCategories service:', error);
      throw error;
    }
  }

  async createMaterialCategory(name: string): Promise<MaterialCategory> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      const { data, error } = await supabase
        .from('material_categories')
        .insert({
          name,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating material category:', error);
        throw new Error(error.message);
      }

      return data as MaterialCategory;
    } catch (error) {
      console.error('Error in createMaterialCategory service:', error);
      throw error;
    }
  }

  async deleteMaterialCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('material_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material category:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteMaterialCategory service:', error);
      throw error;
    }
  }
}

export default new CategoryService();
