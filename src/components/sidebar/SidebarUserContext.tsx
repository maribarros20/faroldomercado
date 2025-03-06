
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserContextType = {
  user: any | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        setUser(sessionData.session.user);
        
        // Check if user is admin
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionData.session.user.id)
          .single();
          
        setIsAdmin(profileData?.role === "admin");
      }
    };
    
    fetchUserData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
          
          // Check if user is admin
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
            
          setIsAdmin(profileData?.role === "admin");
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sair da sua conta.",
        variant: "destructive",
      });
      return Promise.reject(error);
    } else {
      toast({
        title: "Sucesso",
        description: "Você saiu da sua conta com sucesso.",
      });
      return Promise.resolve();
    }
  };

  return (
    <UserContext.Provider value={{ user, isAdmin, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
