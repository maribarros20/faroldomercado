
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award } from "lucide-react";
import { Quiz, QuizAttempt } from "@/types/quiz";
import { useNavigate } from "react-router-dom";

interface QuizCardProps {
  quiz: Quiz;
  latestAttempt?: QuizAttempt;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, latestAttempt }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </Badge>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Categoria: {quiz.category}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>Pontuação para passar: {quiz.passing_score}%</span>
          </div>
          
          {latestAttempt && (
            <div className="mt-4 bg-slate-50 p-3 rounded-md">
              <div className="text-sm font-medium mb-1">Sua última tentativa:</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <span className={latestAttempt.passed ? "text-green-600" : "text-red-600"}>
                    {latestAttempt.score}% - {latestAttempt.passed ? "Aprovado" : "Reprovado"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(latestAttempt.completed_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-1">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/quizzes/${quiz.id}`)}
        >
          {latestAttempt ? "Refazer Quiz" : "Iniciar Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
