
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Video, Award, CheckCircle, Clock, 
  Flame, Calendar, TrendingUp, BarChart2, Trophy 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserProgressStats } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementCard from "@/components/progress/AchievementCard";
import ActivityChart from "@/components/progress/ActivityChart";
import StreakCalendar from "@/components/progress/StreakCalendar";

const UserProgressPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch user progress data
  const { data: progressStats, isLoading } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }

      const userId = session.user.id;
      
      // Fetch activity data
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId);
        
      if (activitiesError) {
        throw activitiesError;
      }
      
      // Calculate statistics
      const materialActivities = activities?.filter(a => a.activity_type === 'read_material') || [];
      const videoActivities = activities?.filter(a => a.activity_type === 'watch_video') || [];
      const quizActivities = activities?.filter(a => a.activity_type === 'complete_quiz') || [];
      
      // Get unique content IDs to count completed items
      const uniqueMaterials = new Set(materialActivities.map(a => a.content_id));
      const uniqueVideos = new Set(videoActivities.map(a => a.content_id));
      const uniqueQuizzes = new Set(quizActivities.map(a => a.content_id));
      
      // Calculate total time spent (in minutes)
      const totalSeconds = activities?.reduce((sum, activity) => 
        sum + (activity.duration_seconds || 0), 0) || 0;
      
      // Calculate streaks
      const daysActive = new Set(activities?.map(a => 
        new Date(a.created_at).toISOString().split('T')[0]));
      
      // Sort dates to find consecutive days
      const sortedDates = Array.from(daysActive).sort();
      let currentStreak = 0;
      let maxStreak = 0;
      
      if (sortedDates.length > 0) {
        // Check if user was active today
        const today = new Date().toISOString().split('T')[0];
        const hasActivityToday = sortedDates.includes(today);
        
        let streakCount = hasActivityToday ? 1 : 0;
        
        // Calculate streak going backwards from today or yesterday
        let checkDate = hasActivityToday ? today : 
          new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        while (sortedDates.includes(checkDate)) {
          if (hasActivityToday || streakCount > 0) {
            streakCount++;
          }
          // Move to previous day
          const date = new Date(checkDate);
          date.setDate(date.getDate() - 1);
          checkDate = date.toISOString().split('T')[0];
        }
        
        currentStreak = streakCount;
        maxStreak = Math.max(currentStreak, maxStreak);
      }
      
      // Calculate average quiz scores
      const quizScores = quizActivities
        .filter(q => q.metadata && q.metadata.score)
        .map(q => q.metadata.score);
      
      const averageScore = quizScores.length > 0 
        ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
        : 0;
      
      // Last active date
      const lastActive = activities && activities.length > 0
        ? new Date(Math.max(...activities.map(a => new Date(a.created_at).getTime())))
        : new Date();
      
      // Progress percentages (mock data - in a real app you'd calculate against total content)
      const totalMaterials = 20; // This would come from your database
      const totalVideos = 15; // This would come from your database
      
      return {
        materialsCompleted: uniqueMaterials.size,
        videosWatched: uniqueVideos.size,
        quizzesTaken: uniqueQuizzes.size,
        totalTimeSpent: Math.round(totalSeconds / 60),
        averageScore,
        streak: currentStreak,
        lastActive: lastActive.toISOString(),
        progress: {
          materials: Math.min(100, Math.round((uniqueMaterials.size / totalMaterials) * 100)),
          videos: Math.min(100, Math.round((uniqueVideos.size / totalVideos) * 100)),
          overall: Math.min(100, Math.round(((uniqueMaterials.size + uniqueVideos.size) / (totalMaterials + totalVideos)) * 100))
        }
      } as UserProgressStats;
    },
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-[250px]" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seu Progresso</h1>
        <p className="text-gray-500 mt-2">
          Acompanhe seu desempenho e evolução nos estudos
        </p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Seu progresso geral
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressStats?.progress.overall}%</div>
                  <Progress value={progressStats?.progress.overall} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sequência atual
                  </CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressStats?.streak} dias</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Continue estudando diariamente!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tempo de estudo
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressStats?.totalTimeSpent} min</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tempo total investido
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Desempenho em testes
                  </CardTitle>
                  <Award className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(progressStats?.averageScore || 0)}%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Média de acertos
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Progress by Content Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Progresso por tipo de conteúdo</CardTitle>
                <CardDescription>
                  Seu avanço em cada categoria de estudo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-trade-blue" />
                        <span className="text-sm font-medium">Materiais</span>
                      </div>
                      <span className="text-sm font-medium">
                        {progressStats?.materialsCompleted} de 20
                      </span>
                    </div>
                    <Progress value={progressStats?.progress.materials} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Video className="mr-2 h-4 w-4 text-trade-green" />
                        <span className="text-sm font-medium">Vídeos</span>
                      </div>
                      <span className="text-sm font-medium">
                        {progressStats?.videosWatched} de 15
                      </span>
                    </div>
                    <Progress value={progressStats?.progress.videos} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Quizzes</span>
                      </div>
                      <span className="text-sm font-medium">
                        {progressStats?.quizzesTaken} completados
                      </span>
                    </div>
                    <Progress 
                      value={progressStats?.quizzesTaken ? (progressStats.quizzesTaken / 10) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Activity Chart */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Atividade nos últimos 30 dias</CardTitle>
                  <CardDescription>
                    Tempo de estudo diário em minutos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityChart />
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Seu calendário de estudo</CardTitle>
                  <CardDescription>
                    Dias ativos do mês atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StreakCalendar streak={progressStats?.streak || 0} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AchievementCard 
              title="Devorador de Livros"
              description="Leu 10 materiais completos"
              icon={<BookOpen className="h-8 w-8 text-purple-500" />}
              progress={progressStats?.materialsCompleted || 0}
              target={10}
              unlocked={progressStats ? progressStats.materialsCompleted >= 10 : false}
            />
            
            <AchievementCard 
              title="Maratonista de Vídeos"
              description="Assistiu 15 vídeos completos"
              icon={<Video className="h-8 w-8 text-blue-500" />}
              progress={progressStats?.videosWatched || 0}
              target={15}
              unlocked={progressStats ? progressStats.videosWatched >= 15 : false}
            />
            
            <AchievementCard 
              title="Mestre dos Quizzes"
              description="Completou 10 quizzes com média acima de 80%"
              icon={<Award className="h-8 w-8 text-yellow-500" />}
              progress={progressStats?.averageScore || 0}
              target={80}
              isPercentage
              unlocked={progressStats ? progressStats.averageScore >= 80 && progressStats.quizzesTaken >= 10 : false}
            />
            
            <AchievementCard 
              title="Chama Eterna"
              description="Manteve uma sequência de 7 dias consecutivos"
              icon={<Flame className="h-8 w-8 text-orange-500" />}
              progress={progressStats?.streak || 0}
              target={7}
              unlocked={progressStats ? progressStats.streak >= 7 : false}
            />
            
            <AchievementCard 
              title="Dedicação Total"
              description="Acumulou 120 minutos de estudo"
              icon={<Clock className="h-8 w-8 text-green-500" />}
              progress={progressStats?.totalTimeSpent || 0}
              target={120}
              unlocked={progressStats ? progressStats.totalTimeSpent >= 120 : false}
            />
            
            <AchievementCard 
              title="Explorador Completo"
              description="Explorou todos os tipos de conteúdo pelo menos uma vez"
              icon={<Trophy className="h-8 w-8 text-amber-500" />}
              progress={
                ((progressStats?.materialsCompleted || 0) > 0 ? 1 : 0) +
                ((progressStats?.videosWatched || 0) > 0 ? 1 : 0) +
                ((progressStats?.quizzesTaken || 0) > 0 ? 1 : 0)
              }
              target={3}
              unlocked={
                progressStats ? 
                  progressStats.materialsCompleted > 0 && 
                  progressStats.videosWatched > 0 && 
                  progressStats.quizzesTaken > 0 
                : false
              }
            />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Histórico das suas últimas atividades na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* This would be populated with actual activity history in a real app */}
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-trade-light-blue">
                    <BookOpen className="h-5 w-5 text-trade-blue" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Leu o material "Introdução ao Mercado Financeiro"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Há 2 horas
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Video className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Assistiu ao vídeo "Análise Técnica para Iniciantes"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ontem
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Completou o quiz "Fundamentos de Investimentos" com 85% de acertos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Há 2 dias
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Alcançou 50% de progresso no curso "Bolsa de Valores"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Há 3 dias
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Iniciou sua sequência de estudos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Há 1 semana
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProgressPage;
