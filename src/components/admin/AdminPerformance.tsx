import React from "react";
import { useUserPerformance } from "@/hooks/use-user-performance";
import { PerformanceStats } from "@/components/admin/performance/PerformanceStats";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPerformance = () => {
  const { data: userPerformance, isLoading, error, refetch } = useUserPerformance();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [userTypeFilter, setUserTypeFilter] = React.useState("all");
  const { toast } = useToast();
  
  const handleExportCSV = () => {
    if (!userPerformance) return;
    
    const headers = [
      "ID", "Usuário", "Tipo de Conta", "Materiais Completos", 
      "Vídeos Assistidos", "Quizzes Completos", "Quizzes Passados", 
      "Nota Média", "Dias Ativos", "Conquistas", "Progresso Total"
    ];
    
    const rows = userPerformance.map(user => [
      user.id,
      user.username || `${user.first_name} ${user.last_name}`,
      user.tipo_de_conta,
      user.materials_completed,
      user.videos_watched,
      user.quizzes_completed,
      user.quizzes_passed,
      user.quizzes_score,
      user.active_days,
      user.achievements_count,
      user.total_progress
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "desempenho_usuarios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados com sucesso.",
    });
  };
  
  const filteredUsers = userPerformance?.filter(user => {
    const searchMatch = 
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const typeMatch = 
      userTypeFilter === "all" || 
      user.tipo_de_conta === userTypeFilter;
    
    return searchMatch && typeMatch;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Desempenho dos Usuários</h2>
          <p className="text-muted-foreground">
            Acompanhe o progresso e desempenho dos usuários na plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportCSV} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exportar CSV
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >
            <RefreshCw size={16} />
            Atualizar
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">Dados Detalhados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Não foi possível carregar os dados de desempenho.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PerformanceStats userStats={userPerformance || []} />
          )}
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados dos Usuários</CardTitle>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome de usuário..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={userTypeFilter}
                  onValueChange={setUserTypeFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="aluno">Aluno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Não foi possível carregar os dados de desempenho.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Usuário</th>
                        <th className="text-center py-2">Tipo</th>
                        <th className="text-center py-2">Materiais</th>
                        <th className="text-center py-2">Vídeos</th>
                        <th className="text-center py-2">Quizzes</th>
                        <th className="text-center py-2">Nota Média</th>
                        <th className="text-center py-2">Dias Ativos</th>
                        <th className="text-center py-2">Conquistas</th>
                        <th className="text-center py-2">Progresso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers?.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-6 text-muted-foreground">
                            Nenhum usuário encontrado com esses filtros.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers?.map((user) => (
                          <tr key={user.id} className="border-t">
                            <td className="py-2">
                              {user.username || `${user.first_name} ${user.last_name}`}
                            </td>
                            <td className="text-center py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.tipo_de_conta === 'trader' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {user.tipo_de_conta === 'trader' ? 'Trader' : 'Aluno'}
                              </span>
                            </td>
                            <td className="text-center py-2">{user.materials_completed}</td>
                            <td className="text-center py-2">{user.videos_watched}</td>
                            <td className="text-center py-2">{user.quizzes_completed}</td>
                            <td className="text-center py-2">{user.quizzes_score}%</td>
                            <td className="text-center py-2">{user.active_days}</td>
                            <td className="text-center py-2">{user.achievements_count}</td>
                            <td className="text-center py-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    user.total_progress >= 70 ? 'bg-green-600' : 
                                    user.total_progress >= 40 ? 'bg-blue-600' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${user.total_progress}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPerformance;
