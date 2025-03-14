import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type PlanFeature = {
  id: string;
  text: string;
  is_included: boolean;
  plan_id: string;
}

type Plan = {
  id: string;
  name: string;
  description: string;
  monthly_price: number | null;
  yearly_price: number | null;
  is_popular: boolean;
  is_active: boolean;
  features: PlanFeature[];
}

const PlansPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  const { data: userSubscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_id, is_active')
        .eq('user_id', session.user.id)
        .single();
      
      if (error || !data) return null;
      
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => {
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });
      
      if (plansError) {
        console.error("Error fetching plans:", plansError);
        throw plansError;
      }

      const plansWithFeatures = await Promise.all(plansData.map(async (plan) => {
        const { data: featuresData, error: featuresError } = await supabase
          .from('plan_features')
          .select('*')
          .eq('plan_id', plan.id);
        
        if (featuresError) {
          console.error(`Error fetching features for plan ${plan.id}:`, featuresError);
          return { ...plan, features: [] };
        }
        
        return { ...plan, features: featuresData };
      }));

      return plansWithFeatures;
    }
  });

  const handleSelectPlan = (planId: string) => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "default",
      });
      navigate("/auth");
      return;
    }

    if (userSubscription && userSubscription.plan_id === planId && userSubscription.is_active) {
      toast({
        title: "Você já possui este plano",
        description: "Você já está inscrito neste plano.",
        variant: "default",
      });
      return;
    }

    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A funcionalidade de assinatura será implementada em breve.",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Carregando planos disponíveis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-500 mb-2">Erro ao carregar planos</p>
        <p className="text-gray-500 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Planos e Preços</h1>
      </div>
      
      <div className="text-center mb-12">
        <p className="text-gray-600 max-w-2xl mx-auto">
          Escolha o plano ideal para sua jornada de aprendizado em trading. Todos os planos incluem acesso 
          à plataforma e conteúdos exclusivos.
        </p>
        
        <div className="mt-8 bg-gray-100 inline-flex rounded-lg p-1 select-none">
          <button 
            className={`px-4 py-2 rounded-md transition-all ${billingPeriod === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Mensal
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-all ${billingPeriod === 'yearly' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Anual
            <span className="ml-1 text-xs text-green-500 font-medium">Economize 17%</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = userSubscription && userSubscription.plan_id === plan.id && userSubscription.is_active;
          const relevantPrice = billingPeriod === 'monthly' ? plan.monthly_price : plan.yearly_price;
          
          if ((billingPeriod === 'monthly' && plan.monthly_price === null) || 
              (billingPeriod === 'yearly' && plan.yearly_price === null)) {
            return null;
          }
          
          return (
            <Card 
              key={plan.id} 
              className={`border overflow-hidden h-full flex flex-col ${plan.is_popular ? 'ring-2 ring-trade-blue shadow-lg relative' : 'shadow-md'}`}
            >
              {plan.is_popular && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-trade-blue text-white">
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {relevantPrice !== null ? `R$ ${relevantPrice.toFixed(2)}` : 'Consulte'}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    {billingPeriod === 'monthly' ? '/mês' : '/ano'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.id} className="flex items-start">
                      <div className={`mt-0.5 ${feature.is_included ? 'text-green-500' : 'text-gray-300'}`}>
                        {feature.is_included ? <Check size={18} /> : <X size={18} />}
                      </div>
                      <span className={`ml-2 text-sm ${feature.is_included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="mt-auto">
                <Button 
                  className={`w-full ${isCurrentPlan ? 'bg-green-600 hover:bg-green-700' : (plan.is_popular ? 'bg-trade-blue hover:bg-trade-blue/90' : '')}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Plano Atual' : 'Escolher Plano'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-12 bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Perguntas Frequentes</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Como funciona a assinatura?</h4>
            <p className="text-gray-600 text-sm">
              As assinaturas são cobradas de acordo com o período escolhido. Você terá acesso a todos os 
              recursos disponíveis no plano selecionado imediatamente após a confirmação do pagamento.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Posso alterar meu plano?</h4>
            <p className="text-gray-600 text-sm">
              Sim, você pode fazer upgrade para um plano superior a qualquer momento. Mudanças para planos 
              inferiores serão aplicadas no próximo ciclo de cobrança.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Como funciona o período de trial?</h4>
            <p className="text-gray-600 text-sm">
              Novos assinantes recebem um período de trial de 15 dias para testar a plataforma. 
              Você não será cobrado durante esse período e pode cancelar a qualquer momento.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Posso cancelar minha assinatura?</h4>
            <p className="text-gray-600 text-sm">
              Sim, você pode cancelar sua assinatura a qualquer momento. Após o cancelamento, 
              você continuará com acesso até o final do período já pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
