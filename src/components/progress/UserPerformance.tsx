
import React from "react";
import { useCurrentUserPerformance } from "@/hooks/use-user-performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { BookOpen, Video, CheckCircle, Award, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    if (performance.total_progress >= 90) return "Especialista";
    if (performance.total_progress >= 70) return "Avançado";
    if (performance.total_progress >= 40) return "Intermediário";
    return "Iniciante";
  };
  
  const getPerformanceColor = () => {
    if (performance.total_progress >= 90) return "#10b981"; // green
    if (performance.total_progress >= 70) return "#3b82f6"; // blue
    if (performance.total_progress >= 40) return "#f59e0b"; // amber
    return "#6b7280"; // gray
  };
  
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
              <div className="font-semibold text-xl">{performance.active_days}</div>
              <div className="text-xs text-gray-500 text-center">Dias Ativos</div>
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
