
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import ChannelsList from "@/components/community/ChannelsList";
import CommunityPosts from "@/components/community/CommunityPosts";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/community"; // Import Channel type from common types

const CommunityPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadChannels = async () => {
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
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionData.session.user.id as any)
          .single();
          
        setUserProfile(profileData || null);

        // Get channels
        const { data: channelsData, error } = await supabase
          .from("community_channels")
          .select("*")
          .order("name", { ascending: true });
          
        if (error) {
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
          company_id: channel.company_id
        })) as Channel[];
        
        setChannels(typedChannels);
        
        // Select first channel if none selected
        if (typedChannels.length > 0 && !selectedChannelId) {
          setSelectedChannelId(typedChannels[0].id);
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
    
    loadChannels();
  }, [toast, selectedChannelId]);

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
          disabled={isLoading || !selectedChannelId}
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
                <div className="text-center">Carregando...</div>
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
                {selectedChannelId && userProfile?.id && (
                  <CommunityPosts 
                    channelId={selectedChannelId}
                    userId={userProfile.id}
                  />
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
