
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuiz, useQuizQuestions } from "@/hooks/use-quizzes";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { QuizProvider, useQuizContext } from "./QuizContext";
import QuizHeader from "./QuizHeader";
import QuizQuestion from "./QuizQuestion";
import QuizFooter from "./QuizFooter";
import QuizNavigation from "./QuizNavigation";
import QuizError from "./QuizError";

const QuizContent = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuizQuestions(quizId);
  const { currentQuestion, setElapsedTime } = useQuizContext();

  useEffect(() => {
    console.log("Quiz component rendered with quizId:", quizId);
    console.log("Quiz data:", quiz);
    console.log("Questions data:", questions);
    console.log("Loading states:", { quizLoading, questionsLoading });
    console.log("Errors:", { quizError, questionsError });
  }, [quizId, quiz, questions, quizLoading, questionsLoading, quizError, questionsError]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [setElapsedTime]);
  
  if (quizLoading || questionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }
  
  if (quizError || !quiz) {
    return (
      <QuizError
        title="Quiz não encontrado"
        message="O quiz que você está tentando acessar não existe."
        error={quizError}
      />
    );
  }
  
  if (questionsError || !questions || questions.length === 0) {
    return (
      <QuizError
        title="Não há perguntas disponíveis"
        message="Este quiz não possui perguntas ou ocorreu um erro ao carregá-las."
        error={questionsError}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-md border-t-4 border-t-blue-600">
          <QuizHeader quiz={quiz} questions={questions} />
          
          <CardContent className="pb-6">
            <QuizQuestion question={questions[currentQuestion]} />
          </CardContent>
          
          <QuizFooter 
            quizId={quizId!}
            questions={questions} 
            currentQuestion={questions[currentQuestion]} 
          />
        </Card>
      </motion.div>
      
      <QuizNavigation questions={questions} />
    </div>
  );
};

const Quiz: React.FC = () => {
  return (
    <QuizProvider>
      <QuizContent />
    </QuizProvider>
  );
};

export default Quiz;
