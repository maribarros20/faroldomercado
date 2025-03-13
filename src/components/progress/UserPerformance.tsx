
import React from "react";
import { useCurrentUserPerformance, calculateUserLevel } from "@/hooks/use-user-performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { BookOpen, Video, CheckCircle, Award, Brain, Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface UserPerformanceProps {
  userId?: string;
}

const UserPerformance: React.FC<UserPerformanceProps> = ({ userId }) => {
  const { data: performance, isLoading, error } = useCurrentUserPerformance(userId);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !performance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Não foi possível carregar seus dados de desempenho.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate performance level
  const getPerformanceLevel = () => {
    if (!performance) return "Iniciante";
    if (performance.total_progress >= 90) return "Especialista";
    if (performance.total_progress >= 70) return "Avançado";
    if (performance.total_progress >= 40) return "Intermediário";
    return "Iniciante";
  };
  
  const getPerformanceColor = () => {
    if (!performance) return "#6b7280"; // gray
    if (performance.total_progress >= 90) return "#10b981"; // green
    if (performance.total_progress >= 70) return "#3b82f6"; // blue
    if (performance.total_progress >= 40) return "#f59e0b"; // amber
    return "#6b7280"; // gray
  };
  
  // Calculate progress for current level
  const xp = performance?.experience_points || 0;
  const levelInfo = calculateUserLevel(xp);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Seu Desempenho</span>
          <Badge 
            variant="outline" 
            style={{ 
              color: getPerformanceColor(), 
              borderColor: getPerformanceColor(),
              backgroundColor: `${getPerformanceColor()}10` 
            }}
          >
            {getPerformanceLevel()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Novo bloco de nível de usuário */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Nível {levelInfo.level}</h3>
                <p className="text-sm text-muted-foreground">
                  {xp} de {levelInfo.nextLevelXp} XP para o próximo nível
                </p>
              </div>
            </div>
            <div className="w-full max-w-md">
              <Progress value={levelInfo.progress} className="h-2" />
              <p className="text-xs text-right mt-1 text-muted-foreground">
                Faltam {levelInfo.nextLevelXp - xp} XP para o nível {levelInfo.level + 1}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex justify-center">
            <div className="w-36 h-36">
              <CircularProgressbar
                value={performance.total_progress}
                text={`${performance.total_progress}%`}
                styles={buildStyles({
                  pathColor: getPerformanceColor(),
                  textSize: '20px',
                  textColor: '#1e293b',
                  trailColor: '#e2e8f0'
                })}
              />
            </div>
          </div>
          
          <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
              <div className="font-semibold text-xl">{performance.materials_completed}</div>
              <div className="text-xs text-gray-500 text-center">Materiais Completos</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Video className="h-6 w-6 text-purple-500 mb-2" />
              <div className="font-semibold text-xl">{performance.videos_watched}</div>
              <div className="text-xs text-gray-500 text-center">Vídeos Assistidos</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
              <div className="font-semibold text-xl">{performance.quizzes_completed}</div>
              <div className="text-xs text-gray-500 text-center">Quizzes Completos</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Award className="h-6 w-6 text-amber-500 mb-2" />
              <div className="font-semibold text-xl">{performance.achievements_count}</div>
              <div className="text-xs text-gray-500 text-center">Conquistas</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Clock className="h-6 w-6 text-red-500 mb-2" />
              <div className="font-semibold text-xl">{performance.study_time_minutes || 0}</div>
              <div className="text-xs text-gray-500 text-center">Minutos de Estudo</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
              <Brain className="h-6 w-6 text-indigo-500 mb-2" />
              <div className="font-semibold text-xl">{performance.quizzes_score}%</div>
              <div className="text-xs text-gray-500 text-center">Nota Média</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Áreas de melhoria</h3>
          <div className="space-y-2">
            {performance.materials_completed < 5 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Materiais:</span> Você tem lido poucos materiais. Recomendamos ler pelo menos 5 materiais para melhorar seu conhecimento.
              </p>
            )}
            {performance.videos_watched < 3 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Vídeos:</span> Você tem assistido poucos vídeos. Assista mais vídeos para complementar seu aprendizado.
              </p>
            )}
            {performance.quizzes_completed < 2 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Quizzes:</span> Faça mais quizzes para testar seus conhecimentos e fixar o aprendizado.
              </p>
            )}
            {performance.study_time_minutes && performance.study_time_minutes < 60 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tempo de estudo:</span> Seu tempo de estudo está baixo. Tente dedicar pelo menos 1 hora por semana para obter melhores resultados.
              </p>
            )}
            {!performance.materials_completed && !performance.videos_watched && !performance.quizzes_completed && (
              <p className="text-sm text-muted-foreground">
                Comece sua jornada de aprendizado acessando os materiais e vídeos disponíveis na plataforma.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPerformance;
