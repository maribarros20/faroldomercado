
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import AdminSubscribers from "@/components/admin/AdminSubscribers";
import AdminMaterials from "@/components/admin/AdminMaterials";
import AdminVideos from "@/components/admin/AdminVideos";
import AdminPlans from "@/components/admin/AdminPlans";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import { useToast } from "@/hooks/use-toast";
import AdminNewsManager from "@/components/admin/news-manager";
import AdminFinanceIframes from "@/components/admin/AdminFinanceIframes";
import { Shield, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import AdminCommunity from "@/components/admin/AdminCommunity";
import AdminMentors from "@/components/admin/AdminMentors";
import AdminUserManager from "@/components/admin/AdminUserManager";
import AdminPerformance from "@/components/admin/AdminPerformance";
import AdminQuizzes from "@/components/admin/AdminQuizzes";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("subscribers");
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: isAdmin,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['check-admin'],
    queryFn: async () => {
      try {
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session) {
          return false;
        }
        const {
          data,
          error
        } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (error) {
          console.error('Erro ao verificar status de admin:', error);
          throw new Error(error.message);
        }
        return data?.role === 'admin';
      } catch (err) {
        console.error('Erro ao verificar status de admin:', err);
        throw err;
      }
    },
    meta: {
      onError: (err: any) => {
        console.error('Erro ao verificar status de admin:', err);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões: " + (err.message || 'Erro desconhecido'),
          variant: "destructive"
        });
      }
    }
  });

  useEffect(() => {
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao verificar permissões</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Ocorreu um erro ao verificar suas permissões."}
          </p>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Voltar para o Dashboard
          </button>
        </div>
      </div>;
  }

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 max-w-md">
          <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">
            Esta área é reservada para administradores. Você não tem permissão para acessar este conteúdo.
          </p>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Voltar para o Dashboard
          </button>
        </div>
      </div>;
  }

  return <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 w-full md:w-auto flex flex-wrap bg-white rounded-md">
          <TabsTrigger 
            value="subscribers"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Assinantes</TabsTrigger>
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Usuários</TabsTrigger>
          <TabsTrigger 
            value="materials"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Materiais</TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Vídeos</TabsTrigger>
          <TabsTrigger 
            value="quizzes"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Quizzes</TabsTrigger>
          <TabsTrigger 
            value="community"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Comunidade</TabsTrigger>
          <TabsTrigger 
            value="mentors"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Mentores</TabsTrigger>
          <TabsTrigger 
            value="plans"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Planos</TabsTrigger>
          <TabsTrigger 
            value="performance"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Desempenho</TabsTrigger>
          <TabsTrigger 
            value="audit-logs"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Logs de Auditoria</TabsTrigger>
          <TabsTrigger 
            value="market-news"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Notícias do Mercado</TabsTrigger>
          <TabsTrigger 
            value="finance-spreadsheet"
            className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >Planilhas Financeiras</TabsTrigger>
        </TabsList>
        
        <Card className="rounded-md border border-gray-200">
          <CardContent className="p-6">
            <TabsContent value="subscribers" className="mt-0">
              <AdminSubscribers />
            </TabsContent>
            
            <TabsContent value="users" className="mt-0">
              <AdminUserManager />
            </TabsContent>
            
            <TabsContent value="materials" className="mt-0">
              <AdminMaterials />
            </TabsContent>
            
            <TabsContent value="videos" className="mt-0">
              <AdminVideos />
            </TabsContent>
            
            <TabsContent value="quizzes" className="mt-0">
              <AdminQuizzes />
            </TabsContent>
            
            <TabsContent value="community" className="mt-0">
              <AdminCommunity />
            </TabsContent>
            
            <TabsContent value="mentors" className="mt-0">
              <AdminMentors />
            </TabsContent>
            
            <TabsContent value="plans" className="mt-0">
              <AdminPlans />
            </TabsContent>

            <TabsContent value="performance" className="mt-0">
              <AdminPerformance />
            </TabsContent>

            <TabsContent value="audit-logs" className="mt-0">
              <AdminAuditLogs />
            </TabsContent>

            <TabsContent value="market-news" className="mt-0">
              <AdminNewsManager />
            </TabsContent>

            <TabsContent value="finance-spreadsheet" className="mt-0">
              <AdminFinanceIframes />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>;
};

export default AdminPage;
