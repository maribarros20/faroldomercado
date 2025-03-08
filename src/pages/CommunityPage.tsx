
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, AlertCircle } from "lucide-react";
import ChannelsList from "@/components/community/ChannelsList";
import CommunityPosts from "@/components/community/CommunityPosts";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/community"; // Import Channel type from common types
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CommunityPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
        }
          
        setUserProfile(profileData || null);
        
        // Check if user is admin - important to debug
        const userIsAdmin = profileData?.role === 'admin';
        console.log("User role:", profileData?.role);
        console.log("User is admin:", userIsAdmin);
        setIsAdmin(userIsAdmin);
        
        const userMentorId = profileData?.mentor_id || null;

        // Get channels - filter based on access rules
        const { data: channelsData, error } = await supabase
          .from("community_channels")
          .select("*, mentor:mentor_id(id,name)")
          .order("name", { ascending: true });
          
        if (error) {
          throw error;
        }
        
        console.log("Channels data:", channelsData);
        console.log("Total channels:", channelsData.length);
        
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
        
        // Filter channels based on access permissions - admins can see all channels
        let accessibleChannels;
        if (userIsAdmin) {
          // Admins see all channels
          console.log("User is admin, showing all channels");
          accessibleChannels = typedChannels;
        } else {
          // Regular users see public channels and those matching their mentor
          console.log("User is not admin, filtering channels");
          accessibleChannels = typedChannels.filter(channel => {
            // If not company specific, everyone can access
            if (!channel.is_company_specific) {
              return true;
            }
            // If company specific, only users associated with the mentor can access
            return channel.mentor_id === userMentorId;
          });
        }
        
        console.log("Accessible channels:", accessibleChannels.length);
        setChannels(accessibleChannels);
        
        // Select first channel if none selected and accessible channels exist
        if (accessibleChannels.length > 0 && !selectedChannelId) {
          setSelectedChannelId(accessibleChannels[0].id);
          setCurrentChannel(accessibleChannels[0]);
        }
        
        // Log activity
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

  // Check channel access when selection changes
  useEffect(() => {
    if (!selectedChannelId || !channels.length) return;
    
    const selectedChannel = channels.find(channel => channel.id === selectedChannelId);
    if (selectedChannel) {
      setCurrentChannel(selectedChannel);
      
      // Check if user has access to this channel - admins always have access
      if (!isAdmin && selectedChannel.is_company_specific && selectedChannel.mentor_id !== userProfile?.mentor_id) {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
    }
  }, [selectedChannelId, channels, userProfile, isAdmin]);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleCreatePostSuccess = () => {
    setIsCreatePostOpen(false);
    toast({
      title: "Postagem criada",
      description: "Sua postagem foi publicada com sucesso."
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comunidade</h1>
        <Button 
          onClick={() => setIsCreatePostOpen(true)}
          disabled={isLoading || !selectedChannelId || accessDenied}
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Postagem
        </Button>
      </div>
      
      <Tabs defaultValue="forum" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forum">Fórum</TabsTrigger>
          <TabsTrigger value="mentors" disabled>Mentores</TabsTrigger>
          <TabsTrigger value="network" disabled>Networking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forum">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <Spinner size="lg" />
                </div>
              </CardContent>
            </Card>
          ) : channels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <ChannelsList 
                  channels={channels} 
                  activeChannel={selectedChannelId}
                  onSelectChannel={handleSelectChannel}
                />
              </div>
              
              <div className="md:col-span-3">
                {accessDenied ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Acesso Restrito</AlertTitle>
                    <AlertDescription>
                      Este canal é específico para usuários associados ao mentor/empresa {currentChannel?.mentor_name}. 
                      Você não tem permissão para acessar este conteúdo.
                    </AlertDescription>
                  </Alert>
                ) : (
                  selectedChannelId && userProfile?.id && (
                    <CommunityPosts 
                      channelId={selectedChannelId}
                      userId={userProfile.id}
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Nenhum canal disponível no momento.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <CreatePostDialog 
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onPostCreated={handleCreatePostSuccess}
        channelId={selectedChannelId}
      />
    </div>
  );
};

export default CommunityPage;
