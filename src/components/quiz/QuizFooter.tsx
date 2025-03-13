
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { QuizQuestion, QuizSubmission } from "@/types/quiz";
import { ChevronLeft, ChevronRight, Check, RotateCcw } from "lucide-react";
import { useQuizContext } from "./QuizContext";
import { useSubmitQuiz } from "@/hooks/use-quizzes";
import { toast } from "@/hooks/use-toast";

interface QuizFooterProps {
  quizId: string;
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion;
}

const QuizFooter: React.FC<QuizFooterProps> = ({ quizId, questions, currentQuestion }) => {
  const navigate = useNavigate();
  const submitQuizMutation = useSubmitQuiz();
  const { 
    currentQuestion: currentQuestionIndex, 
    setCurrentQuestion, 
    answers, 
    setAnswers, 
    startTime, 
    setShowHint,
    getCurrentAnswer
  } = useQuizContext();

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
      setShowHint(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
      setShowHint(false);
    }
  };
  
  const handleReset = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setShowHint(false);
    
    toast({
      title: "Quiz reiniciado",
      description: "Todas as respostas foram apagadas.",
    });
  };

  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    
    const submission: QuizSubmission = {
      quiz_id: quizId,
      answers,
      started_at: startTime,
    };
    
    try {
      await submitQuizMutation.mutateAsync(submission);
      
      toast({
        title: "Quiz enviado com sucesso!",
        description: "Você será redirecionado para ver seus resultados.",
      });
      
      navigate('/progress');
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Erro ao enviar quiz",
        description: "Ocorreu um erro ao enviar suas respostas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <CardFooter className="flex justify-between">
      <div>
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reiniciar
        </Button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!getCurrentAnswer(currentQuestion.id)}
          >
            <Check className="h-4 w-4 mr-2" />
            Enviar Respostas
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={!getCurrentAnswer(currentQuestion.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </CardFooter>
  );
};

export default QuizFooter;
