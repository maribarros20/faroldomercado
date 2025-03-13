
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
