
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserPerformance {
  id: string;
  user_id: string;
  materials_completed: number;
  videos_watched: number;
  quizzes_completed: number;
  quizzes_passed: number;
  quizzes_score: number;
  active_days: number;
  achievements_count: number;
  total_progress: number;
  tipo_de_conta: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export const useUserPerformance = () => {
  return useQuery({
    queryKey: ['user-performance'],
    queryFn: async (): Promise<UserPerformance[]> => {
      // Em um cenário real, você teria uma visualização materializada 
      // ou consulta complexa para calcular isso
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Não autenticado");
      }
      
      // Primeiro, obtemos os perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }
      
      // Obtemos as atividades do usuário
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*');
      
      if (activitiesError) {
        console.error("Erro ao buscar atividades:", activitiesError);
        throw activitiesError;
      }
      
      // Obtemos o progresso dos materiais
      const { data: progress, error: progressError } = await supabase
        .from('user_material_progress')
        .select('*');
      
      if (progressError) {
        console.error("Erro ao buscar progresso:", progressError);
        throw progressError;
      }
      
      // Obtemos as conquistas
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*');
      
      if (achievementsError) {
        console.error("Erro ao buscar conquistas:", achievementsError);
        throw achievementsError;
      }
      
      // Agora computamos o desempenho para cada usuário
      const usersPerformance: UserPerformance[] = profiles.map(profile => {
        // Filtra atividades para este usuário
        const userActivities = activities.filter(a => a.user_id === profile.id);
        
        // Conta materiais lidos
        const materialsRead = userActivities.filter(a => a.activity_type === 'material_read').length;
        
        // Conta vídeos assistidos
        const videosWatched = userActivities.filter(a => a.activity_type === 'video_watched').length;
        
        // Conta quizzes completados
        const quizzesCompleted = userActivities.filter(a => a.activity_type === 'quiz_completed').length;
        
        // Conta quizzes passados (supondo que tenha um campo indicando sucesso no metadata)
        const quizzesPassed = userActivities.filter(a => 
          a.activity_type === 'quiz_completed' && 
          a.metadata && 
          a.metadata.passed === true
        ).length;
        
        // Calcula score médio (supondo que tenha um campo score no metadata)
        const quizScores = userActivities
          .filter(a => a.activity_type === 'quiz_completed' && a.metadata && a.metadata.score !== undefined)
          .map(a => a.metadata.score as number);
        
        const quizzesScore = quizScores.length > 0 
          ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) 
          : 0;
        
        // Conta dias ativos (dias únicos com atividades)
        const activeDays = new Set(
          userActivities.map(a => new Date(a.created_at).toISOString().split('T')[0])
        ).size;
        
        // Conta conquistas
        const achievementsCount = achievements.filter(a => a.user_id === profile.id).length;
        
        // Calcula progresso total (completados / total)
        const userProgress = progress.filter(p => p.user_id === profile.id);
        const completedCount = userProgress.filter(p => p.is_completed).length;
        const totalProgress = userProgress.length > 0 
          ? Math.round((completedCount / userProgress.length) * 100) 
          : 0;
        
        return {
          id: profile.id,
          user_id: profile.id,
          materials_completed: materialsRead,
          videos_watched: videosWatched,
          quizzes_completed: quizzesCompleted,
          quizzes_passed: quizzesPassed,
          quizzes_score: quizzesScore,
          active_days: activeDays,
          achievements_count: achievementsCount,
          total_progress: totalProgress,
          tipo_de_conta: profile.tipo_de_conta || 'trader',
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name
        };
      });
      
      return usersPerformance;
    },
    meta: {
      onError: (error: any) => {
        console.error("Erro ao buscar desempenho dos usuários:", error);
      }
    }
  });
};

// Hook para obter o desempenho de um único usuário
export const useCurrentUserPerformance = (userId?: string) => {
  return useQuery({
    queryKey: ['user-performance', userId],
    queryFn: async (): Promise<UserPerformance | null> => {
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return null;
        }
        userId = session.user.id;
      }
      
      // Obter estatísticas do usuário
      const { data: stats, error: statsError } = await supabase
        .from('user_activity_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error("Erro ao buscar estatísticas:", statsError);
        throw statsError;
      }
      
      // Obter perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw profileError;
      }
      
      // Obter progresso de materiais
      const { data: progress, error: progressError } = await supabase
        .from('user_material_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (progressError) {
        console.error("Erro ao buscar progresso:", progressError);
        throw progressError;
      }
      
      // Calcular progresso total
      const completedCount = progress?.filter(p => p.is_completed).length || 0;
      const totalProgress = progress && progress.length > 0 
        ? Math.round((completedCount / progress.length) * 100) 
        : 0;
      
      // Obter conquistas
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);
      
      if (achievementsError) {
        console.error("Erro ao buscar conquistas:", achievementsError);
        throw achievementsError;
      }
      
      const statsData = stats || {
        materials_read: 0,
        videos_watched: 0,
        quizzes_completed: 0,
        active_days: 0
      };
      
      return {
        id: userId,
        user_id: userId,
        materials_completed: statsData.materials_read || 0,
        videos_watched: statsData.videos_watched || 0,
        quizzes_completed: statsData.quizzes_completed || 0,
        quizzes_passed: 0, // Precisaríamos de dados reais
        quizzes_score: 0, // Precisaríamos de dados reais
        active_days: statsData.active_days || 0,
        achievements_count: achievements?.length || 0,
        total_progress: totalProgress,
        tipo_de_conta: profile?.tipo_de_conta || 'trader',
        username: profile?.username,
        first_name: profile?.first_name,
        last_name: profile?.last_name
      };
    },
    enabled: !!userId,
    meta: {
      onError: (error: any) => {
        console.error("Erro ao buscar desempenho do usuário:", error);
      }
    }
  });
};
