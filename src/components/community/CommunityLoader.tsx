
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/community";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

interface CommunityLoaderProps {
  onChannelsLoaded: (channels: Channel[], selectedChannelId: string, userProfile: any, isAdmin: boolean) => void;
  children: React.ReactNode;
}

const CommunityLoader: React.FC<CommunityLoaderProps> = ({ onChannelsLoaded, children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadUserAndChannels = async () => {
      setIsLoading(true);
      try {
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast({
            title: "Acesso não autorizado",
            description: "Você precisa estar logado para acessar o fórum da comunidade.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*, mentor_id, role")
          .eq("id", sessionData.session.user.id)
          .single();
        
        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seu perfil. Por favor, tente novamente.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
          
        // Check if user is admin
        const userIsAdmin = profileData?.role === 'admin';
        console.log("User role:", profileData?.role);
        console.log("User is admin:", userIsAdmin);
        
        const userMentorId = profileData?.mentor_id || null;

        // Get channels - filter based on access rules
        const { data: channelsData, error } = await supabase
          .from("community_channels")
          .select("*, mentor:mentor_id(id,name)")
          .order("name", { ascending: true });
          
        if (error) {
          console.error("Erro ao buscar canais:", error);
          throw error;
        }
        
        // Transform the data to match the Channel type
        const typedChannels = channelsData.map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          created_at: channel.created_at,
          updated_at: channel.updated_at,
          created_by: channel.created_by,
          is_company_specific: channel.is_company_specific,
          company_id: channel.company_id,
          mentor_id: channel.mentor_id,
          mentor_name: channel.mentor?.name
        })) as Channel[];
        
        // Filter channels based on access permissions
        let accessibleChannels;
        
        if (userIsAdmin) {
          // Admins see all channels
          accessibleChannels = typedChannels;
        } else {
          // Regular users see public channels and those matching their mentor
          accessibleChannels = typedChannels.filter(channel => {
            // If not company specific, everyone can access
            if (!channel.is_company_specific) {
              return true;
            }
            // If company specific, only users associated with the mentor can access
            return channel.mentor_id === userMentorId;
          });
        }
        
        // Select first channel if accessible channels exist
        const initialSelectedChannelId = accessibleChannels.length > 0 ? accessibleChannels[0].id : "";
        
        // Log activity
        if (sessionData.session) {
          await supabase.from("user_activities").insert({
            user_id: sessionData.session.user.id,
            activity_type: "view_community",
            metadata: { page: "community" }
          } as any);
        }

        // Pass the loaded data to parent component
        onChannelsLoaded(accessibleChannels, initialSelectedChannelId, profileData, userIsAdmin);
      } catch (error) {
        console.error("Error loading channels:", error);
        toast({
          title: "Erro ao carregar canais",
          description: "Ocorreu um erro ao carregar os canais da comunidade.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserAndChannels();
  }, [toast, onChannelsLoaded]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default CommunityLoader;
