
import { supabase } from '@/integrations/supabase/client';
import { MaterialTheme } from './types';

class ThemeService {
  async getMaterialThemes(): Promise<MaterialTheme[]> {
    try {
      const { data, error } = await supabase
        .from('material_themes')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching material themes:', error);
        throw new Error(error.message);
      }

      return data as MaterialTheme[];
    } catch (error) {
      console.error('Error in getMaterialThemes service:', error);
      throw error;
    }
  }

  async createMaterialTheme(name: string): Promise<MaterialTheme> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      const { data, error } = await supabase
        .from('material_themes')
        .insert({
          name,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating material theme:', error);
        throw new Error(error.message);
      }

      return data as MaterialTheme;
    } catch (error) {
      console.error('Error in createMaterialTheme service:', error);
      throw error;
    }
  }

  async deleteMaterialTheme(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('material_themes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material theme:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteMaterialTheme service:', error);
      throw error;
    }
  }
}

export default new ThemeService();
