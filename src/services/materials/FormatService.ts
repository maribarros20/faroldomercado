
import { supabase } from '@/integrations/supabase/client';
import { MaterialFormat } from './types';

class FormatService {
  async getMaterialFormats(): Promise<MaterialFormat[]> {
    try {
      const { data, error } = await supabase
        .from('material_formats')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching material formats:', error);
        throw new Error(error.message);
      }

      return data as MaterialFormat[];
    } catch (error) {
      console.error('Error in getMaterialFormats service:', error);
      throw error;
    }
  }

  async createMaterialFormat(name: string): Promise<MaterialFormat> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      const { data, error } = await supabase
        .from('material_formats')
        .insert({
          name,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating material format:', error);
        throw new Error(error.message);
      }

      return data as MaterialFormat;
    } catch (error) {
      console.error('Error in createMaterialFormat service:', error);
      throw error;
    }
  }

  async deleteMaterialFormat(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('material_formats')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material format:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteMaterialFormat service:', error);
      throw error;
    }
  }

  async getFormatNameById(formatId: string | null): Promise<string> {
    if (!formatId) return "Não especificado";
    
    try {
      const { data, error } = await supabase
        .from('material_formats')
        .select('name')
        .eq('id', formatId)
        .single();
      
      if (error || !data) return "Não especificado";
      return data.name;
    } catch (error) {
      console.error('Error getting format name:', error);
      return "Não especificado";
    }
  }
}

export default new FormatService();
