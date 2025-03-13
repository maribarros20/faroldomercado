import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";
import MarketRadar from "@/components/admin/MarketRadar";
import MarketOverviewTab from "@/components/market/MarketOverviewTab";
import { useToast } from "@/hooks/use-toast";
import { useUserPlan } from "@/contexts/UserPlanContext";
const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const {
    userPlan,
    hasAccessToTab
  } = useUserPlan();
  const {
    toast
  } = useToast();

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
  return <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-6 w-full md:w-auto flex flex-wrap bg-white shadow-sm">
        <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]">Acompanhar</TabsTrigger>
        <TabsTrigger value="market-overview" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]">Monitorar</TabsTrigger>
        <TabsTrigger value="market-news" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]">
          Notícias
        </TabsTrigger>
        <TabsTrigger value="finance-spreadsheet" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white hover:bg-[#e6f0ff] hover:text-[#0066FF]">
          Mercado
        </TabsTrigger>
      </TabsList>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          <TabsContent value="dashboard" className="mt-0">
            <MarketRadar />
          </TabsContent>
          
          <TabsContent value="market-overview" className="mt-0">
            <MarketOverviewTab />
          </TabsContent>
          
          <TabsContent value="market-news" className="mt-0">
            <MarketNews />
          </TabsContent>
          
          <TabsContent value="finance-spreadsheet" className="mt-0">
            <FinanceSpreadsheet planId={userPlan && userPlan.id !== 'free' && userPlan.id !== 'guest' ? userPlan.id : undefined} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>;
};
export default DashboardTabs;