
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, RefreshCw, FileText, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type AuditLog = {
  id: string;
  created_at: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: any;
};

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching audit logs:", error);
        return;
      }
      
      setLogs(data || []);
      
      // Fetch user profiles for all unique user IDs in logs
      const userIds = [...new Set(data?.map(log => log.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        
        if (profilesError) {
          console.error("Error fetching user profiles:", profilesError);
          return;
        }
        
        const profileMap: Record<string, UserProfile> = {};
        profiles?.forEach(profile => {
          profileMap[profile.id] = profile;
        });
        
        setUserProfiles(profileMap);
      }
    } catch (error) {
      console.error("Error in fetchAuditLogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Get unique entity types and actions for filters
  const entityTypes = [...new Set(logs.map(log => log.entity_type))];
  const actions = [...new Set(logs.map(log => log.action))];

  // Filter logs based on search term and dropdown filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      searchTerm === "" || 
      (userProfiles[log.user_id]?.first_name + " " + userProfiles[log.user_id]?.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntityType = entityTypeFilter === "" || log.entity_type === entityTypeFilter;
    const matchesAction = actionFilter === "" || log.action === actionFilter;
    
    return matchesSearch && matchesEntityType && matchesAction;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return "bg-green-100 text-green-800 border-green-200";
      case 'update':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'delete':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUserName = (userId: string) => {
    const profile = userProfiles[userId];
    return profile 
      ? `${profile.first_name} ${profile.last_name}` 
      : `Usuário ${userId.slice(0, 8)}...`;
  };

  const getUserEmail = (userId: string) => {
    return userProfiles[userId]?.email || "Email não disponível";
  };

  // Function to clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setEntityTypeFilter('');
    setActionFilter('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Logs de Auditoria</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchAuditLogs}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar logs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Tipo de Entidade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Tipos</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Ação" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as Ações</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2 text-sm text-muted-foreground">Carregando logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 border rounded-md">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
            <p className="text-muted-foreground">
              Nenhum log de auditoria disponível no momento.
            </p>
            <Button 
              variant="outline" 
              onClick={fetchAuditLogs}
              className="mt-2"
            >
              Atualizar logs
            </Button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 border rounded-md">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
            <p className="text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </p>
            <Button 
              variant="link" 
              onClick={clearFilters}
              className="mt-2"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium">Data/Hora</th>
                  <th className="py-3 text-left font-medium">Usuário</th>
                  <th className="py-3 text-left font-medium">Entidade</th>
                  <th className="py-3 text-left font-medium">ID da Entidade</th>
                  <th className="py-3 text-left font-medium">Ação</th>
                  <th className="py-3 text-left font-medium">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-3">
                      <div className="font-medium">{getUserName(log.user_id)}</div>
                      <div className="text-xs text-muted-foreground">{getUserEmail(log.user_id)}</div>
                    </td>
                    <td className="py-3 capitalize">
                      {log.entity_type}
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-xs">
                        {log.entity_id}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant="outline" 
                        className={`${getActionBadgeColor(log.action)} capitalize`}
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          Expandir detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAuditLogs;
