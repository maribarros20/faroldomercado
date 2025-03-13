
import { useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUserManager from "@/components/admin/AdminUserManager";
import AdminMaterials from "@/components/admin/AdminMaterials";
import AdminVideos from "@/components/admin/AdminVideos";
import AdminQuizzes from "@/components/admin/AdminQuizzes";
import AdminCommunity from "@/components/admin/AdminCommunity";
import AdminPlans from "@/components/admin/AdminPlans";
import AdminMentors from "@/components/admin/AdminMentors";
import AdminPerformance from "@/components/admin/AdminPerformance";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminFinanceIframes from "@/components/admin/AdminFinanceIframes";
import AdminNewsManager from "@/components/admin/news-manager";
import MarketNews from "@/components/admin/MarketNews";
import MarketAlerts from "@/components/admin/MarketAlerts";
import MarketRadar from "@/components/admin/MarketRadar";
import MarketAssets from "@/components/admin/MarketAssets";
import MarketOverview from "@/components/admin/MarketOverview";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userRole, isLoading } = useUserProfile();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (userRole !== 'admin') {
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar o painel administrativo.",
      variant: "destructive",
    });
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="community">Comunidade</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="mentors">Mentores</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Logs</TabsTrigger>
          <TabsTrigger value="finance">Finanças</TabsTrigger>
          <TabsTrigger value="news">Notícias</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="assets">Ativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <MarketOverview />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <AdminUserManager />
        </TabsContent>
        <TabsContent value="materials" className="space-y-4">
          <AdminMaterials />
        </TabsContent>
        <TabsContent value="videos" className="space-y-4">
          <AdminVideos />
        </TabsContent>
        <TabsContent value="quizzes" className="space-y-4">
          <AdminQuizzes />
        </TabsContent>
        <TabsContent value="community" className="space-y-4">
          <AdminCommunity />
        </TabsContent>
        <TabsContent value="plans" className="space-y-4">
          <AdminPlans />
        </TabsContent>
        <TabsContent value="mentors" className="space-y-4">
          <AdminMentors />
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <AdminPerformance />
        </TabsContent>
        <TabsContent value="audit" className="space-y-4">
          <AdminAuditLogs />
        </TabsContent>
        <TabsContent value="finance" className="space-y-4">
          <AdminFinanceIframes />
        </TabsContent>
        <TabsContent value="news" className="space-y-4">
          <AdminNewsManager />
        </TabsContent>
        <TabsContent value="alerts" className="space-y-4">
          <MarketAlerts />
        </TabsContent>
        <TabsContent value="radar" className="space-y-4">
          <MarketRadar />
        </TabsContent>
        <TabsContent value="assets" className="space-y-4">
          <MarketAssets />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
