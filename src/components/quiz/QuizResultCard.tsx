
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserQuizAttempts } from "@/hooks/use-quizzes";
import { QuizAttempt } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Award, Brain, Clock, Target, Zap, Trophy, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import "react-circular-progressbar/dist/styles.css";

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
          <div className="text-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados de desempenho...</p>
          </div>
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
  
  // Calculate improvement over time
  const sortedAttempts = [...attempts].sort((a, b) => 
    new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );
  
  let improvement = 0;
  if (sortedAttempts.length >= 2) {
    const firstScore = sortedAttempts[0].score;
    const latestScore = sortedAttempts[sortedAttempts.length - 1].score;
    improvement = latestScore - firstScore;
  }
  
  // Calculate achievement stats
  const perfectScores = attempts.filter(a => a.score === 100).length;
  const quickCompletes = attempts.filter(a => a.total_time_seconds && a.total_time_seconds < 120).length;
  const consecutivePasses = (() => {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const attempt of sortedAttempts) {
      if (attempt.passed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  })();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Desempenho em Quizzes
            </span>
            <Badge variant={passedQuizzes > 0 ? "default" : "outline"} className={passedQuizzes > 0 ? "bg-green-500" : ""}>
              {passedQuizzes} de {totalQuizzes} aprovados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 flex justify-center">
              <div className="w-32 h-32 md:w-36 md:h-36">
                <CircularProgressbar
                  value={averageScore}
                  text={`${averageScore}%`}
                  styles={buildStyles({
                    pathColor: averageScore >= 70 ? '#10b981' : averageScore >= 50 ? '#f59e0b' : '#ef4444',
                    textSize: '20px',
                    textColor: '#1e293b',
                    trailColor: '#e2e8f0',
                    pathTransitionDuration: 0.5,
                  })}
                />
              </div>
            </div>
            
            <div className="flex-grow grid grid-cols-2 md:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm border border-blue-100"
              >
                <Zap className="h-6 w-6 text-indigo-500 mb-2" />
                <div className="font-semibold text-xl text-indigo-700">{totalXP}</div>
                <div className="text-xs text-indigo-600 text-center">Total de XP</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm border border-green-100"
              >
                <Target className="h-6 w-6 text-green-500 mb-2" />
                <div className="font-semibold text-xl text-green-700">{passRate}%</div>
                <div className="text-xs text-green-600 text-center">Taxa de Aprovação</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm border border-purple-100"
              >
                <Brain className="h-6 w-6 text-purple-500 mb-2" />
                <div className="font-semibold text-xl text-purple-700">{bestAttempt.score || 0}%</div>
                <div className="text-xs text-purple-600 text-center">Melhor Pontuação</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm border border-amber-100"
              >
                <Clock className="h-6 w-6 text-amber-500 mb-2" />
                <div className="font-semibold text-xl text-amber-700">{formatTime(averageTimeSeconds)}</div>
                <div className="text-xs text-amber-600 text-center">Tempo Médio</div>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Award className="h-4 w-4 mr-1 text-blue-600" />
              Conquistas em Quizzes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`flex items-center p-3 rounded-md ${perfectScores > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <Trophy className={`h-5 w-5 mr-2 ${perfectScores > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-medium">Notas Perfeitas</div>
                  <div className="text-xs">{perfectScores} quiz(zes) com 100%</div>
                </div>
              </div>
              
              <div className={`flex items-center p-3 rounded-md ${quickCompletes > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <Zap className={`h-5 w-5 mr-2 ${quickCompletes > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-medium">Conclusão Rápida</div>
                  <div className="text-xs">{quickCompletes} quiz(zes) em menos de 2min</div>
                </div>
              </div>
              
              <div className={`flex items-center p-3 rounded-md ${consecutivePasses >= 3 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                <TrendingUp className={`h-5 w-5 mr-2 ${consecutivePasses >= 3 ? 'text-purple-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-medium">Sequência de Aprovações</div>
                  <div className="text-xs">Sequência máxima: {consecutivePasses}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-blue-600" />
              {improvement > 0 ? (
                <span>Progresso Pessoal: <span className="text-green-600">+{improvement}%</span> de melhoria</span>
              ) : improvement < 0 ? (
                <span>Progresso Pessoal: <span className="text-red-600">{improvement}%</span> (oportunidade para melhorar)</span>
              ) : (
                <span>Progresso Pessoal: Mantenha a consistência</span>
              )}
            </h3>
            {averageScore < 70 && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Pontuação:</span> Sua pontuação média está abaixo de 70%. Continue estudando e pratique mais com os quizzes disponíveis.
              </p>
            )}
            {passRate < 50 && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Taxa de aprovação:</span> Sua taxa de aprovação está abaixo de 50%. Revise o material antes de tentar os quizzes novamente.
              </p>
            )}
            {(averageScore >= 70 && passRate >= 50) && (
              <p className="text-sm text-muted-foreground mt-2">
                Bom trabalho! Continue fazendo quizzes para manter seu conhecimento afiado e ganhar mais XP.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizResultCard;
