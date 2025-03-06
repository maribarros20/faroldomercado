import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Define types for user data
type User = {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    cnpj: string;
    phone: string;
    cpf: string;
    role: string;
    updated_at: string;
  };
};

// Define types for subscription data
type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string; // Computed status property
  created_at: string;
  is_active: boolean;
  is_canceled: boolean;
  expires_at: string;
  plan?: {
    name: string;
    price?: number; // Make price optional
  };
};

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Function to fetch subscribers and their subscriptions
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Fetch subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(name)");
      
      if (subscriptionsError) {
        console.error("Error fetching subscriptions:", subscriptionsError);
      }

      // Map profiles to users
      const usersWithProfiles = users.users.map((user: any) => {
        const profile = profiles?.find((p) => p.id === user.id);
        return {
          ...user,
          profile
        };
      });

      // Transform subscription data to include the status property
      const processedSubscriptions = subscriptionsData?.map((sub: any) => ({
        ...sub,
        status: sub.is_canceled ? 'canceled' : (sub.is_active ? 'active' : 'inactive')
      })) || [];

      setSubscribers(usersWithProfiles);
      setSubscriptions(processedSubscriptions);
    } catch (error) {
      console.error("Error in fetchSubscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      subscriber.email?.toLowerCase().includes(searchValue) ||
      subscriber.profile?.first_name?.toLowerCase().includes(searchValue) ||
      subscriber.profile?.last_name?.toLowerCase().includes(searchValue) ||
      subscriber.profile?.company?.toLowerCase().includes(searchValue)
    );
  });

  // Get subscription for a user
  const getUserSubscription = (userId: string) => {
    return subscriptions.find((sub) => sub.user_id === userId);
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assinantes</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchSubscribers}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar assinante..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left font-medium">Nome</th>
                <th className="py-3 text-left font-medium">Email</th>
                <th className="py-3 text-left font-medium">Plano</th>
                <th className="py-3 text-left font-medium">Status</th>
                <th className="py-3 text-left font-medium">Último acesso</th>
                <th className="py-3 text-left font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => {
                  const subscription = getUserSubscription(subscriber.id);
                  return (
                    <tr key={subscriber.id} className="border-b">
                      <td className="py-3">
                        {subscriber.profile?.first_name} {subscriber.profile?.last_name}
                      </td>
                      <td className="py-3">{subscriber.email}</td>
                      <td className="py-3">
                        {subscription?.plan?.name || "Sem plano"}
                      </td>
                      <td className="py-3">
                        <Badge variant={
                          subscription?.status === "active" ? "outline" : 
                          subscription?.status === "canceled" ? "destructive" : "secondary"
                        }>
                          {subscription?.status === "active" ? "Ativo" : 
                           subscription?.status === "canceled" ? "Cancelado" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3">{formatDate(subscriber.last_sign_in_at)}</td>
                      <td className="py-3">{formatDate(subscriber.created_at)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">
                    {loading ? "Carregando assinantes..." : "Nenhum assinante encontrado"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSubscribers;
