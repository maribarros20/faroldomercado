
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Package, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserPlanInfoProps {
  userId: string;
}

const UserPlanInfo = ({ userId }: UserPlanInfoProps) => {
  const {
    data: userPlanData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-plan', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("ID do usuário não fornecido");
      }

      // Buscar assinatura do usuário
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          plan_id,
          started_at,
          expires_at,
          is_active,
          plans(*)
        `)
        .eq('user_id', userId)
        .single();

      if (subError) {
        if (subError.code === 'PGRST116') {
          // No subscription found
          return { hasPlan: false };
        }
        throw subError;
      }

      if (!subscription) {
        return { hasPlan: false };
      }

      // Buscar recursos do plano
      const { data: planFeatures, error: featuresError } = await supabase
        .from('plan_features')
        .select('*')
        .eq('plan_id', subscription.plan_id);

      if (featuresError) {
        throw featuresError;
      }

      const isActive = subscription.is_active;
      const isExpired = subscription.expires_at && new Date(subscription.expires_at) < new Date();
      
      let status: 'active' | 'trial' | 'expired' | 'canceled' = 'active';
      
      if (!isActive) {
        status = 'canceled';
      } else if (isExpired) {
        status = 'expired';
      } else {
        // Check if still in trial period (less than 30 days since started)
        const startDate = new Date(subscription.started_at);
        const now = new Date();
        const daysActive = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysActive < 30) {
          status = 'trial';
        }
      }

      return {
        hasPlan: true,
        id: subscription.id,
        planId: subscription.plan_id,
        plan: subscription.plans,
        features: planFeatures || [],
        startDate: new Date(subscription.started_at).toLocaleDateString('pt-BR'),
        expiryDate: subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('pt-BR') : null,
        status
      };
    },
    enabled: !!userId
  });

  const getStatusBadge = (status: 'active' | 'trial' | 'expired' | 'canceled') => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-500 border-green-200">Ativo</Badge>;
      case "trial":
        return <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200">Trial</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-500 border-yellow-200">Expirado</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">Cancelado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
          <p className="text-gray-500">Carregando informações do plano...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-500 mb-2">Erro ao carregar plano</p>
          <p className="text-gray-500 text-sm mb-4">{(error as Error).message}</p>
          <Button 
            variant="outline"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!userPlanData?.hasPlan) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Meu Plano</CardTitle>
          <CardDescription>Você ainda não possui um plano ativo</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="mb-4 p-4 bg-gray-100 rounded-full">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-center mb-4">
            Você ainda não possui uma assinatura ativa. Adquira um plano para acessar todos os recursos da plataforma.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="bg-trade-blue hover:bg-trade-blue/90">
            Ver Planos Disponíveis
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`border-gray-200 relative overflow-hidden ${userPlanData.plan.is_popular ? 'ring-2 ring-trade-blue' : ''}`}>
      {userPlanData.plan.is_popular && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-trade-blue text-white">
            Popular
          </span>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-trade-blue mr-2" />
            <CardTitle>{userPlanData.plan.name}</CardTitle>
          </div>
          {getStatusBadge(userPlanData.status)}
        </div>
        <CardDescription>{userPlanData.plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          {userPlanData.plan.monthly_price > 0 && (
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900">R$ {userPlanData.plan.monthly_price.toFixed(2)}</span>
              <span className="text-gray-500 text-sm ml-1">/mês</span>
            </div>
          )}
          {userPlanData.plan.yearly_price > 0 && (
            <div>
              <span className="text-2xl font-bold text-gray-900">R$ {userPlanData.plan.yearly_price.toFixed(2)}</span>
              <span className="text-gray-500 text-sm ml-1">/ano</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-medium mb-2">Recursos incluídos:</h3>
          {userPlanData.features.map((feature) => (
            <div key={feature.id} className="flex items-start">
              <div className={`mt-0.5 ${feature.is_included ? 'text-green-500' : 'text-red-500'}`}>
                {feature.is_included ? <Check size={16} /> : <X size={16} />}
              </div>
              <span className={`ml-2 text-sm ${feature.is_included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Data de adesão:</span>
            <span>{userPlanData.startDate}</span>
          </div>
          
          {userPlanData.expiryDate && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Próxima cobrança:</span>
              <span>{userPlanData.expiryDate}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">Gerenciar Assinatura</Button>
        <Button>Alterar Plano</Button>
      </CardFooter>
    </Card>
  );
};

export default UserPlanInfo;
