
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
import { toast } from "@/components/ui/use-toast";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("subscribers");
  const navigate = useNavigate();

  // Check if the user is an admin
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['check-admin'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Erro ao verificar status de admin:', error);
        return false;
      }
      
      return data?.role === 'admin';
    },
    meta: {
      onError: (error: any) => {
        console.error('Erro ao verificar status de admin:', error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões",
          variant: "destructive"
        });
      }
    }
  });

  // Redirect if not an admin
  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 w-full md:w-auto flex flex-wrap">
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="market-news">Notícias do Mercado</TabsTrigger>
          <TabsTrigger value="finance-spreadsheet">Planilha Financeira</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-6">
            <TabsContent value="subscribers" className="mt-0">
              <AdminSubscribers />
            </TabsContent>
            
            <TabsContent value="materials" className="mt-0">
              <AdminMaterials />
            </TabsContent>
            
            <TabsContent value="videos" className="mt-0">
              <AdminVideos />
            </TabsContent>
            
            <TabsContent value="plans" className="mt-0">
              <AdminPlans />
            </TabsContent>

            <TabsContent value="market-news" className="mt-0">
              <MarketNews />
            </TabsContent>

            <TabsContent value="finance-spreadsheet" className="mt-0">
              <FinanceSpreadsheet />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default AdminPage;
