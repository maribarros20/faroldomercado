
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarketNews from "@/components/admin/MarketNews";
import FinanceSpreadsheet from "@/components/admin/FinanceSpreadsheet";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="animate-fade-in container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Mercado</h1>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
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
                    Bem-vindo ao painel de controle principal
                  </p>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Resumo</h3>
                      <p className="text-muted-foreground">
                        Visualize o resumo das suas atividades recentes
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Análises</h3>
                      <p className="text-muted-foreground">
                        Dados analíticos e métricas de desempenho
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
                      <p className="text-muted-foreground">
                        Acesse relatórios detalhados e exportações
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
