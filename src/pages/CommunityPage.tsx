
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/community';
import CommunityPosts from '@/components/community/CommunityPosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

const CommunityPage = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
          setError('Erro ao verificar sua sessão. Por favor, atualize a página.');
          return;
        }
        
        if (data.session) {
          setUserId(data.session.user.id);
        } else {
          setError('Você precisa estar autenticado para acessar a comunidade.');
        }
      } catch (e) {
        console.error('Error in getSession:', e);
        setError('Ocorreu um erro ao verificar sua sessão.');
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('community_channels')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching channels:', error);
          setError('Erro ao carregar os canais da comunidade.');
          toast({
            title: "Erro",
            description: "Não foi possível carregar os canais da comunidade.",
            variant: "destructive"
          });
          return;
        }

        if (data && data.length > 0) {
          setChannels(data as Channel[]);
          setActiveChannel(data[0].id);
        } else {
          setError('Nenhum canal disponível.');
        }
      } catch (e) {
        console.error('Error in fetchChannels:', e);
        setError('Ocorreu um erro ao carregar os canais.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchChannels();
    }
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Comunidade</h1>
        <div className="flex items-center justify-center h-64">
          <Spinner />
          <span className="ml-2">Carregando canais da comunidade...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Comunidade</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Comunidade</h1>
        <div className="p-4 bg-gray-100 rounded-md">Nenhum canal disponível.</div>
      </div>
    );
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
