
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz, useQuizQuestions, useSubmitQuiz } from "@/hooks/use-quizzes";
import { QuizAnswer, QuizSubmission } from "@/types/quiz";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  RotateCcw, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Quiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(quizId);
  const submitQuizMutation = useSubmitQuiz();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState<string>(new Date().toISOString());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // Timer for quiz
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (quizLoading || questionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }
  
  if (quizError || !quiz || !questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Quiz não encontrado</h2>
        <p className="text-gray-500 mb-6">
          O quiz que você está tentando acessar não existe ou não tem perguntas.
        </p>
        <Button onClick={() => navigate('/quizzes')}>Voltar para Quizzes</Button>
      </div>
    );
  }
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    // Check if we already have an answer for this question
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { question_id: questionId, answer };
      setAnswers(newAnswers);
    } else {
      // Add new answer
      setAnswers([...answers, { question_id: questionId, answer }]);
    }
    
    // Reset hint state when answer changes
    setShowHint(false);
  };
  
  const getCurrentAnswer = (questionId: string): string | undefined => {
    return answers.find(a => a.question_id === questionId)?.answer;
  };
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
    }
  };
  
  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.length < questions.length) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    
    const submission: QuizSubmission = {
      quiz_id: quizId!,
      answers,
      started_at: startTime,
    };
    
    try {
      await submitQuizMutation.mutateAsync(submission);
      
      toast({
        title: "Quiz enviado com sucesso!",
        description: "Você será redirecionado para ver seus resultados.",
      });
      
      // Navigate to results page
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
  
  const handleReset = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setShowHint(false);
    
    toast({
      title: "Quiz reiniciado",
      description: "Todas as respostas foram apagadas.",
    });
  };
  
  const handleToggleHint = () => {
    setShowHint(!showHint);
  };
  
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/quizzes')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar aos Quizzes
        </Button>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatTime(elapsedTime)}</span>
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            <Badge variant="outline">
              Pergunta {currentQuestion + 1} de {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{question.question}</h3>
              
              {question.explanation && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1"
                        onClick={handleToggleHint}
                      >
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mostrar dica</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {showHint && question.explanation && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Dica</h4>
                    <p className="text-sm text-blue-700">{question.explanation}</p>
                  </div>
                </div>
              </div>
            )}
            
            {question.question_type === 'multiple_choice' && question.options && (
              <RadioGroup
                value={getCurrentAnswer(question.id)}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {question.question_type === 'true_false' && (
              <RadioGroup
                value={getCurrentAnswer(question.id)}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="Verdadeiro" id="true" />
                  <Label htmlFor="true" className="cursor-pointer flex-1">Verdadeiro</Label>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="Falso" id="false" />
                  <Label htmlFor="false" className="cursor-pointer flex-1">Falso</Label>
                </div>
              </RadioGroup>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
            
            {currentQuestion === questions.length - 1 ? (
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!getCurrentAnswer(question.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Enviar Respostas
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!getCurrentAnswer(question.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Quiz;
