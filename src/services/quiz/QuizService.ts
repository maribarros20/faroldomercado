
import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizQuestion, QuizAttempt, QuizSubmission } from "@/types/quiz";

export const createQuiz = async (quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz> => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quiz)
    .select('*')
    .single();
  
  if (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
  
  return data as Quiz;
};

export const updateQuiz = async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
  const { data, error } = await supabase
    .from('quizzes')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
  
  return data as Quiz;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

export const getQuiz = async (id: string): Promise<Quiz> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
  
  return data as Quiz;
};

export const getQuizzes = async (): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
  
  return (data || []) as Quiz[];
};

export const addQuizQuestion = async (question: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<QuizQuestion> => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(question)
    .select('*')
    .single();
  
  if (error) {
    console.error("Error adding quiz question:", error);
    throw error;
  }
  
  return data as QuizQuestion;
};

export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('question_order', { ascending: true });
  
  if (error) {
    console.error("Error fetching quiz questions:", error);
    throw error;
  }
  
  return (data || []) as QuizQuestion[];
};

export const submitQuizAttempt = async (submission: QuizSubmission): Promise<QuizAttempt> => {
  // First, get the quiz details and questions
  const quiz = await getQuiz(submission.quiz_id);
  const questions = await getQuizQuestions(submission.quiz_id);
  
  // Calculate score
  let correctAnswers = 0;
  let totalPoints = 0;
  
  const answersRecord: Record<string, string> = {};
  
  for (const answer of submission.answers) {
    answersRecord[answer.question_id] = answer.answer;
    
    const question = questions.find(q => q.id === answer.question_id);
    if (question) {
      totalPoints += question.points;
      
      if (question.correct_answer === answer.answer) {
        correctAnswers += question.points;
      }
    }
  }
  
  // Calculate score percentage
  const score = totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0;
  
  // Determine if passed based on passing_score
  const passed = score >= quiz.passing_score;
  
  // Calculate experience points
  const difficultyMultiplier = quiz.difficulty === 'beginner' ? 1 : 
                              quiz.difficulty === 'intermediate' ? 1.5 : 2;
  
  const experiencePoints = Math.round(score * difficultyMultiplier);
  
  // Calculate total time
  const started = new Date(submission.started_at);
  const completed = new Date();
  const totalTimeSeconds = Math.round((completed.getTime() - started.getTime()) / 1000);
  
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // Submit the attempt
  const attempt = {
    user_id: session.user.id,
    quiz_id: submission.quiz_id,
    score,
    passed,
    answers: answersRecord,
    started_at: submission.started_at,
    completed_at: completed.toISOString(),
    total_time_seconds: totalTimeSeconds,
    experience_points: experiencePoints
  };
  
  const { data, error } = await supabase
    .from('user_quiz_attempts')
    .insert(attempt)
    .select('*')
    .single();
  
  if (error) {
    console.error("Error submitting quiz attempt:", error);
    throw error;
  }
  
  return data as unknown as QuizAttempt;
};

export const getUserQuizAttempts = async (userId?: string): Promise<QuizAttempt[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!userId && !session) {
    return [];
  }
  
  const userIdToUse = userId || session?.user.id;
  
  const { data, error } = await supabase
    .from('user_quiz_attempts')
    .select('*')
    .eq('user_id', userIdToUse)
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching user quiz attempts:", error);
    throw error;
  }
  
  return (data || []) as unknown as QuizAttempt[];
};
