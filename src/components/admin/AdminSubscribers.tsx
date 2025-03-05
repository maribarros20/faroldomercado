
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2, Search } from "lucide-react";

interface User {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  created_at?: string; // Making this optional
  plan?: {
    name: string;
  };
  subscription_id?: string;
  subscription_active?: boolean;
  subscription_started?: string;
  subscription_expires?: string;
}

const AdminSubscribers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users with their subscription data
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get users from profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      // For each profile, get their auth data (for email)
      const usersWithEmail = await Promise.all(
        profiles.map(async (profile) => {
          // Get subscriptions data if available
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*, plan:plan_id(name)')
            .eq('user_id', profile.id)
            .maybeSingle();
          
          return {
            ...profile,
            plan: subscriptionData?.plan,
            subscription_id: subscriptionData?.id,
            subscription_active: subscriptionData?.is_active,
            subscription_started: subscriptionData?.started_at,
            subscription_expires: subscriptionData?.expires_at
          } as User;
        })
      );
      
      return usersWithEmail;
    }
  });

  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assinantes</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                    {user.role === 'admin' && (
                      <Badge variant="outline" className="ml-2">Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.company || "-"}</TableCell>
                  <TableCell>{user.plan?.name || "Sem plano"}</TableCell>
                  <TableCell>
                    {user.subscription_active ? (
                      <Badge className="bg-green-500">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.updated_at ? format(new Date(user.updated_at), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">Nenhum assinante encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribers;
