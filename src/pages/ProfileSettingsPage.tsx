
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import SubscriptionManager from "@/components/SubscriptionManager";
import MentorSelector from "@/components/MentorSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Profile } from "@/types/community";

const ProfileSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("mentor");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Acesso não autorizado",
            description: "Você precisa estar logado para acessar esta página.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        console.log("Session active, user ID:", session.user.id);
        
        // Fetch profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seus dados. Tente novamente mais tarde.",
            variant: "destructive"
          });
          return;
        }
        
        if (!profile) {
          console.warn("Profile not found for user ID:", session.user.id);
          // Try to create profile based on auth data
          const { user } = session;
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error("Error getting user data:", userError);
            return;
          }
          
          const userMetadata = userData.user?.user_metadata;
          console.log("User metadata available:", userMetadata);
          
          if (userMetadata) {
            const newProfile = {
              id: user.id,
              first_name: userMetadata.first_name || "",
              last_name: userMetadata.last_name || "",
              email: user.email || "",
              phone: userMetadata.phone || null,
              cpf: userMetadata.cpf || null,
              date_of_birth: userMetadata.date_of_birth || new Date().toISOString().split('T')[0],
              role: "user" as "user" | "admin"
            };
            
            console.log("Creating new profile with data:", newProfile);
            
            const { error: insertError } = await supabase
              .from("profiles")
              .insert(newProfile);
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              toast({
                title: "Erro ao criar perfil",
                description: "Não foi possível criar seu perfil. Tente novamente mais tarde.",
                variant: "destructive"
              });
              return;
            }
            
            toast({
              title: "Perfil criado",
              description: "Seu perfil foi criado com sucesso.",
            });
            
            setProfileData(newProfile as Profile);
          }
        } else {
          console.log("Profile retrieved successfully:", profile);
          setProfileData(profile as Profile);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Configurações da Conta</h1>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando...</div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mentor">Mentor</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mentor">
            <MentorSelector userId={profileData?.id} currentMentorId={profileData?.mentor_id} />
          </TabsContent>
          
          <TabsContent value="subscription">
            <SubscriptionManager />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProfileSettingsPage;
