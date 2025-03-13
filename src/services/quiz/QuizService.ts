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
  const quiz = await getQuiz(submission.quiz_id);
  const questions = await getQuizQuestions(submission.quiz_id);
  
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
  
  const score = totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0;
  
  const passed = score >= quiz.passing_score;
  
  const difficultyMultiplier = quiz.difficulty === 'beginner' ? 1 : 
                              quiz.difficulty === 'intermediate' ? 1.5 : 2;
  
  const experiencePoints = Math.round(score * difficultyMultiplier);
  
  const started = new Date(submission.started_at);
  const completed = new Date();
  const totalTimeSeconds = Math.round((completed.getTime() - started.getTime()) / 1000);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
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
  
  await checkAndRecordAchievements(data as QuizAttempt, quiz);
  
  return data as unknown as QuizAttempt;
};

const checkAndRecordAchievements = async (attempt: QuizAttempt, quiz: Quiz) => {
  try {
    const { data: existingAttempts } = await supabase
      .from('user_quiz_attempts')
      .select('id, score, passed')
      .eq('user_id', attempt.user_id)
      .eq('quiz_id', attempt.quiz_id)
      .not('id', 'eq', attempt.id);
    
    const isFirstAttempt = !existingAttempts || existingAttempts.length === 0;
    
    if (attempt.score === 100) {
      await supabase.from('user_achievements').insert({
        user_id: attempt.user_id,
        achievement_type: 'quiz_perfect_score',
        description: 'Obteve 100% de acerto em um quiz',
        points: 50,
        badge_icon: 'award'
      });
    }
    
    if (attempt.total_time_seconds && attempt.total_time_seconds < 120 && attempt.passed) {
      await supabase.from('user_achievements').insert({
        user_id: attempt.user_id,
        achievement_type: 'quiz_quick_completion',
        description: 'Completou um quiz em menos de 2 minutos com aprovação',
        points: 30,
        badge_icon: 'zap'
      });
    }
    
    if (isFirstAttempt && attempt.passed) {
      await supabase.from('user_achievements').insert({
        user_id: attempt.user_id,
        achievement_type: 'quiz_first_attempt_pass',
        description: 'Passou em um quiz na primeira tentativa',
        points: 40,
        badge_icon: 'trophy'
      });
    }
    
  } catch (error) {
    console.error("Error recording achievements:", error);
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
    
    const stats: QuizStatistics = {
      total_attempts: attempts.length,
      completion_rate: 100,
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
        first_attempt_passes: 0
      }
    };
    
    return stats;
  }
  
  const { data, error } = await supabase
    .from('user_quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId);
  
  if (error) {
    console.error("Error fetching quiz statistics:", error);
    throw error;
  }
  
  const attempts = data || [];
  
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id')
    .eq('quiz_id', quizId);
  
  if (questionsError) {
    console.error("Error fetching quiz questions for statistics:", questionsError);
    throw questionsError;
  }
  
  const questionSuccessRates = (questions || []).map(question => {
    const relatedAttempts = attempts.filter(a => 
      a.answers && Object.keys(a.answers).includes(question.id)
    );
    
    let successCount = 0;
    relatedAttempts.forEach(attempt => {
      const correctAnswer = attempt.answers[question.id];
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
  
  const stats: QuizStatistics = {
    total_attempts: attempts.length,
    completion_rate: 100,
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
      first_attempt_passes: 0
    }
  };
  
  return stats;
};
