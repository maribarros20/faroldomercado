
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type for user plans
export type UserPlan = {
  id: string;
  name: string;
  features: string[];
  is_mentor_plan?: boolean;
  mentor_id?: string | null;
  spreadsheet_url?: string;
};

type UserPlanContextType = {
  userPlan: UserPlan | null;
  isLoading: boolean;
  isAdmin: boolean;
  isMentor: boolean;
  isStudent: boolean;
  isTrader: boolean;
  accountType: string | null;
  userName: string | null;
  mentorId: string | null;
  hasAccessToTab: (tabId: string) => boolean;
};

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined);

export const UserPlanProvider = ({ children }: { children: ReactNode }) => {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isTrader, setIsTrader] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check user plan and account type
  useEffect(() => {
    const checkUserPlan = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and get their plan
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get the user's profile to check account type
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, first_name, last_name, tipo_de_conta, mentor_link_id, plan_id')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            // Set account type
            setAccountType(profileData.tipo_de_conta || 'trader');
            setIsAdmin(profileData.role === 'admin');
            setIsMentor(profileData.tipo_de_conta === 'mentor');
            setIsStudent(profileData.tipo_de_conta === 'aluno');
            setIsTrader(profileData.tipo_de_conta === 'trader');
            setMentorId(profileData.mentor_link_id);
            
            // Set user name for greeting
            if (profileData.first_name) {
              setUserName(`${profileData.first_name} ${profileData.last_name || ''}`);
            }

            // Get the plan based on the profile's plan_id
            if (profileData.plan_id) {
              const { data: planData, error: planError } = await supabase
                .from('plans')
                .select('id, name, description, is_mentor_plan, mentor_id')
                .eq('id', profileData.plan_id)
                .single();

              if (planData) {
                // Get plan features
                const { data: featureData, error: featureError } = await supabase
                  .from('plan_features')
                  .select('*')
                  .eq('plan_id', planData.id);

                const features = featureData?.filter(feature => feature.is_included).map(feature => feature.text.toLowerCase()) || [];
                
                setUserPlan({
                  id: planData.id,
                  name: planData.name,
                  features: features,
                  is_mentor_plan: planData.is_mentor_plan,
                  mentor_id: planData.mentor_id
                });
              } else {
                // User without valid plan
                setUserPlan({
                  id: "free",
                  name: "Gratuito",
                  features: ["dashboard"]
                });
              }
            } else {
              // User without subscription or basic plan
              setUserPlan({
                id: "free",
                name: "Gratuito",
                features: ["dashboard"]
              });

              // Show informative toast for traders only (not for admins, mentors, or students)
              if (profileData.tipo_de_conta === 'trader' && profileData.role !== 'admin') {
                toast({
                  title: "Acesso limitado",
                  description: "Algumas funcionalidades estão disponíveis apenas para assinantes. Faça upgrade do seu plano.",
                  variant: "default"
                });
              }
            }
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
    
    // Mentors have access to specific tabs
    if (isMentor) {
      const mentorTabs = ["dashboard", "materials", "videos", "community", "students", "plans"];
      return mentorTabs.includes(tabId);
    }
    
    // Students have access to their mentor's content
    if (isStudent) {
      const studentTabs = ["dashboard", "materials", "videos", "community", "progress"];
      return studentTabs.includes(tabId);
    }
    
    // For traders, check plan features
    if (!userPlan) return false;

    // Convert tab id to feature name format that would be in plan_features
    const featureMap: { [key: string]: string; } = {
      "dashboard": "dashboard",
      "market-news": "notícias do mercado",
      "finance-spreadsheet": "planilha financeira"
    };
    
    const featureName = featureMap[tabId] || tabId;
    return userPlan.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );
  };

  const value = {
    userPlan,
    isLoading,
    isAdmin,
    isMentor,
    isStudent,
    isTrader,
    accountType,
    userName,
    mentorId,
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
