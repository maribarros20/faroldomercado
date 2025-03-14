
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ActivityChart from "@/components/progress/ActivityChart";
import AchievementsList from "@/components/progress/AchievementsList";
import LearningStats from "@/components/progress/LearningStats";
import UserPerformance from "@/components/progress/UserPerformance";
import { toast } from "@/components/ui/use-toast";
import { calculateUserLevel } from "@/hooks/use-user-performance";

const ProgressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle the back button click
  const handleGoBack = () => {
    // If there's a previous page in history, go back to it
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Default fallback to dashboard if no history
      navigate('/dashboard');
    }
  };

  // Log login activity when the page loads
  useEffect(() => {
    const logActivity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('user_activities').insert({
          user_id: session.user.id,
          activity_type: 'login',
          metadata: { page: 'progress' }
        });
      }
    };
    
    logActivity();
  }, []);

  // Fetch user activity statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-activity-stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('user_activity_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user stats:", error);
        // If the user doesn't have any activity yet, return default values
        if (error.code === 'PGRST116') {
          return {
            materials_read: 0,
            videos_watched: 0,
            quizzes_completed: 0,
            comments_made: 0,
            login_count: 1,
            total_watch_time_seconds: 0,
            active_days: 0,
            achievements_count: 0
          };
        }
        throw error;
      }
      
      return data;
    }
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching achievements:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch recent activities
  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("Error fetching recent activities:", error);
        throw error;
      }
      
      return data || [];
    }
  });
  
  const isLoading = statsLoading || achievementsLoading || activitiesLoading;

  // Cálculo XP para o usuário atual baseado nas atividades
  const calculateUserXP = () => {
    if (!userStats) return 0;
    
    const materialsXP = (userStats.materials_read || 0) * 10;
    const videosXP = (userStats.videos_watched || 0) * 15;
    const quizzesXP = (userStats.quizzes_completed || 0) * 20;
    const achievementsXP = (userStats.achievements_count || 0) * 50;
    
    return materialsXP + videosXP + quizzesXP + achievementsXP;
  };
  
  // Calcular informações de nível para exibição
  const xp = calculateUserXP();
  const userLevelInfo = calculateUserLevel(xp);

  // Handle potential error state
  if (!isLoading && !userStats) {
    toast({
      title: "Erro ao carregar dados",
      description: "Não foi possível carregar seu progresso. Tente novamente mais tarde.",
      variant: "destructive"
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-trade-blue border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando seu progresso...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User level card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">Nível {userLevelInfo.level}</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-md">
                          <div className="bg-gray-200 h-2 rounded-full">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${userLevelInfo.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {xp}/{userLevelInfo.nextLevelXp} XP
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Você precisa de mais {userLevelInfo.nextLevelXp - xp} XP para o próximo nível
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                          <path d="M12 15a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" />
                          <path d="M19 17.5c0 1.6-3.1 2.9-7 2.9s-7-1.3-7-2.9" />
                          <path d="M14 5.5a2.5 2.5 0 0 0-4 0" />
                        </svg>
                        <span>{userStats?.active_days || 0} dias de sequência</span>
                      </Badge>
                      
                      <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                          <path d="M8 13V7.5a2.5 2.5 0 0 1 5 0V13" />
                          <path d="M11 5.5V3" />
                          <path d="M11 21v-8" />
                          <path d="M11.998 21.25c1.074 0 2.298-1.025 2.298-2.25 0-1.276-.858-2.25-2.298-2.25-1.073 0-2.298 1.05-2.298 2.25 0 1.275.858 2.25 2.298 2.25Z" />
                        </svg>
                        <span>{userStats?.total_watch_time_seconds ? Math.round(userStats.total_watch_time_seconds / 60) : 0} minutos de estudo</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Performance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <UserPerformance />
            </motion.div>

            {/* Stats and charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="md:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Atividades Recentes</CardTitle>
                    <CardDescription>Seu histórico de aprendizado nas últimas semanas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityChart activities={recentActivities || []} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                    <CardDescription>Seu desempenho por números</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LearningStats stats={userStats || {
                      materials_read: 0,
                      videos_watched: 0,
                      quizzes_completed: 0,
                      total_watch_time_seconds: 0
                    }} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Conquistas</CardTitle>
                  <CardDescription>Conquistas que você desbloqueou</CardDescription>
                </CardHeader>
                <CardContent>
                  <AchievementsList achievements={achievements || []} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
