
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";
import MarketAssets from "@/components/admin/MarketAssets";
import MarketAlerts from "@/components/admin/MarketAlerts";
import MarketOverview from "@/components/admin/MarketOverview";
import MarketRadar from "@/components/admin/MarketRadar";
import { useToast } from "@/hooks/use-toast";
import { useUserPlan } from "@/contexts/UserPlanContext";

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { userPlan, hasAccessToTab } = useUserPlan();
  const { toast } = useToast();

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
    <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-6 w-full md:w-auto flex flex-wrap bg-white">
        <TabsTrigger 
          value="dashboard" 
          className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        >
          Carteira
        </TabsTrigger>
        <TabsTrigger 
          value="radar"
          className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        >
          Radar
        </TabsTrigger>
        <TabsTrigger 
          value="market-news"
          className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        >
          Notícias
        </TabsTrigger>
        <TabsTrigger 
          value="finance-spreadsheet"
          className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]"
        >
          Mercado
        </TabsTrigger>
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
          
          <TabsContent value="radar" className="mt-0">
            <MarketRadar />
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
  );
};

export default DashboardTabs;
