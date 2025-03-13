
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizzes, getQuiz, getQuizQuestions, submitQuizAttempt, getUserQuizAttempts } from "@/services/quiz/QuizService";
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
