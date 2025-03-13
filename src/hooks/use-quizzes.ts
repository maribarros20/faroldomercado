
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getQuizzes, 
  getQuiz, 
  getQuizQuestions, 
  submitQuizAttempt, 
  getUserQuizAttempts,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion
} from "@/services/quiz/QuizService";
import { Quiz, QuizQuestion, QuizSubmission, QuizAttempt } from "@/types/quiz";

export const useQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes
  });
};

export const useQuiz = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuiz(quizId!),
    enabled: !!quizId
  });
};

export const useQuizQuestions = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => getQuizQuestions(quizId!),
    enabled: !!quizId
  });
};

export const useAddQuizQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (question: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>) => 
      addQuizQuestion(question),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', variables.quiz_id] });
    }
  });
};

export const useUpdateQuizQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<QuizQuestion> }) => 
      updateQuizQuestion(id, updates),
    onSuccess: (_, variables) => {
      // Get the quiz_id from the updates or from the updated question
      const quizId = variables.updates.quiz_id;
      if (quizId) {
        queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
      }
    }
  });
};

export const useDeleteQuizQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteQuizQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    }
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (submission: QuizSubmission) => submitQuizAttempt(submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-performance'] });
    }
  });
};

export const useUserQuizAttempts = (userId?: string) => {
  return useQuery({
    queryKey: ['user-quiz-attempts', userId],
    queryFn: () => getUserQuizAttempts(userId)
  });
};
