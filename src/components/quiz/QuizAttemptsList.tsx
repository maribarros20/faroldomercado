
import React from "react";
import { useUserQuizAttempts } from "@/hooks/use-quizzes";
import { QuizAttempt } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Clock, BarChart } from "lucide-react";

interface QuizAttemptsListProps {
  userId?: string;
  limit?: number;
}

const QuizAttemptsList: React.FC<QuizAttemptsListProps> = ({ userId, limit }) => {
  const { data: attempts, isLoading } = useUserQuizAttempts(userId);
  
  const displayAttempts = limit && attempts ? attempts.slice(0, limit) : attempts;

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!displayAttempts || displayAttempts.length === 0) {
    return (
      <div className="text-center py-6">
        <Award className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        <h3 className="font-medium">Nenhum quiz completado ainda</h3>
        <p className="text-sm text-muted-foreground">
          Complete quizzes para ganhar experiência e testar seus conhecimentos.
        </p>
      </div>
    );
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      {displayAttempts.map((attempt) => (
        <Card key={attempt.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{attempt.quiz_id}</CardTitle>
              <Badge variant={attempt.passed ? "success" : "destructive"}>
                {attempt.passed ? "Aprovado" : "Reprovado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BarChart className="w-4 h-4" />
                  <span>Pontuação</span>
                </div>
                <span className="font-medium">{attempt.score}%</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>XP Ganho</span>
                </div>
                <span className="font-medium">+{attempt.experience_points} XP</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Tempo</span>
                </div>
                <span className="font-medium">{formatDuration(attempt.total_time_seconds)}</span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Completado em {format(new Date(attempt.completed_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizAttemptsList;
