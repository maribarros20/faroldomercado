
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuizAttempt } from "@/types/quiz";
import { Clock, Award, Timer, CheckCircle, XCircle, User, BarChart2 } from "lucide-react";
import { useUserQuizAttempts } from "@/hooks/use-quizzes";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QuizAttemptsListProps {
  attempts?: QuizAttempt[];
  limit?: number;
}

const QuizAttemptsList: React.FC<QuizAttemptsListProps> = ({ attempts: propAttempts, limit }) => {
  const { user } = useAuth();
  const { data: fetchedAttempts, isLoading } = useUserQuizAttempts(user?.id);
  
  const attempts = propAttempts || fetchedAttempts;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="ml-3 text-gray-600">Carregando tentativas...</p>
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <h3 className="text-gray-500 font-medium mb-1">Nenhuma tentativa encontrada</h3>
        <p className="text-sm text-gray-400">Complete quizzes para ver seu histórico aqui</p>
      </div>
    );
  }

  // Apply limit if specified
  const displayedAttempts = limit ? attempts.slice(0, limit) : attempts;

  // Get the most recent attempts to show improvement
  const recentAttempts = limit && attempts.length > limit 
    ? attempts.slice(0, limit * 2) 
    : attempts;
  
  // Check if the user is improving
  const isImproving = recentAttempts.length >= 2 && 
    recentAttempts[0].score > recentAttempts[recentAttempts.length - 1].score;
  
  // Check if the user is getting faster
  const isGettingFaster = recentAttempts.length >= 2 && 
    (recentAttempts[0].total_time_seconds || 0) < (recentAttempts[recentAttempts.length - 1].total_time_seconds || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Histórico de Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Tentativas totais</div>
              <div className="text-lg font-medium flex items-center gap-1">
                <User className="h-4 w-4 text-blue-500" />
                {attempts.length}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Taxa de aprovação</div>
              <div className="text-lg font-medium flex items-center gap-1">
                <BarChart2 className="h-4 w-4 text-green-500" />
                {Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)}%
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">XP Total Ganho</div>
              <div className="text-lg font-medium flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-500" />
                {attempts.reduce((total, attempt) => total + attempt.experience_points, 0)}
              </div>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto rounded-lg">
            <Table>
              <TableCaption>Seus últimos quizzes completados</TableCaption>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Tempo</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="hidden md:table-cell">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAttempts.map((attempt, index) => {
                  const badgeVariant = attempt.passed ? "default" : "destructive";
                  const badgeClass = attempt.passed ? "bg-green-100 text-green-800 hover:bg-green-100" : "";
                  
                  return (
                    <motion.tr
                      key={attempt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">Quiz {attempt.quiz_id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium">{attempt.score}%</span>
                            </div>
                            <svg viewBox="0 0 36 36" className="w-10 h-10 transform -rotate-90">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e6e6e6"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={attempt.score >= 70 ? "#10b981" : attempt.score >= 50 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="3"
                                strokeDasharray={`${attempt.score}, 100`}
                              />
                            </svg>
                          </div>
                          <Progress value={attempt.score} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant} className={cn(badgeClass, "flex w-24 justify-center")}>
                          {attempt.passed ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Reprovado</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center text-gray-600">
                          <Timer className="w-3 h-3 opacity-70 mr-1" />
                          {attempt.total_time_seconds 
                            ? `${Math.floor(attempt.total_time_seconds / 60)}m ${attempt.total_time_seconds % 60}s` 
                            : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center text-gray-600">
                          <Clock className="w-3 h-3 opacity-70 mr-1" />
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                          +{attempt.experience_points} XP
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {isImproving && (
            <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Parabéns!</span>
              </div>
              <p className="mt-1">Seus resultados estão melhorando com o tempo. Continue assim!</p>
            </div>
          )}
          
          {isGettingFaster && (
            <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 text-sm">
              <div className="flex items-center">
                <Timer className="h-4 w-4 mr-2" />
                <span className="font-medium">Tempo melhorando!</span>
              </div>
              <p className="mt-1">Você está completando os quizzes mais rapidamente. Isso mostra que seu conhecimento está se consolidando.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizAttemptsList;
