
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Edit, Plus } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_company_specific: boolean;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  channel_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

const AdminCommunity = () => {
  const [activeTab, setActiveTab] = useState("channels");
  const [newChannel, setNewChannel] = useState({ name: "", description: "" });
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Channel[];
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao carregar canais",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Fetch posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Post[];
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao carregar posts",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (channelData: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from('community_channels')
        .insert([
          { 
            name: channelData.name, 
            description: channelData.description,
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      setNewChannel({ name: "", description: "" });
      setIsChannelDialogOpen(false);
      toast({
        title: "Canal criado",
        description: "O canal foi criado com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao criar canal",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Update channel mutation
  const updateChannelMutation = useMutation({
    mutationFn: async (channelData: { id: string; name: string; description: string }) => {
      const { data, error } = await supabase
        .from('community_channels')
        .update({ 
          name: channelData.name, 
          description: channelData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', channelData.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      setEditingChannel(null);
      setIsChannelDialogOpen(false);
      toast({
        title: "Canal atualizado",
        description: "O canal foi atualizado com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao atualizar canal",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const { error } = await supabase
        .from('community_channels')
        .delete()
        .eq('id', channelId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return channelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
      toast({
        title: "Canal excluído",
        description: "O canal foi excluído com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao excluir canal",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso",
      });
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Erro ao excluir post",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do canal é obrigatório",
        variant: "destructive"
      });
      return;
    }
    createChannelMutation.mutate(newChannel);
  };

  const handleUpdateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel || !editingChannel.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do canal é obrigatório",
        variant: "destructive"
      });
      return;
    }
    updateChannelMutation.mutate({
      id: editingChannel.id,
      name: editingChannel.name,
      description: editingChannel.description || ""
    });
  };

  const handleDeleteChannel = (channelId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este canal? Esta ação não pode ser desfeita.")) {
      deleteChannelMutation.mutate(channelId);
    }
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setIsChannelDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingChannel(null);
    setIsChannelDialogOpen(false);
    setNewChannel({ name: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento da Comunidade</h2>
        <Button onClick={() => {
          setEditingChannel(null);
          setIsChannelDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Canal
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4 mt-4">
          {isLoadingChannels ? (
            <div className="flex justify-center items-center h-40">
              <Spinner />
            </div>
          ) : !channels || channels.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Nenhum canal encontrado. Crie um novo canal para começar.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map(channel => (
                <Card key={channel.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate" title={channel.name}>
                        {channel.name}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditChannel(channel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteChannel(channel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2" title={channel.description || ''}>
                      {channel.description || 'Sem descrição'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Criado em {new Date(channel.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {isLoadingPosts ? (
            <div className="flex justify-center items-center h-40">
              <Spinner />
            </div>
          ) : !posts || posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Nenhum post encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
                const channel = channels?.find(c => c.id === post.channel_id);
                return (
                  <Card key={post.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg truncate" title={post.title}>
                            {post.title}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            Canal: {channel?.name || 'Desconhecido'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3" title={post.content}>
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span>
                          Publicado em {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-4">
                          <span>{post.likes_count} curtidas</span>
                          <span>{post.comments_count} comentários</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Channel Dialog (Create/Edit) */}
      <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? "Editar Canal" : "Criar Novo Canal"}
            </DialogTitle>
            <DialogDescription>
              {editingChannel 
                ? "Atualize as informações do canal abaixo." 
                : "Preencha as informações para criar um novo canal."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editingChannel ? handleUpdateChannel : handleCreateChannel}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="channel-name" className="text-sm font-medium">
                  Nome do Canal*
                </label>
                <Input
                  id="channel-name"
                  value={editingChannel ? editingChannel.name : newChannel.name}
                  onChange={(e) => {
                    if (editingChannel) {
                      setEditingChannel({...editingChannel, name: e.target.value});
                    } else {
                      setNewChannel({...newChannel, name: e.target.value});
                    }
                  }}
                  placeholder="Digite o nome do canal"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="channel-description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="channel-description"
                  value={editingChannel ? editingChannel.description || "" : newChannel.description}
                  onChange={(e) => {
                    if (editingChannel) {
                      setEditingChannel({...editingChannel, description: e.target.value});
                    } else {
                      setNewChannel({...newChannel, description: e.target.value});
                    }
                  }}
                  placeholder="Digite uma descrição para o canal"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingChannel ? "Salvar Alterações" : "Criar Canal"}
                {(createChannelMutation.isPending || updateChannelMutation.isPending) && (
                  <Spinner className="ml-2" size="sm" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommunity;
