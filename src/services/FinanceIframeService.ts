
import { supabase } from '@/integrations/supabase/client';

export interface FinanceIframe {
  id: string;
  title: string;
  description: string | null;
  iframe_url: string;
  mentor_id: string | null;
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

class FinanceIframeService {
  async getIframes(): Promise<FinanceIframe[]> {
    try {
      const { data, error } = await supabase
        .from('finance_iframes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar iframes:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço getIframes:', error);
      throw error;
    }
  }

  async getIframeById(id: string): Promise<FinanceIframe> {
    try {
      const { data, error } = await supabase
        .from('finance_iframes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar iframe por ID:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço getIframeById:', error);
      throw error;
    }
  }

  async createIframe(iframe: Omit<FinanceIframe, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<FinanceIframe> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      const { data, error } = await supabase
        .from('finance_iframes')
        .insert({
          ...iframe,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar iframe:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço createIframe:', error);
      throw error;
    }
  }

  async updateIframe(id: string, iframe: Partial<Omit<FinanceIframe, 'id' | 'created_at' | 'created_by'>>): Promise<FinanceIframe> {
    try {
      const updateData = {
        ...iframe,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('finance_iframes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar iframe:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço updateIframe:', error);
      throw error;
    }
  }

  async deleteIframe(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('finance_iframes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir iframe:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Erro no serviço deleteIframe:', error);
      throw error;
    }
  }

  async getIframesByMentorAndPlan(mentorId?: string, planId?: string): Promise<FinanceIframe[]> {
    try {
      let query = supabase
        .from('finance_iframes')
        .select('*')
        .eq('is_active', true);
      
      if (mentorId) {
        query = query.eq('mentor_id', mentorId);
      }
      
      if (planId) {
        query = query.eq('plan_id', planId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar iframes por mentor e plano:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço getIframesByMentorAndPlan:', error);
      throw error;
    }
  }
}

export default new FinanceIframeService();
