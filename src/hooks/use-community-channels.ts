
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/community";
import { useToast } from "@/hooks/use-toast";

export type CommunityChannelsResult = {
  isLoading: boolean;
  channels: Channel[];
  userProfile: any;
  isAdmin: boolean;
  accessDenied: boolean;
  currentChannel: Channel | null;
  selectedChannelId: string;
  setSelectedChannelId: (channelId: string) => void;
};

export const useCommunityChannels = (): CommunityChannelsResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserAndChannels = async () => {
      setIsLoading(true);
      try {
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
          
        setUserProfile(profileData || null);
        
        const userIsAdmin = profileData?.role === 'admin';
        console.log("User role:", profileData?.role);
        console.log("User is admin:", userIsAdmin);
        setIsAdmin(userIsAdmin);
        
        const userMentorId = profileData?.mentor_id || null;

        const { data: channelsData, error } = await supabase
          .from("community_channels")
          .select("*, mentor:mentor_id(id,name)")
          .order("name", { ascending: true });
          
        if (error) {
          console.error("Erro ao buscar canais:", error);
          throw error;
        }
        
        console.log("Channels data:", channelsData);
        console.log("Total channels:", channelsData.length);
        
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
        
        let accessibleChannels;
        
        if (userIsAdmin) {
          console.log("User is admin, showing all channels");
          accessibleChannels = typedChannels;
        } else {
          console.log("User is not admin, filtering channels");
          accessibleChannels = typedChannels.filter(channel => {
            if (!channel.is_company_specific) {
              return true;
            }
            return channel.mentor_id === userMentorId;
          });
        }
        
        console.log("Accessible channels:", accessibleChannels.length);
        
        if (accessibleChannels.length === 0) {
          console.log("No accessible channels found");
          if (userIsAdmin) {
            console.log("User is admin but no channels were found. This is unexpected.");
          }
        }
        
        setChannels(accessibleChannels);
        
        if (accessibleChannels.length > 0 && !selectedChannelId) {
          setSelectedChannelId(accessibleChannels[0].id);
          setCurrentChannel(accessibleChannels[0]);
        }
        
        if (sessionData.session) {
          await supabase.from("user_activities").insert({
            user_id: sessionData.session.user.id,
            activity_type: "view_community",
            metadata: { page: "community" }
          } as any);
        }
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
  }, [toast]);

  useEffect(() => {
    if (!selectedChannelId || !channels.length) return;
    
    const selectedChannel = channels.find(channel => channel.id === selectedChannelId);
    if (selectedChannel) {
      setCurrentChannel(selectedChannel);
      
      if (!isAdmin && selectedChannel.is_company_specific && selectedChannel.mentor_id !== userProfile?.mentor_id) {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
    }
  }, [selectedChannelId, channels, userProfile, isAdmin]);

  return {
    isLoading,
    channels,
    userProfile,
    isAdmin,
    accessDenied,
    currentChannel,
    selectedChannelId,
    setSelectedChannelId
  };
};
