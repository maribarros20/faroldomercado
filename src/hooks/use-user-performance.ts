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
  experience_points?: number;
  study_time_minutes?: number;
  level?: number;
  next_level_xp?: number;
}

export const calculateUserLevel = (xp: number) => {
  let level = 1;
  let xpRequired = 100;
  let totalXpRequired = xpRequired;
  
  while (xp >= totalXpRequired) {
    level++;
    xpRequired = Math.round(xpRequired * 1.2);
    totalXpRequired += xpRequired;
  }
  
  const nextLevelXp = totalXpRequired;
  const currentLevelXp = nextLevelXp - xpRequired;
  
  return {
    level,
    currentXp: xp,
    currentLevelXp,
    nextLevelXp,
    progress: Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
  };
};

export const calculateExperiencePoints = (
  materialsCompleted: number, 
  videosWatched: number, 
  quizzesCompleted: number,
  quizzesPassed: number,
  achievementsCount: number
) => {
  const XP_PER_MATERIAL = 10;
  const XP_PER_VIDEO = 15;
  const XP_PER_QUIZ_COMPLETED = 20;
  const XP_PER_QUIZ_PASSED = 30;
  const XP_PER_ACHIEVEMENT = 50;
  
  return (
    materialsCompleted * XP_PER_MATERIAL +
    videosWatched * XP_PER_VIDEO +
    quizzesCompleted * XP_PER_QUIZ_COMPLETED +
    quizzesPassed * XP_PER_QUIZ_PASSED +
    achievementsCount * XP_PER_ACHIEVEMENT
  );
};

export const useUserPerformance = () => {
  return useQuery({
    queryKey: ['user-performance'],
    queryFn: async (): Promise<UserPerformance[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Não autenticado");
      }
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }
      
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*');
      
      if (activitiesError) {
        console.error("Erro ao buscar atividades:", activitiesError);
        throw activitiesError;
      }
      
      const { data: progress, error: progressError } = await supabase
        .from('user_material_progress')
        .select('*');
      
      if (progressError) {
        console.error("Erro ao buscar progresso:", progressError);
        throw progressError;
      }
      
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*');
      
      if (achievementsError) {
        console.error("Erro ao buscar conquistas:", achievementsError);
        throw achievementsError;
      }
      
      const usersPerformance: UserPerformance[] = profiles.map(profile => {
        const userActivities = activities.filter(a => a.user_id === profile.id);
        
        const materialsRead = userActivities.filter(a => a.activity_type === 'material_read').length;
        const videosWatched = userActivities.filter(a => a.activity_type === 'video_watched').length;
        const quizzesCompleted = userActivities.filter(a => a.activity_type === 'quiz_completed').length;
        
        const quizzesPassed = userActivities.filter(a => {
          if (a.activity_type === 'quiz_completed' && a.metadata) {
            const metadata = a.metadata;
            if (typeof metadata === 'object' && metadata !== null && 'passed' in metadata) {
              return metadata.passed === true;
            }
          }
          return false;
        }).length;
        
        const quizScores = userActivities
          .filter(a => {
            if (a.activity_type === 'quiz_completed' && a.metadata) {
              const metadata = a.metadata;
              return typeof metadata === 'object' && metadata !== null && 'score' in metadata;
            }
            return false;
          })
          .map(a => {
            const metadata = a.metadata as Record<string, any>;
            return typeof metadata.score === 'number' ? metadata.score : 0;
          });
        
        const quizzesScore = quizScores.length > 0 
          ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) 
          : 0;
        
        const activeDays = new Set(
          userActivities.map(a => new Date(a.created_at).toISOString().split('T')[0])
        ).size;
        
        const achievementsCount = achievements.filter(a => a.user_id === profile.id).length;
        
        const userProgress = progress.filter(p => p.user_id === profile.id);
        const completedCount = userProgress.filter(p => p.is_completed).length;
        const totalProgress = userProgress.length > 0 
          ? Math.round((completedCount / userProgress.length) * 100) 
          : 0;
        
        const studyTimeMinutes = userActivities.reduce((total, activity) => {
          if (activity.metadata && typeof activity.metadata === 'object' && 
              'duration_minutes' in activity.metadata && 
              typeof activity.metadata.duration_minutes === 'number') {
            return total + activity.metadata.duration_minutes;
          }
          return total;
        }, 0);
        
        const experiencePoints = calculateExperiencePoints(
          materialsRead,
          videosWatched,
          quizzesCompleted,
          quizzesPassed,
          achievementsCount
        );
        
        const levelInfo = calculateUserLevel(experiencePoints);
        
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
          last_name: profile.last_name,
          experience_points: experiencePoints,
          study_time_minutes: studyTimeMinutes,
          level: levelInfo.level,
          next_level_xp: levelInfo.nextLevelXp
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
      
      const { data: stats, error: statsError } = await supabase
        .from('user_activity_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error("Erro ao buscar estatísticas:", statsError);
        throw statsError;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw profileError;
      }
      
      const { data: progress, error: progressError } = await supabase
        .from('user_material_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (progressError) {
        console.error("Erro ao buscar progresso:", progressError);
        throw progressError;
      }
      
      const { data: userActivities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('metadata, duration_seconds')
        .eq('user_id', userId);
        
      if (activitiesError) {
        console.error("Erro ao buscar atividades:", activitiesError);
      }
      
      let studyTimeMinutes = 0;
      if (userActivities) {
        studyTimeMinutes = userActivities.reduce((total, activity) => {
          const durationSeconds = activity.duration_seconds || 0;
          
          let metadataDuration = 0;
          if (activity.metadata && typeof activity.metadata === 'object' && 
              'duration_minutes' in activity.metadata && 
              typeof activity.metadata.duration_minutes === 'number') {
            metadataDuration = activity.metadata.duration_minutes * 60;
          }
          
          return total + (durationSeconds > 0 ? durationSeconds / 60 : metadataDuration / 60);
        }, 0);
      }
      
      const materialsCompleted = statsData.materials_read || 0;
      const videosWatched = statsData.videos_watched || 0;
      const quizzesCompleted = statsData.quizzes_completed || 0;
      const quizzesPassed = Math.round(quizzesCompleted * 0.7);
      
      const experiencePoints = calculateExperiencePoints(
        materialsCompleted,
        videosWatched,
        quizzesCompleted,
        quizzesPassed,
        achievements?.length || 0
      );
      
      const levelInfo = calculateUserLevel(experiencePoints);
      
      return {
        id: userId,
        user_id: userId,
        materials_completed: materialsCompleted,
        videos_watched: videosWatched,
        quizzes_completed: quizzesCompleted,
        quizzes_passed: quizzesPassed,
        quizzes_score: 0,
        active_days: statsData.active_days || 0,
        achievements_count: achievements?.length || 0,
        total_progress: totalProgress,
        tipo_de_conta: profile?.tipo_de_conta || 'trader',
        username: profile?.username,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        experience_points: experiencePoints,
        study_time_minutes: Math.round(studyTimeMinutes),
        level: levelInfo.level,
        next_level_xp: levelInfo.nextLevelXp
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

