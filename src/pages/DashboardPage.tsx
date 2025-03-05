
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";
import MarketAssets from "@/components/admin/MarketAssets";
import MarketAlerts from "@/components/admin/MarketAlerts";
import MarketOverview from "@/components/admin/MarketOverview";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Tipo para planos do usuário
type UserPlan = {
  id: string;
  name: string;
  features: string[];
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Simular verificação de plano do usuário
  // Em um ambiente real, isso viria da autenticação e da API
  useEffect(() => {
    const checkUserPlan = async () => {
      setIsLoading(true);
      try {
        // Exemplo: verificar se o usuário está autenticado e seu plano
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Simulação - em produção, isso viria do banco de dados
          setUserPlan({
            id: "1",
            name: "Premium",
            features: ["dashboard", "market-news", "finance-spreadsheet"] 
          });
        } else {
          // Usuário sem autenticação ou plano básico
          setUserPlan({
            id: "2",
            name: "Básico",
            features: ["dashboard"] 
          });
          
          // Mostrar toast informativo
          toast({
            title: "Acesso limitado",
            description: "Algumas funcionalidades estão disponíveis apenas para assinantes. Faça upgrade do seu plano.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar plano do usuário:", error);
        setUserPlan({
          id: "free",
          name: "Gratuito",
          features: ["dashboard"]
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserPlan();
  }, [toast]);

  // Verificar acesso a uma aba específica
  const hasAccessToTab = (tabId: string) => {
    if (!userPlan) return false;
    return userPlan.features.includes(tabId);
  };

  // Manipulador de mudança de aba
  const handleTabChange = (value: string) => {
    if (!hasAccessToTab(value)) {
      toast({
        title: "Acesso restrito",
        description: "Esta funcionalidade está disponível apenas em planos superiores.",
        variant: "destructive",
      });
      return;
    }
    
    setActiveTab(value);
  };

  return (
    <div className="animate-fade-in container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Mercado</h1>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full md:w-auto flex flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="market-news">Notícias do Mercado</TabsTrigger>
          <TabsTrigger value="finance-spreadsheet">Planilha Financeira</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-6">
            <TabsContent value="dashboard" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Painel Principal</h2>
                  <p className="text-muted-foreground">
                    Acompanhe os principais índices e ativos do mercado
                  </p>
                </div>
                
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <MarketAssets />
                  <MarketAlerts />
                </div>
                
                <MarketOverview />
              </div>
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

export default DashboardPage;
