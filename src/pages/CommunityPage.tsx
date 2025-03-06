
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChannelsList from "@/components/community/ChannelsList";
import CommunityPosts from "@/components/community/CommunityPosts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Type for channel data
type Channel = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_company_specific: boolean;
  company_id: string | null;
};

// Type for user profile data
type UserProfile = {
  id: string;
  role: string;
  company_id?: string | null;
  cnpj?: string | null;
  first_name?: string;
  last_name?: string;
};

// Type for subscription plan
type Plan = {
  id: string;
  name: string;
  description: string;
  monthly_price: number | null;
  yearly_price: number | null;
  duration_days: number;
  trial_days: number;
  is_active: boolean | null;
  is_popular: boolean | null;
  features?: PlanFeature[];
};

// Type for plan feature
type PlanFeature = {
  id: string;
  feature_code: string;
  is_enabled: boolean;
};

const CommunityPage = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserAccess = async () => {
      setLoading(true);
      
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar a comunidade.",
            variant: "destructive"
          });
          return;
        }
        
        // Get user profile to check role and company
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }
        
        // Map to UserProfile interface
        const userProfileData: UserProfile = {
          id: profileData.id,
          role: profileData.role,
          company_id: profileData.mentor_id || null, // Use mentor_id as company_id
          cnpj: profileData.cnpj || null
        };
        
        setUserProfile(userProfileData);
        
        // Get user's active subscription
        const { data: subscription, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("*, plan:plans(id, name, description, monthly_price, yearly_price, duration_days, trial_days, is_active, is_popular)")
          .eq("user_id", session.user.id)
          .eq("is_active", true)
          .maybeSingle();
        
        if (subscriptionError) {
          console.error("Error fetching subscription:", subscriptionError);
        }
        
        // Check if subscription has a plan and is not canceled or expired
        if (subscription && subscription.plan) {
          // Check if subscription is expired or canceled
          const now = new Date();
          const expiryDate = new Date(subscription.expires_at);
          const isExpired = now > expiryDate;
          const isCanceled = subscription.is_canceled;
          
          if (isExpired || isCanceled) {
            toast({
              title: isExpired ? "Assinatura expirada" : "Assinatura cancelada",
              description: isExpired 
                ? "Sua assinatura expirou. Renove para acessar a comunidade." 
                : "Sua assinatura foi cancelada. Reative para acessar a comunidade.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          
          // Get plan features
          const { data: planFeatures } = await supabase
            .from("plan_features")
            .select("*")
            .eq("plan_id", subscription.plan.id);
            
          // Add features to plan
          const planWithFeatures = {
            ...subscription.plan,
            features: planFeatures || []
          };
          
          // Update subscription with features
          const subscriptionWithFeatures = {
            ...subscription,
            plan: planWithFeatures
          };
          
          setUserSubscription(subscriptionWithFeatures);
          
          // Check if user has access to community
          const hasCommunityAccess = planFeatures?.some((feature: any) => 
            feature.text.toLowerCase().includes("comunidade") && feature.is_included
          );
          
          if (!hasCommunityAccess) {
            toast({
              title: "Recurso não disponível",
              description: "Seu plano atual não inclui acesso à comunidade. Faça upgrade para obter acesso.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        }
        
        // Fetch channels
        if (userProfileData) {
          fetchChannels(userProfileData);
        }
        
      } catch (error) {
        console.error("Error checking user access:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar seu acesso. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAccess();
  }, [toast]);

  const fetchChannels = async (profile: UserProfile) => {
    try {
      let query = supabase
        .from("community_channels")
        .select("*")
        .order("name");
      
      // If user is not admin and has a company, filter by company-specific channels
      if (profile.role !== "admin" && profile.company_id) {
        query = query.or(`is_company_specific.eq.false,company_id.eq.${profile.company_id}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching channels:", error);
        return;
      }
      
      setChannels(data || []);
      
      // Select first channel by default if available
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
      
    } catch (error) {
      console.error("Error in fetchChannels:", error);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  // If user doesn't have an active subscription or doesn't have access to community
  if (userSubscription && 
      userSubscription.plan && 
      userSubscription.plan.features && 
      !userSubscription.plan.features.some((f: any) => 
        f.text.toLowerCase().includes("comunidade") && f.is_included
      )) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Comunidade</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">Recurso não disponível</h2>
            <p className="text-center text-muted-foreground mb-6">
              Seu plano atual não inclui acesso à comunidade do Farol do Mercado.
              Faça upgrade para interagir com outros membros e mentores.
            </p>
            <Button>Ver planos disponíveis</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Comunidade</h1>
      
      {loading ? (
        <div className="text-center py-8">Carregando comunidade...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <ChannelsList 
              channels={channels} 
              activeChannel={selectedChannel} 
              onSelectChannel={handleChannelSelect}
            />
          </div>
          
          <div className="md:col-span-3">
            {selectedChannel ? (
              <CommunityPosts channelId={selectedChannel} />
            ) : (
              <Card>
                <CardContent className="flex justify-center items-center p-8">
                  <p>Selecione um canal para ver as publicações</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
