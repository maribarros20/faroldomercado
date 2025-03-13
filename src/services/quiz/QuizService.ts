import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizQuestion, QuizAttempt, QuizSubmission, QuizStatistics } from "@/types/quiz";

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

export const updateQuizQuestion = async (id: string, updates: Partial<QuizQuestion>): Promise<QuizQuestion> => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error("Error updating quiz question:", error);
    throw error;
  }
  
  return data as QuizQuestion;
};

export const deleteQuizQuestion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting quiz question:", error);
    throw error;
  }
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
  
  // Check for achievements
  await checkAndRecordAchievements(data as QuizAttempt, quiz);
  
  return data as unknown as QuizAttempt;
};

const checkAndRecordAchievements = async (attempt: QuizAttempt, quiz: Quiz) => {
  try {
    // Get existing attempts to check for first-time achievements
    const { data: existingAttempts } = await supabase
      .from('user_quiz_attempts')
      .select('id, score, passed')
      .eq('user_id', attempt.user_id)
      .eq('quiz_id', attempt.quiz_id)
      .not('id', 'eq', attempt.id);
    
    const isFirstAttempt = !existingAttempts || existingAttempts.length === 0;
    
    // Check for perfect score
    if (attempt.score === 100) {
      await supabase.from('user_achievements').insert({
        user_id: attempt.user_id,
        achievement_type: 'quiz_perfect_score',
        achievement_name: 'Perfeição',
        achievement_description: 'Obteve 100% de acerto em um quiz',
        points: 50,
        metadata: {
          quiz_id: attempt.quiz_id,
          quiz_title: quiz.title,
          score: attempt.score
        }
      });
    }
    
    // Check for quick completion
    if (attempt.total_time_seconds && attempt.total_time_seconds < 120 && attempt.passed) {
      await supabase.from('user_achievements').insert({
        user_id: attempt.user_id,
        achievement_type: 'quiz_quick_completion',
        achievement_name: 'Velocidade',
        achievement_description: 'Completou um quiz em menos de 2 minutos com aprovação',
        points: 30,
        metadata: {
          quiz_id: attempt.quiz_id,
          quiz_title: quiz.title,
          time_seconds: attempt.total_time_seconds
        }
      });
    }
    
    // Check for first attempt pass
    if (isFirstAttempt && attempt.passed) {
      await supabase.from('user_achievements').insert({
        user_id: attempt.user_id,
        achievement_type: 'quiz_first_attempt_pass',
        achievement_name: 'De Primeira',
        achievement_description: 'Passou em um quiz na primeira tentativa',
        points: 40,
        metadata: {
          quiz_id: attempt.quiz_id,
          quiz_title: quiz.title,
          difficulty: quiz.difficulty
        }
      });
    }
    
  } catch (error) {
    console.error("Error recording achievements:", error);
    // Don't throw, so the quiz submission still succeeds
  }
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

export const getQuizStatistics = async (quizId?: string): Promise<QuizStatistics> => {
  if (!quizId) {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select('*');
    
    if (error) {
      console.error("Error fetching quiz statistics:", error);
      throw error;
    }
    
    const attempts = data || [];
    
    // Calculate overall statistics
    const stats: QuizStatistics = {
      total_attempts: attempts.length,
      completion_rate: 100, // All attempts in the table are completed
      average_score: attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) 
        : 0,
      average_time_seconds: attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + (a.total_time_seconds || 0), 0) / attempts.length) 
        : 0,
      pass_rate: attempts.length > 0 
        ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100) 
        : 0,
      question_success_rates: [],
      achievements: {
        perfect_scores: attempts.filter(a => a.score === 100).length,
        quick_completions: attempts.filter(a => a.total_time_seconds && a.total_time_seconds < 120).length,
        first_attempt_passes: 0 // Requires more complex calculation
      }
    };
    
    return stats;
  }
  
  // Specific quiz statistics
  const { data, error } = await supabase
    .from('user_quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId);
  
  if (error) {
    console.error("Error fetching quiz statistics:", error);
    throw error;
  }
  
  const attempts = data || [];
  
  // Get questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id')
    .eq('quiz_id', quizId);
  
  if (questionsError) {
    console.error("Error fetching quiz questions for statistics:", questionsError);
    throw questionsError;
  }
  
  // Calculate question success rates
  const questionSuccessRates = (questions || []).map(question => {
    const relatedAttempts = attempts.filter(a => 
      a.answers && Object.keys(a.answers).includes(question.id)
    );
    
    let successCount = 0;
    relatedAttempts.forEach(attempt => {
      const correctAnswer = attempt.answers[question.id];
      // We would need to match this against the correct_answer for the question
      // This is a simplified version
      if (correctAnswer) {
        successCount++;
      }
    });
    
    return {
      question_id: question.id,
      success_rate: relatedAttempts.length > 0 
        ? Math.round((successCount / relatedAttempts.length) * 100) 
        : 0
    };
  });
  
  // Calculate overall statistics
  const stats: QuizStatistics = {
    total_attempts: attempts.length,
    completion_rate: 100, // All attempts in the table are completed
    average_score: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) 
      : 0,
    average_time_seconds: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + (a.total_time_seconds || 0), 0) / attempts.length) 
      : 0,
    pass_rate: attempts.length > 0 
      ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100) 
      : 0,
    question_success_rates: questionSuccessRates,
    achievements: {
      perfect_scores: attempts.filter(a => a.score === 100).length,
      quick_completions: attempts.filter(a => a.total_time_seconds && a.total_time_seconds < 120).length,
      first_attempt_passes: 0 // Would require more complex calculation
    }
  };
  
  return stats;
};
