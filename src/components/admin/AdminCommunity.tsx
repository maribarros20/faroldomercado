
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Pen, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Channel = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  is_company_specific: boolean;
  post_count?: number;
  mentor_id?: string | null;
  mentor_name?: string | null;
};

type Post = {
  id: string;
  title: string;
  content: string;
  channel_id: string;
  channel_name?: string;
  user_id: string;
  created_at: string;
  comments_count: number;
  likes_count: number;
};

type Mentor = {
  id: string;
  name: string;
  email: string;
};

const AdminCommunity = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isCompanySpecific, setIsCompanySpecific] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("channels");
  const { toast } = useToast();

  // Load mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoadingMentors(true);
        const { data, error } = await supabase.from("mentors").select("id, name, email").order("name");

        if (error) {
          throw error;
        }

        setMentors(data || []);
      } catch (error) {
        console.error("Error fetching mentors:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os mentores.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMentors(false);
      }
    };

    fetchMentors();
  }, [toast]);

  // Load channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoadingChannels(true);
        const { data, error } = await supabase
          .from("community_channels")
          .select("*, mentors(name)")
          .order("name");

        if (error) {
          throw error;
        }

        // Get post counts for each channel
        const channelsWithCounts = await Promise.all(
          (data || []).map(async (channel) => {
            const { count, error: countError } = await supabase
              .from("community_posts")
              .select("*", { count: "exact", head: true })
              .eq("channel_id", channel.id);

            return {
              ...channel,
              post_count: countError ? 0 : count || 0,
              mentor_name: channel.mentors?.name || null,
            };
          })
        );

        setChannels(channelsWithCounts);
      } catch (error) {
        console.error("Error fetching channels:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os canais.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingChannels(false);
      }
    };

    fetchChannels();
  }, [toast]);

  // Load posts when tab changes to posts
  useEffect(() => {
    if (activeTab === "posts") {
      const fetchPosts = async () => {
        try {
          setIsLoadingPosts(true);
          const { data, error } = await supabase
            .from("community_posts")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          // Get channel names for each post
          const postsWithChannels = await Promise.all(
            (data || []).map(async (post) => {
              const { data: channelData, error: channelError } = await supabase
                .from("community_channels")
                .select("name")
                .eq("id", post.channel_id)
                .single();

              return {
                ...post,
                channel_name: channelError ? "Canal desconhecido" : channelData?.name,
              };
            })
          );

          setPosts(postsWithChannels);
        } catch (error) {
          console.error("Error fetching posts:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar as postagens.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingPosts(false);
        }
      };

      fetchPosts();
    }
  }, [activeTab, toast]);

  const handleCreateChannel = async () => {
    try {
      if (!channelName.trim()) {
        toast({
          title: "Erro",
          description: "O nome do canal é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      const newChannel = {
        name: channelName,
        description: channelDescription,
        is_company_specific: isCompanySpecific,
        mentor_id: isCompanySpecific ? selectedMentorId : null,
      };

      const { data, error } = await supabase.from("community_channels").insert(newChannel).select();

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Canal criado com sucesso.",
      });

      // Find mentor name if applicable
      let mentorName = null;
      if (isCompanySpecific && selectedMentorId) {
        const mentor = mentors.find(m => m.id === selectedMentorId);
        mentorName = mentor?.name || null;
      }

      // Refresh channels list
      setChannels([...channels, { ...data[0], post_count: 0, mentor_name: mentorName }]);
      setChannelName("");
      setChannelDescription("");
      setIsCompanySpecific(false);
      setSelectedMentorId(null);
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o canal.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateChannel = async () => {
    try {
      if (!activeChannel || !channelName.trim()) {
        toast({
          title: "Erro",
          description: "O nome do canal é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      const updatedChannel = {
        name: channelName,
        description: channelDescription,
        is_company_specific: isCompanySpecific,
        mentor_id: isCompanySpecific ? selectedMentorId : null,
      };

      const { error } = await supabase
        .from("community_channels")
        .update(updatedChannel)
        .eq("id", activeChannel.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Canal atualizado com sucesso.",
      });

      // Find mentor name if applicable
      let mentorName = null;
      if (isCompanySpecific && selectedMentorId) {
        const mentor = mentors.find(m => m.id === selectedMentorId);
        mentorName = mentor?.name || null;
      }

      // Update local state
      setChannels(
        channels.map((c) =>
          c.id === activeChannel.id
            ? {
                ...c,
                name: channelName,
                description: channelDescription,
                is_company_specific: isCompanySpecific,
                mentor_id: isCompanySpecific ? selectedMentorId : null,
                mentor_name: mentorName,
              }
            : c
        )
      );
      
      setActiveChannel(null);
      setChannelName("");
      setChannelDescription("");
      setIsCompanySpecific(false);
      setSelectedMentorId(null);
    } catch (error) {
      console.error("Error updating channel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o canal.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      // Check if channel has posts
      const { count, error: countError } = await supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", channelId);

      if (countError) {
        throw countError;
      }

      if (count && count > 0) {
        toast({
          title: "Erro",
          description: "Este canal possui postagens. Remova as postagens primeiro.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("community_channels")
        .delete()
        .eq("id", channelId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Canal removido com sucesso.",
      });

      // Update local state
      setChannels(channels.filter((c) => c.id !== channelId));
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o canal.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // First delete all comments associated with this post
      const { error: commentsError } = await supabase
        .from("post_comments")
        .delete()
        .eq("post_id", postId);

      if (commentsError) {
        throw commentsError;
      }

      // Then delete all likes associated with this post
      const { error: likesError } = await supabase
        .from("user_likes")
        .delete()
        .eq("post_id", postId);

      if (likesError) {
        throw likesError;
      }

      // Finally delete the post
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Postagem removida com sucesso.",
      });

      // Update local state
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a postagem.",
        variant: "destructive",
      });
    }
  };

  const editChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setChannelName(channel.name);
    setChannelDescription(channel.description || "");
    setIsCompanySpecific(channel.is_company_specific);
    setSelectedMentorId(channel.mentor_id || null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciamento da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="channels">Canais</TabsTrigger>
            <TabsTrigger value="posts">Postagens</TabsTrigger>
          </TabsList>

          {/* Channels Management */}
          <TabsContent value="channels">
            <div className="mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Canal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Canal</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome do Canal*
                      </label>
                      <Input
                        id="name"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="Nome do canal"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Descrição
                      </label>
                      <Textarea
                        id="description"
                        value={channelDescription}
                        onChange={(e) => setChannelDescription(e.target.value)}
                        placeholder="Descrição do canal"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_company_specific"
                        checked={isCompanySpecific}
                        onChange={(e) => setIsCompanySpecific(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="is_company_specific" className="text-sm">
                        Específico para mentor/empresa
                      </label>
                    </div>
                    
                    {isCompanySpecific && (
                      <div>
                        <label htmlFor="mentor" className="block text-sm font-medium mb-1">
                          Mentor/Empresa*
                        </label>
                        <Select
                          value={selectedMentorId || ""}
                          onValueChange={setSelectedMentorId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um mentor" />
                          </SelectTrigger>
                          <SelectContent>
                            {mentors.map((mentor) => (
                              <SelectItem key={mentor.id} value={mentor.id}>
                                {mentor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isCompanySpecific && !selectedMentorId && (
                          <p className="text-xs text-red-500 mt-1">
                            Selecione um mentor para canais específicos
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button 
                        onClick={handleCreateChannel}
                        disabled={isCompanySpecific && !selectedMentorId}
                      >
                        Criar Canal
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {activeChannel && (
                <Dialog open={!!activeChannel} onOpenChange={(open) => !open && setActiveChannel(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Canal</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                          Nome do Canal*
                        </label>
                        <Input
                          id="edit-name"
                          value={channelName}
                          onChange={(e) => setChannelName(e.target.value)}
                          placeholder="Nome do canal"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                          Descrição
                        </label>
                        <Textarea
                          id="edit-description"
                          value={channelDescription}
                          onChange={(e) => setChannelDescription(e.target.value)}
                          placeholder="Descrição do canal"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="edit-is_company_specific"
                          checked={isCompanySpecific}
                          onChange={(e) => setIsCompanySpecific(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="edit-is_company_specific" className="text-sm">
                          Específico para mentor/empresa
                        </label>
                      </div>
                      
                      {isCompanySpecific && (
                        <div>
                          <label htmlFor="edit-mentor" className="block text-sm font-medium mb-1">
                            Mentor/Empresa*
                          </label>
                          <Select
                            value={selectedMentorId || ""}
                            onValueChange={setSelectedMentorId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um mentor" />
                            </SelectTrigger>
                            <SelectContent>
                              {mentors.map((mentor) => (
                                <SelectItem key={mentor.id} value={mentor.id}>
                                  {mentor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isCompanySpecific && !selectedMentorId && (
                            <p className="text-xs text-red-500 mt-1">
                              Selecione um mentor para canais específicos
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setActiveChannel(null)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleUpdateChannel}
                        disabled={isCompanySpecific && !selectedMentorId}
                      >
                        Atualizar Canal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isLoadingChannels ? (
              <div className="flex justify-center items-center h-40">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Postagens</TableHead>
                      <TableHead>Específico para Mentor/Empresa</TableHead>
                      <TableHead>Mentor/Empresa</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum canal encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      channels.map((channel) => (
                        <TableRow key={channel.id}>
                          <TableCell className="font-medium">{channel.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{channel.description || "-"}</TableCell>
                          <TableCell>{channel.post_count || 0}</TableCell>
                          <TableCell>{channel.is_company_specific ? "Sim" : "Não"}</TableCell>
                          <TableCell>{channel.is_company_specific ? (channel.mentor_name || '-') : "-"}</TableCell>
                          <TableCell>{new Date(channel.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => editChannel(channel)}>
                                <Pen className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteChannel(channel.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Posts Management */}
          <TabsContent value="posts">
            {isLoadingPosts ? (
              <div className="flex justify-center items-center h-40">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Comentários</TableHead>
                      <TableHead>Curtidas</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhuma postagem encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                          <TableCell>{post.channel_name}</TableCell>
                          <TableCell>{post.comments_count}</TableCell>
                          <TableCell>{post.likes_count}</TableCell>
                          <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Pen className="h-4 w-4 mr-1" /> Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{post.title}</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <div className="text-sm text-gray-500 mb-4">
                                    Canal: {post.channel_name} | 
                                    Criado em: {new Date(post.created_at).toLocaleString()} | 
                                    Comentários: {post.comments_count} | 
                                    Curtidas: {post.likes_count}
                                  </div>
                                  <div className="border p-4 rounded-md whitespace-pre-wrap">
                                    {post.content}
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="destructive" onClick={() => handleDeletePost(post.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Remover Postagem
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminCommunity;
