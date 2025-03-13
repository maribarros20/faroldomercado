
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  passing_score: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[] | null;
  correct_answer: string;
  points: number;
  explanation: string | null;
  question_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string;
  total_time_seconds: number | null;
  experience_points: number;
}

export interface QuizAnswer {
  question_id: string;
  answer: string;
}

export interface QuizSubmission {
  quiz_id: string;
  answers: QuizAnswer[];
  started_at: string;
}

export interface QuizStatistics {
  total_attempts: number;
  completion_rate: number;
  average_score: number;
  average_time_seconds: number;
  pass_rate: number;
  question_success_rates: {
    question_id: string;
    success_rate: number;
  }[];
  achievements: {
    perfect_scores: number;
    quick_completions: number;
    first_attempt_passes: number;
  };
}

export interface QuizAchievement {
  id: string;
  user_id: string;
  quiz_id: string;
  achievement_type: 'perfect_score' | 'quick_completion' | 'first_attempt_pass' | 'streak';
  achievement_data: any;
  created_at: string;
}

export interface QuizPerformanceMetrics {
  totalCompleted: number;
  averageScore: number;
  passRate: number;
  totalExperienceGained: number;
  averageTimeSeconds: number;
  improvementRate: number;
  streakCount: number;
  achievements: QuizAchievement[];
}
