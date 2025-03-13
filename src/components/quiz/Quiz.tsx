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
  HelpCircle,
  Brain,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

const Quiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuizQuestions(quizId);
  const submitQuizMutation = useSubmitQuiz();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState<string>(new Date().toISOString());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
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
  
  if (quizError || !quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Quiz não encontrado</h2>
        <p className="text-gray-500 mb-6">
          O quiz que você está tentando acessar não existe.
          {quizError && <span className="block text-red-500 mt-2">{String(quizError)}</span>}
        </p>
        <Button onClick={() => navigate('/quizzes')}>Voltar para Quizzes</Button>
      </div>
    );
  }
  
  if (questionsError || !questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Não há perguntas disponíveis</h2>
        <p className="text-gray-500 mb-6">
          Este quiz não possui perguntas ou ocorreu um erro ao carregá-las.
          {questionsError && <span className="block text-red-500 mt-2">{String(questionsError)}</span>}
        </p>
        <Button onClick={() => navigate('/quizzes')}>Voltar para Quizzes</Button>
      </div>
    );
  }
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { question_id: questionId, answer };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { question_id: questionId, answer }]);
    }
    
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
  
  const getDifficultyColor = () => {
    switch (quiz.difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getDifficultyLabel = () => {
    switch (quiz.difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return quiz.difficulty;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/quizzes')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar aos Quizzes
        </Button>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-700">{formatTime(elapsedTime)}</span>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-md border-t-4 border-t-blue-600">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={`${getDifficultyColor()} hover:${getDifficultyColor()}`}
                    variant="default"
                  >
                    {getDifficultyLabel()}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {quiz.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="mb-2 font-semibold bg-blue-50 text-blue-700 border-blue-200">
                  Pergunta {currentQuestion + 1} de {questions.length}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Zap className="h-4 w-4 mr-1 text-amber-500" />
                  Pontuação mínima: {quiz.passing_score}%
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-2 bg-gray-100" />
          </CardHeader>
          
          <CardContent className="pb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{question.question}</h3>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200">
                    <Brain className="h-3.5 w-3.5 mr-1 text-blue-600" />
                    <span className="text-blue-700">{question.points} pontos</span>
                  </Badge>
                  
                  {question.explanation && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-1 hover:bg-blue-50"
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
              </div>
              
              {showHint && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4"
                >
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Dica</h4>
                      <p className="text-sm text-blue-700">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {question.question_type === 'multiple_choice' && question.options && (
                <RadioGroup
                  value={getCurrentAnswer(question.id)}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-3 mt-6"
                >
                  {question.options.map((option, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`flex items-center space-x-2 bg-white border 
                        ${getCurrentAnswer(question.id) === option 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'} 
                        rounded-md p-3 transition-colors`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">{option}</Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              )}
              
              {question.question_type === 'true_false' && (
                <RadioGroup
                  value={getCurrentAnswer(question.id)}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-3 mt-6"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center space-x-2 bg-white border
                      ${getCurrentAnswer(question.id) === "Verdadeiro" 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'} 
                      rounded-md p-3 transition-colors`}
                  >
                    <RadioGroupItem value="Verdadeiro" id="true" />
                    <Label htmlFor="true" className="cursor-pointer flex-1">Verdadeiro</Label>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                    className={`flex items-center space-x-2 bg-white border
                      ${getCurrentAnswer(question.id) === "Falso" 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'} 
                      rounded-md p-3 transition-colors`}
                  >
                    <RadioGroupItem value="Falso" id="false" />
                    <Label htmlFor="false" className="cursor-pointer flex-1">Falso</Label>
                  </motion.div>
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
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className={`h-3 w-3 rounded-full ${answers.length === questions.length ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {answers.length} de {questions.length} respondidas
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {Array.from({ length: questions.length }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`h-7 w-7 rounded-full text-xs flex items-center justify-center
                      ${currentQuestion === index 
                        ? 'bg-blue-600 text-white' 
                        : answers.some(a => a.question_id === questions[index].id)
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Quiz;
