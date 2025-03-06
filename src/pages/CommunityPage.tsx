
import React, { useState, useEffect } from "react";
import CommunityPosts from "@/components/community/CommunityPosts";
import ChannelsList from "@/components/community/ChannelsList";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CommunityPage = () => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking authentication:", error);
          setHasError(true);
          toast({
            title: "Erro na autenticação",
            description: "Não foi possível verificar sua sessão. Por favor, faça login novamente.",
            variant: "destructive"
          });
          return;
        }
        
        if (!data.session) {
          // User is not authenticated, redirect to login
          window.location.href = "/auth";
          return;
        }
        
        // Load default channel
        const { data: channels, error: channelsError } = await supabase
          .from('community_channels')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        if (channelsError) {
          console.error("Error fetching default channel:", channelsError);
        } else if (channels) {
          setSelectedChannelId(channels.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error in auth check:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);

  // Select a channel
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  // Open create post dialog
  const handleCreatePost = () => {
    setIsCreateDialogOpen(true);
  };

  // Handle post creation success
  const handlePostCreated = () => {
    setIsCreateDialogOpen(false);
    toast({
      title: "Post criado",
      description: "Seu post foi publicado com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p>Carregando comunidade...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar</h2>
          <p className="mb-4">Não foi possível carregar a página da comunidade. Por favor, tente novamente mais tarde.</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Channels sidebar */}
        <div className="w-full md:w-1/4">
          <ChannelsList
            selectedChannelId={selectedChannelId}
            onSelectChannel={handleSelectChannel}
          />
        </div>
        
        {/* Posts content */}
        <div className="w-full md:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Publicações</h2>
            <Button onClick={handleCreatePost}>
              <Plus className="mr-2 h-4 w-4" />
              Nova publicação
            </Button>
          </div>
          
          {selectedChannelId ? (
            <CommunityPosts channelId={selectedChannelId} />
          ) : (
            <Card className="p-6 text-center">
              <p>Selecione um canal para ver as publicações</p>
            </Card>
          )}
        </div>
      </div>
      
      {/* Create post dialog */}
      <CreatePostDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onPostCreated={handlePostCreated}
        channelId={selectedChannelId}
      />
    </div>
  );
};

export default CommunityPage;
