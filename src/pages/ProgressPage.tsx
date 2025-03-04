
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Award, Clock, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const progressData = [
  { name: "Jan", modules: 5, hours: 12 },
  { name: "Feb", modules: 8, hours: 18 },
  { name: "Mar", modules: 12, hours: 22 },
  { name: "Apr", modules: 10, hours: 15 },
  { name: "May", modules: 15, hours: 25 },
  { name: "Jun", modules: 18, hours: 30 },
  { name: "Jul", modules: 22, hours: 35 },
];

const categories = [
  { 
    id: 1, 
    name: "Análise Técnica", 
    progress: 75, 
    modules: 18, 
    total: 24,
    hours: 12.5
  },
  { 
    id: 2, 
    name: "Análise Fundamental", 
    progress: 45, 
    modules: 8, 
    total: 18,
    hours: 7.2
  },
  { 
    id: 3, 
    name: "Gestão de Riscos", 
    progress: 90, 
    modules: 11, 
    total: 12,
    hours: 9.8
  },
  { 
    id: 4, 
    name: "Psicologia de Trading", 
    progress: 60, 
    modules: 9, 
    total: 15,
    hours: 6.5
  },
  { 
    id: 5, 
    name: "Day Trading", 
    progress: 30, 
    modules: 5, 
    total: 16,
    hours: 4.2
  }
];

const achievements = [
  {
    id: 1,
    title: "Analista Técnico",
    description: "Completou todos os módulos de análise técnica",
    date: "15/05/2023",
    icon: <Award className="w-8 h-8 text-yellow-500" />
  },
  {
    id: 2,
    title: "Estudante Dedicado",
    description: "Assistiu mais de 50 horas de conteúdo",
    date: "28/03/2023",
    icon: <Clock className="w-8 h-8 text-blue-500" />
  },
  {
    id: 3,
    title: "Streak de 30 dias",
    description: "Acessou a plataforma por 30 dias consecutivos",
    date: "12/02/2023",
    icon: <Calendar className="w-8 h-8 text-green-500" />
  }
];

const recentActivities = [
  {
    id: 1,
    action: "Assistiu vídeo",
    item: "Análise de Candlesticks Avançada",
    time: "Hoje, 14:30",
    category: "Análise Técnica"
  },
  {
    id: 2,
    action: "Concluiu módulo",
    item: "Introdução à Gestão de Riscos",
    time: "Ontem, 19:15",
    category: "Gestão de Riscos"
  },
  {
    id: 3,
    action: "Baixou material",
    item: "Planilha de Cálculo de Posição",
    time: "22/05/2023, 11:40",
    category: "Day Trading"
  },
  {
    id: 4,
    action: "Iniciou trilha",
    item: "Psicologia do Investidor",
    time: "20/05/2023, 08:22",
    category: "Psicologia de Trading"
  }
];

export default function ProgressPage() {
  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Progresso</h1>
          <p className="text-gray-500 mt-1">Acompanhe sua evolução nos estudos</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-100">
          <TrendingUp size={20} className="text-trade-blue" />
          <span className="text-gray-700 font-medium">Nível: Intermediário</span>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
        <Card className="col-span-1 lg:col-span-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle>Evolução de Estudos</CardTitle>
            <CardDescription>
              Acompanhe seu progresso ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="modules">
              <TabsList className="mb-4">
                <TabsTrigger value="modules">Módulos Completados</TabsTrigger>
                <TabsTrigger value="hours">Horas de Estudo</TabsTrigger>
              </TabsList>
              <TabsContent value="modules" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={progressData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                      }}
                      cursor={{ fill: 'rgba(0, 102, 255, 0.05)' }}
                    />
                    <Bar dataKey="modules" fill="#0066FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="hours" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progressData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#0066FF" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#0066FF" }}
                      activeDot={{ r: 6, fill: "#0066FF", stroke: "white", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle>Conquistas</CardTitle>
            <CardDescription>
              Certificados e marcos importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <motion.div 
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{achievement.description}</p>
                    <div className="text-xs text-gray-400">{achievement.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 lg:col-span-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-2">
            <CardTitle>Categorias de Estudo</CardTitle>
            <CardDescription>
              Seu progresso em cada categoria de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <div className="text-sm text-gray-500">
                        {category.modules} de {category.total} módulos • {category.hours} horas
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-trade-blue">
                      {category.progress}%
                    </div>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="pb-2">
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Suas últimas interações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.action}</h3>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {activity.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
