
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type for user plans
export type UserPlan = {
  id: string;
  name: string;
  features: string[];
  spreadsheet_url?: string;
};

type UserPlanContextType = {
  userPlan: UserPlan | null;
  isLoading: boolean;
  isAdmin: boolean;
  userName: string | null;
  hasAccessToTab: (tabId: string) => boolean;
};

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined);

export const UserPlanProvider = ({ children }: { children: ReactNode }) => {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();

  // Check user plan and admin status
  useEffect(() => {
    const checkUserPlan = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and get their plan
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get the user's profile to check if they're an admin and get name
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, first_name, last_name')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            if (profileData.role === 'admin') {
              setIsAdmin(true);
            }
            // Set user name for greeting
            if (profileData.first_name) {
              setUserName(`${profileData.first_name} ${profileData.last_name || ''}`);
            }
          }

          // Get the user's subscription for non-admin users
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select(`
              id,
              plan_id,
              plans (
                id,
                name,
                description
              )
            `)
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .single();

          if (subscriptionData) {
            // Get plan features
            const { data: featureData, error: featureError } = await supabase
              .from('plan_features')
              .select('*')
              .eq('plan_id', subscriptionData.plan_id);

            const features = featureData?.filter(feature => feature.is_included).map(feature => feature.text.toLowerCase()) || [];
            
            setUserPlan({
              id: subscriptionData.plan_id,
              name: subscriptionData.plans.name,
              features: features
            });
          } else {
            // User without subscription or basic plan
            setUserPlan({
              id: "free",
              name: "Gratuito",
              features: ["dashboard"]
            });

            // Show informative toast
            toast({
              title: "Acesso limitado",
              description: "Algumas funcionalidades estão disponíveis apenas para assinantes. Faça upgrade do seu plano.",
              variant: "default"
            });
          }
        } else {
          // User not logged in
          setUserPlan({
            id: "guest",
            name: "Visitante",
            features: ["dashboard"]
          });
          toast({
            title: "Acesso limitado",
            description: "Faça login para acessar mais funcionalidades ou assine um plano premium.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Erro ao verificar plano do usuário:", error);
        setUserPlan({
          id: "free",
          name: "Gratuito",
          features: ["dashboard"]
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserPlan();
  }, [toast]);

  // Check access to a specific tab
  const hasAccessToTab = (tabId: string) => {
    if (isAdmin) return true; // Admins have access to all tabs
    if (!userPlan) return false;

    // Convert tab id to feature name format that would be in plan_features
    const featureMap: { [key: string]: string; } = {
      "dashboard": "dashboard",
      "market-news": "notícias do mercado",
      "finance-spreadsheet": "planilha financeira"
    };
    
    const featureName = featureMap[tabId];
    return userPlan.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );
  };

  const value = {
    userPlan,
    isLoading,
    isAdmin,
    userName,
    hasAccessToTab
  };

  return (
    <UserPlanContext.Provider value={value}>
      {children}
    </UserPlanContext.Provider>
  );
};

export const useUserPlan = () => {
  const context = useContext(UserPlanContext);
  if (context === undefined) {
    throw new Error("useUserPlan must be used within a UserPlanProvider");
  }
  return context;
};
