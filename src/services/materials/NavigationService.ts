
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeNavigation } from './types';

class NavigationService {
  async getKnowledgeNavigations(): Promise<KnowledgeNavigation[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_navigation')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching knowledge navigations:', error);
        throw new Error(error.message);
      }

      return data as KnowledgeNavigation[];
    } catch (error) {
      console.error('Error in getKnowledgeNavigations service:', error);
      throw error;
    }
  }

  async createKnowledgeNavigation(name: string): Promise<KnowledgeNavigation> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      const { data, error } = await supabase
        .from('knowledge_navigation')
        .insert({
          name,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating knowledge navigation:', error);
        throw new Error(error.message);
      }

      return data as KnowledgeNavigation;
    } catch (error) {
      console.error('Error in createKnowledgeNavigation service:', error);
      throw error;
    }
  }

  async deleteKnowledgeNavigation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('knowledge_navigation')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting knowledge navigation:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteKnowledgeNavigation service:', error);
      throw error;
    }
  }

  async getNavigationNameById(navigationId: string | null): Promise<string> {
    if (!navigationId) return "Não especificado";
    
    try {
      const { data, error } = await supabase
        .from('knowledge_navigation')
        .select('name')
        .eq('id', navigationId)
        .single();
      
      if (error || !data) return "Não especificado";
      return data.name;
    } catch (error) {
      console.error('Error getting navigation name:', error);
      return "Não especificado";
    }
  }
}

export default new NavigationService();
