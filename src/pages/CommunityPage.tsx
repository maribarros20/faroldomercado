
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/community';
import CommunityPosts from '@/components/community/CommunityPosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CommunityPage = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('community_channels')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching channels:', error);
          return;
        }

        if (data && data.length > 0) {
          setChannels(data as Channel[]);
          setActiveChannel(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (channels.length === 0) {
    return <div className="p-4">Nenhum canal disponível.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Comunidade</h1>
      
      <Tabs defaultValue={activeChannel || channels[0]?.id} onValueChange={(value) => setActiveChannel(value)}>
        <TabsList className="mb-6">
          {channels.map((channel) => (
            <TabsTrigger key={channel.id} value={channel.id}>
              {channel.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {channels.map((channel) => (
          <TabsContent key={channel.id} value={channel.id}>
            {userId && activeChannel && (
              <CommunityPosts channelId={channel.id} userId={userId} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CommunityPage;
