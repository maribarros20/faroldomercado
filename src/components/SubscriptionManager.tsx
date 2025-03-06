
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  is_popular: boolean;
  is_active: boolean;
  duration_days: number;
  trial_days: number;
};

type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  created_at: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  is_canceled: boolean;
  plan?: Plan;
};

const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return;
      }
      
      // Get user's subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching subscription:", error);
        return;
      }
      
      if (data) {
        setSubscription(data);
        
        // Check if subscription is expired
        const now = new Date();
        const expiryDate = new Date(data.expires_at);
        setIsExpired(now > expiryDate);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      if (!subscription) return;
      
      const { error } = await supabase
        .from("subscriptions")
        .update({ is_canceled: true })
        .eq("id", subscription.id);
        
      if (error) {
        console.error("Error canceling subscription:", error);
        toast({
          title: "Erro ao cancelar assinatura",
          description: "Não foi possível processar o cancelamento. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
      });
      
      // Update local state
      setSubscription({
        ...subscription,
        is_canceled: true
      });
      
      // Close the dialog
      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao cancelar assinatura",
        description: "Ocorreu um erro ao processar o cancelamento. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const reactivateSubscription = async () => {
    try {
      if (!subscription) return;
      
      const { error } = await supabase
        .from("subscriptions")
        .update({ is_canceled: false })
        .eq("id", subscription.id);
        
      if (error) {
        console.error("Error reactivating subscription:", error);
        toast({
          title: "Erro ao reativar assinatura",
          description: "Não foi possível processar a reativação. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Assinatura reativada",
        description: "Sua assinatura foi reativada com sucesso.",
      });
      
      // Update local state
      setSubscription({
        ...subscription,
        is_canceled: false
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao reativar assinatura",
        description: "Ocorreu um erro ao processar a reativação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Carregando informações da assinatura...</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Assinatura</CardTitle>
          <CardDescription>Gerencie sua assinatura atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 mb-4 text-sm text-amber-800 border border-amber-300 rounded-lg bg-amber-50">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span>Você não possui uma assinatura ativa no momento.</span>
          </div>
          <Button variant="default" onClick={() => window.location.href = "/plans"}>
            Ver planos disponíveis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Assinatura</CardTitle>
        <CardDescription>Gerencie sua assinatura atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Plano atual</p>
            <p className="text-xl font-semibold">{subscription.plan?.name}</p>
          </div>
          <Badge variant={subscription.is_canceled ? "destructive" : (isExpired ? "secondary" : "outline")}>
            {subscription.is_canceled ? "Cancelado" : (isExpired ? "Expirado" : "Ativo")}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Descrição</p>
          <p className="text-sm text-muted-foreground">{subscription.plan?.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm font-medium">Data de início</p>
            <p className="text-sm">{format(new Date(subscription.started_at), "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Validade</p>
            <p className="text-sm">{format(new Date(subscription.expires_at), "dd/MM/yyyy")}</p>
          </div>
        </div>

        {subscription.is_canceled && (
          <div className="flex items-center p-4 mt-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
            <XCircle className="w-5 h-5 mr-3" />
            <span>Assinatura cancelada. Deseja reativar?</span>
          </div>
        )}

        {isExpired && !subscription.is_canceled && (
          <div className="flex items-center p-4 mt-4 text-sm text-amber-800 border border-amber-300 rounded-lg bg-amber-50">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span>Sua assinatura expirou. Renove para continuar.</span>
          </div>
        )}

        {!isExpired && !subscription.is_canceled && (
          <div className="flex items-center p-4 mt-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50">
            <CheckCircle className="w-5 h-5 mr-3" />
            <span>Sua assinatura está ativa.</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {subscription.is_canceled ? (
          <Button onClick={reactivateSubscription}>
            Reativar assinatura
          </Button>
        ) : (
          isExpired ? (
            <Button variant="default" onClick={() => window.location.href = "/plans"}>
              Renovar assinatura
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              Cancelar assinatura
            </Button>
          )
        )}
        
        <Button variant="outline" onClick={() => window.location.href = "/plans"}>
          Alterar plano
        </Button>
      </CardFooter>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso a recursos premium quando seu período atual expirar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={cancelSubscription}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SubscriptionManager;
