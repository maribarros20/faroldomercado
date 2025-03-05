
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("market-news");

  return (
    <div className="animate-fade-in container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Mercado</h1>
      
      <Tabs defaultValue="market-news" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full md:w-auto flex flex-wrap">
          <TabsTrigger value="market-news">Notícias do Mercado</TabsTrigger>
          <TabsTrigger value="finance-spreadsheet">Planilha Financeira</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-6">
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
