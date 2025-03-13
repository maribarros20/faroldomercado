
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserQuizAttempts } from "@/hooks/use-quizzes";
import { QuizAttempt } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Award, Brain, Clock, Target } from "lucide-react";

interface QuizResultCardProps {
  userId?: string;
}

const QuizResultCard: React.FC<QuizResultCardProps> = ({ userId }) => {
  const { data: attempts, isLoading } = useUserQuizAttempts(userId);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desempenho em Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Desempenho em Quizzes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium">Nenhum quiz completado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Complete quizzes para testar seus conhecimentos e ganhar pontos de experiência.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate quiz statistics
  const totalQuizzes = attempts.length;
  const passedQuizzes = attempts.filter(a => a.passed).length;
  const passRate = Math.round((passedQuizzes / totalQuizzes) * 100);
  
  const averageScore = Math.round(
    attempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzes
  );
  
  const totalXP = attempts.reduce((sum, a) => sum + a.experience_points, 0);
  
  const averageTimeSeconds = Math.round(
    attempts.reduce((sum, a) => sum + (a.total_time_seconds || 0), 0) / totalQuizzes
  );
  
  const bestAttempt = attempts.reduce((best, current) => 
    current.score > (best?.score || 0) ? current : best, 
    {} as QuizAttempt
  );
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Desempenho em Quizzes</span>
          <Badge variant="outline">
            {passedQuizzes} de {totalQuizzes} aprovados
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex justify-center">
            <div className="w-36 h-36">
              <CircularProgressbar
                value={averageScore}
                text={`${averageScore}%`}
                styles={buildStyles({
                  pathColor: averageScore >= 70 ? '#10b981' : '#f59e0b',
                  textSize: '20px',
                  textColor: '#1e293b',
                  trailColor: '#e2e8f0'
                })}
              />
            </div>
          </div>
          
          <div className="flex-grow grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Award className="h-6 w-6 text-indigo-500 mb-2" />
              <div className="font-semibold text-xl">{totalXP}</div>
              <div className="text-xs text-gray-500 text-center">Total de XP Ganho</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Target className="h-6 w-6 text-green-500 mb-2" />
              <div className="font-semibold text-xl">{passRate}%</div>
              <div className="text-xs text-gray-500 text-center">Taxa de Aprovação</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Brain className="h-6 w-6 text-blue-500 mb-2" />
              <div className="font-semibold text-xl">{bestAttempt.score || 0}%</div>
              <div className="text-xs text-gray-500 text-center">Melhor Pontuação</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500 mb-2" />
              <div className="font-semibold text-xl">{formatTime(averageTimeSeconds)}</div>
              <div className="text-xs text-gray-500 text-center">Tempo Médio</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Áreas de melhoria</h3>
          {averageScore < 70 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Pontuação:</span> Sua pontuação média está abaixo de 70%. Continue estudando e pratique mais com os quizzes disponíveis.
            </p>
          )}
          {passRate < 50 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Taxa de aprovação:</span> Sua taxa de aprovação está abaixo de 50%. Revise o material antes de tentar os quizzes novamente.
            </p>
          )}
          {(averageScore >= 70 && passRate >= 50) && (
            <p className="text-sm text-muted-foreground">
              Bom trabalho! Continue fazendo quizzes para manter seu conhecimento afiado e ganhar mais XP.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResultCard;
