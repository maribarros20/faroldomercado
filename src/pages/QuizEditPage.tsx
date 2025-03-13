
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import QuizForm from "@/components/quiz/QuizForm";
import { useQuiz } from "@/hooks/use-quizzes";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const QuizEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading: quizLoading, error } = useQuiz(quizId);
  const { userRole, isLoading: profileLoading } = useUserProfile();

  useEffect(() => {
    if (!profileLoading && userRole !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para editar quizzes.",
        variant: "destructive",
      });
      navigate('/quizzes');
    }
  }, [userRole, profileLoading, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar quiz",
        description: "Não foi possível carregar as informações do quiz.",
        variant: "destructive",
      });
      navigate('/quizzes');
    }
  }, [error, navigate]);

  if (profileLoading || quizLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/quizzes')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Quiz</h1>
        </div>
        
        {quiz && <QuizForm existingQuiz={quiz} />}
      </div>
    </div>
  );
};

export default QuizEditPage;
