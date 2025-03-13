
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getQuizzes, 
  getQuiz, 
  getQuizQuestions, 
  submitQuizAttempt, 
  getUserQuizAttempts,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getQuizStatistics
} from "@/services/quiz/QuizService";
import { Quiz, QuizQuestion, QuizSubmission, QuizAttempt, QuizStatistics } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";

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
      toast({
        title: "Pergunta adicionada",
        description: "A pergunta foi adicionada com sucesso ao quiz.",
      });
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Erro ao adicionar pergunta",
          description: "Ocorreu um erro ao adicionar a pergunta. Tente novamente.",
          variant: "destructive",
        });
        console.error("Error adding question:", error);
      }
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
        toast({
          title: "Pergunta atualizada",
          description: "A pergunta foi atualizada com sucesso.",
        });
      }
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Erro ao atualizar pergunta",
          description: "Ocorreu um erro ao atualizar a pergunta. Tente novamente.",
          variant: "destructive",
        });
        console.error("Error updating question:", error);
      }
    }
  });
};

export const useDeleteQuizQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quizId }: { id: string, quizId: string }) => {
      return deleteQuizQuestion(id).then(() => ({ id, quizId }));
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', result.quizId] });
      toast({
        title: "Pergunta removida",
        description: "A pergunta foi removida com sucesso do quiz.",
      });
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Erro ao remover pergunta",
          description: "Ocorreu um erro ao remover a pergunta. Tente novamente.",
          variant: "destructive",
        });
        console.error("Error deleting question:", error);
      }
    }
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (submission: QuizSubmission) => submitQuizAttempt(submission),
    onSuccess: (result) => {
      // Track specific achievement conditions
      const achievementMessages = [];
      
      if (result.score === 100) {
        achievementMessages.push("🏆 Conquista: Perfeição! 100% de acerto no quiz.");
      }
      
      if (result.total_time_seconds && result.total_time_seconds < 120) {
        achievementMessages.push("⚡ Conquista: Velocidade! Quiz completado em menos de 2 minutos.");
      }
      
      if (result.passed) {
        achievementMessages.push(`✅ Quiz aprovado! Você ganhou ${result.experience_points} pontos de experiência.`);
      }
      
      // Show toast with appropriate message
      if (achievementMessages.length > 0) {
        toast({
          title: "Quiz completado com sucesso!",
          description: (
            <div className="space-y-1">
              {achievementMessages.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          ),
        });
      } else {
        toast({
          title: "Quiz completado",
          description: result.passed 
            ? `Você foi aprovado com ${result.score}%!` 
            : `Você não atingiu a pontuação mínima. Pontuação: ${result.score}%`,
          variant: result.passed ? "default" : "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['user-quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-performance'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-statistics'] });
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Erro ao enviar quiz",
          description: "Ocorreu um erro ao enviar suas respostas. Tente novamente.",
          variant: "destructive",
        });
        console.error("Error submitting quiz:", error);
      }
    }
  });
};

export const useUserQuizAttempts = (userId?: string) => {
  return useQuery({
    queryKey: ['user-quiz-attempts', userId],
    queryFn: () => getUserQuizAttempts(userId)
  });
};

export const useQuizStatistics = (quizId?: string) => {
  return useQuery({
    queryKey: ['quiz-statistics', quizId],
    queryFn: () => getQuizStatistics(quizId),
    enabled: !!quizId
  });
};
