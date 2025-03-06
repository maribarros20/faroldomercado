
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

// Type for user plans
type UserPlan = {
  id: string;
  name: string;
  features: string[];
  spreadsheet_url?: string;
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check user plan
  useEffect(() => {
    const checkUserPlan = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and get their plan
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (session) {
          // Get the user's subscription
          const {
            data: subscriptionData,
            error: subscriptionError
          } = await supabase.from('subscriptions').select(`
              id,
              plan_id,
              plans (
                id,
                name,
                description
              )
            `).eq('user_id', session.user.id).eq('is_active', true).single();
          if (subscriptionData) {
            // Get plan features
            const {
              data: featureData,
              error: featureError
            } = await supabase.from('plan_features').select('*').eq('plan_id', subscriptionData.plan_id);
            const features = featureData?.filter(feature => feature.is_included).map(feature => feature.text.toLowerCase()) || [];
            setUserPlan({
              id: subscriptionData.plan_id,
              name: subscriptionData.plans.name,
              features: features,
              spreadsheet_url: features.includes("planilha financeira avançada") ? "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6m3cCvBxXqCkVjpWyg73Q426GFTHnmVq7tEZ-G4X4XBe6rg-5_eU8Z-574HOEo1qqyhS0dwWJVVIR/pubhtml?gid=2095335592&amp;single=true&amp;widget=true&amp;headers=false" : "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6m3cCvBxXqCkVjpWyg73Q426GFTHnmVq7tEZ-G4X4XBe6rg-5_eU8Z-574HOEo1qqyhS0dwWJVVIR/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false"
            });
          } else {
            // User without subscription or basic plan
            setUserPlan({
              id: "free",
              name: "Gratuito",
              features: ["dashboard"]
            });

            // Show informative toast
            toast({
              title: "Acesso limitado",
              description: "Algumas funcionalidades estão disponíveis apenas para assinantes. Faça upgrade do seu plano.",
              variant: "default"
            });
          }
        } else {
          // User not logged in
          setUserPlan({
            id: "guest",
            name: "Visitante",
            features: ["dashboard"]
          });
          toast({
            title: "Acesso limitado",
            description: "Faça login para acessar mais funcionalidades ou assine um plano premium.",
            variant: "default"
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

  // Check access to a specific tab
  const hasAccessToTab = (tabId: string) => {
    if (!userPlan) return false;

    // Convert tab id to feature name format that would be in plan_features
    const featureMap: {
      [key: string]: string;
    } = {
      "dashboard": "dashboard",
      "market-news": "notícias do mercado",
      "finance-spreadsheet": "planilha financeira"
    };
    const featureName = featureMap[tabId];
    return userPlan.features.some(feature => feature.toLowerCase().includes(featureName.toLowerCase()));
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (!hasAccessToTab(value)) {
      toast({
        title: "Acesso restrito",
        description: "Esta funcionalidade está disponível apenas em planos superiores.",
        variant: "destructive"
      });
      return;
    }
    setActiveTab(value);
  };

  return (
    <div className="animate-fade-in container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Mercado</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Carteira</TabsTrigger>
          <TabsTrigger value="market-news">Notícias</TabsTrigger>
          <TabsTrigger value="finance-spreadsheet">Mercado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Acompanhamento da Carteira</h2>
                  <p className="text-muted-foreground">Acompanhe os ativos que compõe sua carteira de investimentos e principais índices de mercado que afetam suas aplicações.</p>
                </div>
                
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <MarketAssets />
                  <MarketAlerts />
                </div>
                
                <MarketOverview />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="market-news">
          <Card>
            <CardContent className="p-6">
              <MarketNews />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finance-spreadsheet">
          <Card>
            <CardContent className="p-6">
              <FinanceSpreadsheet spreadsheetUrl={userPlan?.spreadsheet_url} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
