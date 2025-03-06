
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export type FinanceIframe = {
  id: string;
  title: string;
  description?: string;
  iframe_url: string;
  plan_id?: string;
  mentor_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  plans?: { id: string; name: string };
  mentors?: { id: string; name: string };
};

export type FinanceIframeInput = {
  title: string;
  description?: string;
  iframe_url: string;
  plan_id?: string;
  mentor_id?: string;
  is_active?: boolean;
};

export const getFinanceIframes = async (): Promise<FinanceIframe[]> => {
  const { data, error } = await supabase
    .from('finance_iframes')
    .select(`
      *,
      plans(id, name),
      mentors(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar iframes financeiros:', error);
    throw new Error(`Erro ao buscar iframes financeiros: ${error.message}`);
  }

  return data || [];
};

export const getFinanceIframeById = async (id: string): Promise<FinanceIframe> => {
  const { data, error } = await supabase
    .from('finance_iframes')
    .select(`
      *,
      plans(id, name),
      mentors(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar iframe financeiro com ID ${id}:`, error);
    throw new Error(`Erro ao buscar iframe financeiro: ${error.message}`);
  }

  return data;
};

export const createFinanceIframe = async (iframe: FinanceIframeInput): Promise<FinanceIframe> => {
  const { data, error } = await supabase
    .from('finance_iframes')
    .insert([
      { ...iframe, id: uuidv4() }
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar iframe financeiro:', error);
    throw new Error(`Erro ao criar iframe financeiro: ${error.message}`);
  }

  return data;
};

export const updateFinanceIframe = async (id: string, iframe: Partial<FinanceIframeInput>): Promise<FinanceIframe> => {
  const { data, error } = await supabase
    .from('finance_iframes')
    .update({ ...iframe, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar iframe financeiro com ID ${id}:`, error);
    throw new Error(`Erro ao atualizar iframe financeiro: ${error.message}`);
  }

  return data;
};

export const deleteFinanceIframe = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('finance_iframes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir iframe financeiro com ID ${id}:`, error);
    throw new Error(`Erro ao excluir iframe financeiro: ${error.message}`);
  }
};

export const getFinanceIframesByPlanId = async (planId: string): Promise<FinanceIframe[]> => {
  const { data, error } = await supabase
    .from('finance_iframes')
    .select(`
      *,
      plans(id, name),
      mentors(id, name)
    `)
    .eq('plan_id', planId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Erro ao buscar iframes financeiros para o plano ${planId}:`, error);
    throw new Error(`Erro ao buscar iframes financeiros: ${error.message}`);
  }

  return data || [];
};
