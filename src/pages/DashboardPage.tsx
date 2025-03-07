
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";
import MarketAssets from "@/components/admin/MarketAssets";
import MarketAlerts from "@/components/admin/MarketAlerts";
import MarketOverview from "@/components/admin/MarketOverview";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";
import { useGreeting } from "@/hooks/use-greeting";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { greeting } = useGreeting(userName);

  // Check user plan and admin status
  useEffect(() => {
    const checkUserPlan = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and get their plan
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get the user's profile to check if they're an admin and get name
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, first_name, last_name')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            if (profileData.role === 'admin') {
              setIsAdmin(true);
            }
            // Set user name for greeting
            if (profileData.first_name) {
              setUserName(`${profileData.first_name} ${profileData.last_name || ''}`);
            }
          }

          // Get the user's subscription for non-admin users
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select(`
              id,
              plan_id,
              plans (
                id,
                name,
                description
              )
            `)
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .single();

          if (subscriptionData) {
            // Get plan features
            const { data: featureData, error: featureError } = await supabase
              .from('plan_features')
              .select('*')
              .eq('plan_id', subscriptionData.plan_id);

            const features = featureData?.filter(feature => feature.is_included).map(feature => feature.text.toLowerCase()) || [];
            
            setUserPlan({
              id: subscriptionData.plan_id,
              name: subscriptionData.plans.name,
              features: features
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
    if (isAdmin) return true; // Admins have access to all tabs
    if (!userPlan) return false;

    // Convert tab id to feature name format that would be in plan_features
    const featureMap: { [key: string]: string; } = {
      "dashboard": "dashboard",
      "market-news": "notícias do mercado",
      "finance-spreadsheet": "planilha financeira"
    };
    
    const featureName = featureMap[tabId];
    return userPlan.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel do Mercado</h1>
        <div className="flex items-center gap-3">
          {greeting && (
            <span className="text-sm text-muted-foreground">
              {greeting}
            </span>
          )}
          {/* Removed the duplicate QuickActions component here */}
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full md:w-auto flex flex-wrap">
          <TabsTrigger value="dashboard">Carteira</TabsTrigger>
          <TabsTrigger value="market-news">Notícias</TabsTrigger>
          <TabsTrigger value="finance-spreadsheet">Mercado</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-6">
            <TabsContent value="dashboard" className="mt-0">
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
            </TabsContent>
            
            <TabsContent value="market-news" className="mt-0">
              <MarketNews />
            </TabsContent>
            
            <TabsContent value="finance-spreadsheet" className="mt-0">
              <FinanceSpreadsheet 
                planId={userPlan && userPlan.id !== 'free' && userPlan.id !== 'guest' ? userPlan.id : undefined} 
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
