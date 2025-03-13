
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Quiz from "@/components/quiz/Quiz";
import { useQuiz } from "@/hooks/use-quizzes";
import { Skeleton } from "@/components/ui/skeleton";

const QuizDetailPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading, error } = useQuiz(quizId);
  
  useEffect(() => {
    console.log("QuizDetailPage - Quiz ID from params:", quizId);
    console.log("QuizDetailPage - Quiz data:", quiz);
    console.log("QuizDetailPage - Is loading:", isLoading);
    console.log("QuizDetailPage - Error:", error);
  }, [quizId, quiz, isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar o quiz</h2>
            <p className="text-gray-500 mb-6">{String(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Quiz />
      </div>
    </div>
  );
};

export default QuizDetailPage;
