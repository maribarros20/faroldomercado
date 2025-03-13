
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, CheckCircle, User, Users, Award, Brain } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface UserPerformanceStats {
  id: string;
  user_id: string;
  materials_completed: number;
  videos_watched: number;
  quizzes_completed: number;
  quizzes_passed: number;
  quizzes_score: number;
  active_days: number;
  achievements_count: number;
  total_progress: number;
  tipo_de_conta: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface PerformanceStatsProps {
  userStats: UserPerformanceStats[];
  isLoading?: boolean;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({ 
  userStats, 
  isLoading = false 
}) => {
  const traderUsers = userStats.filter(user => user.tipo_de_conta === 'trader');
  const studentUsers = userStats.filter(user => user.tipo_de_conta === 'aluno');

  // Calculate averages
  const calculateAverages = (users: UserPerformanceStats[]) => {
    if (users.length === 0) return {
      avgMaterialsCompleted: 0,
      avgVideosWatched: 0,
      avgQuizzesCompleted: 0,
      avgQuizzesScore: 0,
      avgProgress: 0
    };

    return {
      avgMaterialsCompleted: Math.round(users.reduce((sum, user) => sum + user.materials_completed, 0) / users.length),
      avgVideosWatched: Math.round(users.reduce((sum, user) => sum + user.videos_watched, 0) / users.length),
      avgQuizzesCompleted: Math.round(users.reduce((sum, user) => sum + user.quizzes_completed, 0) / users.length),
      avgQuizzesScore: Math.round(users.reduce((sum, user) => sum + user.quizzes_score, 0) / users.length),
      avgProgress: Math.round(users.reduce((sum, user) => sum + user.total_progress, 0) / users.length)
    };
  };

  const traderStats = calculateAverages(traderUsers);
  const studentStats = calculateAverages(studentUsers);

  // Get top performers
  const getTopPerformers = (users: UserPerformanceStats[], count: number = 5) => {
    return [...users].sort((a, b) => b.total_progress - a.total_progress).slice(0, count);
  };

  const topTraders = getTopPerformers(traderUsers);
  const topStudents = getTopPerformers(studentUsers);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="traders">Traders</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Usuários por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-4">
                  <div className="w-32 h-32">
                    <CircularProgressbar
                      value={traderUsers.length}
                      maxValue={traderUsers.length + studentUsers.length || 1}
                      text={`${traderUsers.length}`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: '#0066FF',
                        textColor: '#1e293b',
                        trailColor: '#e2e8f0'
                      })}
                    />
                  </div>
                  <div className="w-32 h-32">
                    <CircularProgressbar
                      value={studentUsers.length}
                      maxValue={traderUsers.length + studentUsers.length || 1}
                      text={`${studentUsers.length}`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: '#10b981',
                        textColor: '#1e293b',
                        trailColor: '#e2e8f0'
                      })}
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-2 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#0066FF] mr-2"></div>
                    <span className="text-sm">Traders</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                    <span className="text-sm">Alunos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progresso Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center py-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0066FF]">{traderStats.avgProgress}%</div>
                    <div className="text-sm text-muted-foreground">Traders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#10b981]">{studentStats.avgProgress}%</div>
                    <div className="text-sm text-muted-foreground">Alunos</div>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Materiais Lidos</span>
                    <span className="text-sm font-medium">{traderStats.avgMaterialsCompleted} / {studentStats.avgMaterialsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Vídeos Assistidos</span>
                    <span className="text-sm font-medium">{traderStats.avgVideosWatched} / {studentStats.avgVideosWatched}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quizzes Completados</span>
                    <span className="text-sm font-medium">{traderStats.avgQuizzesCompleted} / {studentStats.avgQuizzesCompleted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Nota Média em Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-4">
                  <div className="w-32 h-32">
                    <CircularProgressbar
                      value={traderStats.avgQuizzesScore}
                      maxValue={100}
                      text={`${traderStats.avgQuizzesScore}%`}
                      styles={buildStyles({
                        textSize: '20px',
                        pathColor: traderStats.avgQuizzesScore >= 70 ? '#10b981' : '#f59e0b',
                        textColor: '#1e293b',
                        trailColor: '#e2e8f0'
                      })}
                    />
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-sm text-muted-foreground">Média geral de todos os usuários</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Usuário</th>
                      <th className="text-center py-2">Tipo</th>
                      <th className="text-center py-2">Materiais</th>
                      <th className="text-center py-2">Vídeos</th>
                      <th className="text-center py-2">Quizzes</th>
                      <th className="text-center py-2">Progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...topTraders, ...topStudents]
                      .sort((a, b) => b.total_progress - a.total_progress)
                      .slice(0, 5)
                      .map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="py-2">{user.username || `${user.first_name} ${user.last_name}`}</td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.tipo_de_conta === 'trader' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.tipo_de_conta === 'trader' ? 'Trader' : 'Aluno'}
                          </span>
                        </td>
                        <td className="text-center py-2">{user.materials_completed}</td>
                        <td className="text-center py-2">{user.videos_watched}</td>
                        <td className="text-center py-2">{user.quizzes_completed}</td>
                        <td className="text-center py-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${user.total_progress}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="traders" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Traders Ativos" 
              value={traderUsers.length} 
              icon={<User className="h-5 w-5 text-blue-500" />} 
            />
            <StatCard 
              title="Materiais Completos" 
              value={traderUsers.reduce((sum, user) => sum + user.materials_completed, 0)} 
              icon={<BookOpen className="h-5 w-5 text-amber-500" />} 
            />
            <StatCard 
              title="Vídeos Assistidos" 
              value={traderUsers.reduce((sum, user) => sum + user.videos_watched, 0)} 
              icon={<Video className="h-5 w-5 text-purple-500" />} 
            />
            <StatCard 
              title="Quizzes Completos" 
              value={traderUsers.reduce((sum, user) => sum + user.quizzes_completed, 0)} 
              icon={<CheckCircle className="h-5 w-5 text-green-500" />} 
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Usuário</th>
                      <th className="text-center py-2">Materiais</th>
                      <th className="text-center py-2">Vídeos</th>
                      <th className="text-center py-2">Quizzes</th>
                      <th className="text-center py-2">Nota Média</th>
                      <th className="text-center py-2">Progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTraders.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="py-2">{user.username || `${user.first_name} ${user.last_name}`}</td>
                        <td className="text-center py-2">{user.materials_completed}</td>
                        <td className="text-center py-2">{user.videos_watched}</td>
                        <td className="text-center py-2">{user.quizzes_completed}</td>
                        <td className="text-center py-2">{user.quizzes_score}%</td>
                        <td className="text-center py-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${user.total_progress}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Alunos Ativos" 
              value={studentUsers.length} 
              icon={<Users className="h-5 w-5 text-green-500" />} 
            />
            <StatCard 
              title="Conquistas" 
              value={studentUsers.reduce((sum, user) => sum + user.achievements_count, 0)} 
              icon={<Award className="h-5 w-5 text-amber-500" />} 
            />
            <StatCard 
              title="Quizzes Completos" 
              value={studentUsers.reduce((sum, user) => sum + user.quizzes_completed, 0)} 
              icon={<CheckCircle className="h-5 w-5 text-purple-500" />} 
            />
            <StatCard 
              title="Conhecimento" 
              value={`${Math.round(studentUsers.reduce((sum, user) => sum + user.total_progress, 0) / (studentUsers.length || 1))}%`} 
              icon={<Brain className="h-5 w-5 text-blue-500" />} 
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Usuário</th>
                      <th className="text-center py-2">Materiais</th>
                      <th className="text-center py-2">Vídeos</th>
                      <th className="text-center py-2">Quizzes</th>
                      <th className="text-center py-2">Nota Média</th>
                      <th className="text-center py-2">Conquistas</th>
                      <th className="text-center py-2">Progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="py-2">{user.username || `${user.first_name} ${user.last_name}`}</td>
                        <td className="text-center py-2">{user.materials_completed}</td>
                        <td className="text-center py-2">{user.videos_watched}</td>
                        <td className="text-center py-2">{user.quizzes_completed}</td>
                        <td className="text-center py-2">{user.quizzes_score}%</td>
                        <td className="text-center py-2">{user.achievements_count}</td>
                        <td className="text-center py-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${user.total_progress}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className="p-2 rounded-full bg-gray-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
