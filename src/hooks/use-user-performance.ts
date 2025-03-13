
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/use-user-profile';

interface CourseCompletion {
  course_id: string;
  course_name: string;
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
}

interface ActivityData {
  date: string;
  count: number;
}

interface UserStats {
  completedCourses: number;
  activeCourses: number;
  totalLearningTime: number;
  averageScore: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date_achieved: string;
  category: string;
}

export function useUserPerformance() {
  const [courseCompletions, setCourseCompletions] = useState<CourseCompletion[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    completedCourses: 0,
    activeCourses: 0,
    totalLearningTime: 0,
    averageScore: 0
  });
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProgressPercentage, setTotalProgressPercentage] = useState(0);
  
  const { userId, isLoading: isUserLoading } = useUserProfile();

  useEffect(() => {
    if (isUserLoading || !userId) return;
    
    async function fetchUserPerformanceData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch course completions
        const { data: completionsData, error: completionsError } = await supabase
          .from('user_course_progress')
          .select(`
            course_id,
            courses:course_id (name),
            completed_lessons,
            total_lessons
          `)
          .eq('user_id', userId);
        
        if (completionsError) throw completionsError;
        
        // Format course completions data
        const formattedCompletions = completionsData.map(item => ({
          course_id: item.course_id,
          course_name: item.courses?.name || 'Unknown Course',
          completed_lessons: item.completed_lessons || 0,
          total_lessons: item.total_lessons || 0,
          completion_percentage: item.total_lessons > 0 
            ? Math.round((item.completed_lessons / item.total_lessons) * 100) 
            : 0
        }));
        
        setCourseCompletions(formattedCompletions);
        
        // Calculate total progress percentage
        if (formattedCompletions.length > 0) {
          const totalProgress = formattedCompletions.reduce((sum, course) => sum + course.completion_percentage, 0) / formattedCompletions.length;
          setTotalProgressPercentage(Math.round(totalProgress));
        }
        
        // Fetch activity data (last 30 days)
        const { data: activityData, error: activityError } = await supabase
          .from('user_learning_activity')
          .select('date, action_count')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(30);
        
        if (activityError) throw activityError;
        
        // Format activity data
        const formattedActivity = activityData.map(item => ({
          date: item.date,
          count: item.action_count || 0
        }));
        
        setActivityData(formattedActivity);
        
        // Fetch user stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_learning_stats')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (statsError && statsError.code !== 'PGRST116') throw statsError;
        
        if (statsData) {
          setUserStats({
            completedCourses: statsData.completed_courses || 0,
            activeCourses: statsData.active_courses || 0,
            totalLearningTime: statsData.total_learning_time || 0,
            averageScore: statsData.average_score || 0
          });
        }
        
        // Fetch achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achievements:achievement_id (title, description, icon, category),
            date_achieved
          `)
          .eq('user_id', userId);
        
        if (achievementsError) throw achievementsError;
        
        // Format achievements data
        const formattedAchievements = achievements.map(item => ({
          id: item.id,
          title: item.achievements?.title || 'Unknown Achievement',
          description: item.achievements?.description || '',
          icon: item.achievements?.icon || 'award',
          date_achieved: item.date_achieved,
          category: item.achievements?.category || 'general'
        }));
        
        setUserAchievements(formattedAchievements);
        
      } catch (err) {
        console.error('Error fetching user performance data:', err);
        setError('Failed to load performance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserPerformanceData();
  }, [userId, isUserLoading]);
  
  return {
    courseCompletions,
    activityData,
    stats: userStats,
    achievements: userAchievements,
    loading,
    error,
    totalProgressPercentage
  };
}
