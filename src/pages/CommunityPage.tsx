
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, MessageSquare, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import ChannelsList from "@/components/community/ChannelsList";
import CommunityPosts from "@/components/community/CommunityPosts";
import CreatePostDialog from "@/components/community/CreatePostDialog";

const CommunityPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Log activity when the page loads
  useEffect(() => {
    const logActivity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('user_activities').insert({
          user_id: session.user.id,
          activity_type: 'login',
          metadata: { page: 'community' }
        });
      }
    };
    
    logActivity();
  }, []);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['community-user-profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      setUserProfile(data);
      return data;
    }
  });

  // Fetch channels
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['community-channels', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq(activeTab === 'company' && userProfile?.company ? 'is_company_specific' : 'id', 
            activeTab === 'company' && userProfile?.company ? true : 'id');
      
      if (error) {
        console.error("Error fetching channels:", error);
        throw error;
      }

      // If company tab, filter by user's company
      let filteredData = data;
      if (activeTab === 'company' && userProfile?.company) {
        filteredData = data.filter(channel => channel.company_id === userProfile.company);
      }
      
      // Set the first channel as active if we don't have one
      if (filteredData.length > 0 && !activeChannel) {
        setActiveChannel(filteredData[0].id);
      }
      
      return filteredData;
    },
    enabled: !!userProfile
  });

  // Handle channel selection
  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
  };

  // Filter channels based on search query
  const filteredChannels = channels?.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 border-r bg-white hidden md:block">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Comunidade</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Buscar canais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="general">
                    <Users className="h-4 w-4 mr-2" />
                    Geral
                  </TabsTrigger>
                  <TabsTrigger value="company" disabled={!userProfile?.company}>
                    <User className="h-4 w-4 mr-2" />
                    Empresa
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {channelsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-trade-blue border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Canais</h3>
                    {userProfile?.role === 'admin' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <ChannelsList 
                    channels={filteredChannels || []}
                    activeChannel={activeChannel}
                    onSelectChannel={handleChannelSelect}
                  />
                </>
              )}
            </div>
          </div>

          {/* Mobile header */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10 p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold">Comunidade</h1>
              <div className="w-9"></div> {/* Empty div for alignment */}
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeChannel ? (
              <motion.div 
                className="flex-1 overflow-y-auto pt-16 md:pt-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CommunityPosts
                  channelId={activeChannel}
                  onCreatePost={() => setIsCreatePostOpen(true)}
                />
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Bem-vindo à Comunidade</h3>
                  <p className="text-gray-500 mb-4">
                    Selecione um canal para ver as postagens ou participe da conversa criando um novo post.
                  </p>
                  {channelsLoading ? (
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-trade-blue border-t-transparent"></div>
                    </div>
                  ) : channels && channels.length > 0 ? (
                    <Button 
                      onClick={() => setActiveChannel(channels[0].id)}
                      className="mt-2"
                    >
                      Entrar em {channels[0].name}
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum canal disponível no momento.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Post Dialog */}
      {activeChannel && (
        <CreatePostDialog 
          open={isCreatePostOpen} 
          onOpenChange={setIsCreatePostOpen} 
          channelId={activeChannel}
        />
      )}
    </div>
  );
};

export default CommunityPage;
