
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useQuery } from '@tanstack/react-query';

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

interface UserPerformanceData {
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  tipo_de_conta?: string;
  materials_completed?: number;
  videos_watched?: number;
  quizzes_completed?: number;
  quizzes_passed?: number;
  quizzes_score?: number;
  active_days?: number;
  achievements_count?: number;
  total_progress?: number;
  study_time_minutes?: number;
  experience_points?: number;
}

// Helper function to calculate user level based on XP
export function calculateUserLevel(xp: number) {
  // Base XP needed for level 1
  const baseXp = 100;
  // XP multiplier per level
  const multiplier = 1.5;
  
  let level = 0;
  let nextLevelXp = baseXp;
  let totalXpNeeded = 0;
  
  while (totalXpNeeded <= xp) {
    level++;
    totalXpNeeded += nextLevelXp;
    nextLevelXp = Math.round(baseXp * Math.pow(multiplier, level));
  }
  
  // Calculate progress to next level
  const prevLevelXp = totalXpNeeded - nextLevelXp;
  const currentLevelXp = xp - prevLevelXp;
  const progress = Math.round((currentLevelXp / nextLevelXp) * 100);
  
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress: progress > 100 ? 100 : progress,
    totalXp: xp
  };
}

// Mock data for development while implementing real data sources
const getMockUserPerformanceData = (): UserPerformanceData => {
  return {
    materials_completed: 15,
    videos_watched: 27,
    quizzes_completed: 8,
    quizzes_passed: 7,
    quizzes_score: 85,
    active_days: 12,
    achievements_count: 5,
    total_progress: 68,
    study_time_minutes: 380,
    experience_points: 750
  };
};

// Use for current user performance data
export function useCurrentUserPerformance(userId?: string) {
  const { userId: currentUserId, isLoading: isUserLoading } = useUserProfile();
  const targetUserId = userId || currentUserId;
  
  return useQuery({
    queryKey: ['userPerformance', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      // For now, return mock data
      // In the future, fetch from Supabase
      return getMockUserPerformanceData();
    },
    enabled: !!targetUserId && !isUserLoading
  });
}

// For admin dashboard - mock data for multiple users
export function useUserPerformance() {
  const getMockUsers = () => {
    const users = [];
    const accountTypes = ['trader', 'aluno'];
    
    for (let i = 0; i < 15; i++) {
      users.push({
        id: `user-${i}`,
        username: `user${i}`,
        first_name: `Nome${i}`,
        last_name: `Sobrenome${i}`,
        tipo_de_conta: accountTypes[Math.floor(Math.random() * accountTypes.length)],
        materials_completed: Math.floor(Math.random() * 30),
        videos_watched: Math.floor(Math.random() * 50),
        quizzes_completed: Math.floor(Math.random() * 20),
        quizzes_passed: Math.floor(Math.random() * 15),
        quizzes_score: Math.floor(40 + Math.random() * 60),
        active_days: Math.floor(Math.random() * 30),
        achievements_count: Math.floor(Math.random() * 10),
        total_progress: Math.floor(Math.random() * 100)
      });
    }
    
    return users;
  };
  
  return useQuery({
    queryKey: ['allUsersPerformance'],
    queryFn: async () => {
      // For now, return mock data
      // In the future, fetch from Supabase
      return getMockUsers();
    }
  });
}

// Legacy implementation (for backward compatibility)
export function useUserPerformanceOld() {
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
    
    // Mock data loading
    const mockLoad = async () => {
      setLoading(true);
      
      try {
        // Mock course completions
        const mockCompletions: CourseCompletion[] = [
          {
            course_id: "course-1",
            course_name: "Análise Técnica",
            completed_lessons: 8,
            total_lessons: 10,
            completion_percentage: 80
          },
          {
            course_id: "course-2",
            course_name: "Fundamentos do Mercado",
            completed_lessons: 12,
            total_lessons: 15,
            completion_percentage: 80
          },
          {
            course_id: "course-3",
            course_name: "Psicologia do Trading",
            completed_lessons: 5,
            total_lessons: 12,
            completion_percentage: 42
          }
        ];
        
        setCourseCompletions(mockCompletions);
        
        // Calculate total progress percentage
        const totalProgress = mockCompletions.reduce((sum, course) => sum + course.completion_percentage, 0) / mockCompletions.length;
        setTotalProgressPercentage(Math.round(totalProgress));
        
        // Mock activity data
        const today = new Date();
        const mockActivity: ActivityData[] = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10)
          };
        });
        
        setActivityData(mockActivity);
        
        // Mock user stats
        setUserStats({
          completedCourses: 3,
          activeCourses: 2,
          totalLearningTime: 720,
          averageScore: 78
        });
        
        // Mock achievements
        setUserAchievements([
          {
            id: "ach-1",
            title: "Primeiro Quiz",
            description: "Completou seu primeiro quiz",
            icon: "award",
            date_achieved: new Date().toISOString(),
            category: "learning"
          },
          {
            id: "ach-2",
            title: "Série de Estudos",
            description: "Estudou por 5 dias consecutivos",
            icon: "flame",
            date_achieved: new Date().toISOString(),
            category: "consistency"
          }
        ]);
        
      } catch (err) {
        console.error('Error generating mock performance data:', err);
        setError('Failed to load performance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    mockLoad();
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
