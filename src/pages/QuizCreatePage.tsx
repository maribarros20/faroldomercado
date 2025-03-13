
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuizForm from "@/components/quiz/QuizForm";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "@/components/ui/use-toast";

const QuizCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();

  React.useEffect(() => {
    if (!isLoading && profile?.role !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para criar quizzes.",
        variant: "destructive",
      });
      navigate('/quizzes');
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
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
          <h1 className="text-2xl font-bold text-gray-900">Criar Novo Quiz</h1>
        </div>
        
        <QuizForm />
      </div>
    </div>
  );
};

export default QuizCreatePage;
