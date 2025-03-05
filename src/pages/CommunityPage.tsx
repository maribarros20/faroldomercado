
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Heart, Send, Search, Plus, Filter, Clock, ThumbsUp, MessageCircle, PinIcon, BookmarkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommunityChannel, CommunityPost } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import CommunityChannelCard from "@/components/community/CommunityChannelCard";

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    channelId: "",
  });
  const { toast } = useToast();
  
  // Fetch user information
  const { data: userData } = useQuery({
    queryKey: ['user-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        id: session.user.id,
        profile
      };
    },
  });
  
  // Fetch channels
  const { data: channels, isLoading: loadingChannels } = useQuery({
    queryKey: ['community-channels'],
    queryFn: async () => {
      // Get all channels plus company-specific channels for the user
      const queries = [
        supabase
          .from('community_channels')
          .select('*')
          .eq('is_company_specific', false)
          .order('name'),
      ];
      
      // Add company-specific channel query if user has company
      if (userData?.profile?.company) {
        queries.push(
          supabase
            .from('community_channels')
            .select('*')
            .eq('is_company_specific', true)
            .eq('company_id', userData.profile.company)
            .order('name')
        );
      }
      
      const results = await Promise.all(queries);
      
      // Handle any errors
      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }
      
      // Combine results
      const allChannels = [...(results[0].data || [])];
      if (results.length > 1) {
        allChannels.push(...(results[1].data || []));
      }
      
      return allChannels;
    },
    enabled: !!userData,
  });
  
  // Fetch posts for the active channel
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['community-posts', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          author:user_id (
            first_name,
            last_name,
            company
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (activeTab !== "all") {
        // Find the channel ID for the active tab
        const channelId = channels?.find(channel => 
          channel.name.toLowerCase().replace(/\s+/g, '-') === activeTab
        )?.id;
        
        if (channelId) {
          query = query.eq('channel_id', channelId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!channels,
  });
  
  // Filter posts based on search query
  const filteredPosts = posts?.filter(post => {
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.author?.first_name?.toLowerCase().includes(searchLower) ||
      post.author?.last_name?.toLowerCase().includes(searchLower) ||
      post.author?.company?.toLowerCase().includes(searchLower)
    );
  });
  
  // Create a new post
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.channelId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar um post.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: session.user.id,
          channel_id: newPost.channelId,
          title: newPost.title,
          content: newPost.content,
          is_pinned: false,
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Post criado",
        description: "Seu post foi publicado com sucesso!",
      });
      
      // Reset form and close dialog
      setNewPost({
        title: "",
        content: "",
        channelId: "",
      });
      setNewPostDialog(false);
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar post",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Comunidade</h1>
        <p className="text-gray-500 mt-2">
          Conecte-se com outros investidores, compartilhe conhecimentos e discuta sobre o mercado
        </p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-12">
        {/* Sidebar with channels */}
        <div className="md:col-span-3">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-trade-blue" />
                Canais
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <Button
                variant="outline"
                className="w-full justify-start mb-4"
                onClick={() => setActiveTab("all")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Todos os Posts
              </Button>
              
              <div className="space-y-1">
                {loadingChannels ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full mb-2" />
                  ))
                ) : (
                  channels?.map(channel => (
                    <Button
                      key={channel.id}
                      variant={activeTab === channel.name.toLowerCase().replace(/\s+/g, '-') ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(channel.name.toLowerCase().replace(/\s+/g, '-'))}
                    >
                      # {channel.name}
                      {channel.is_company_specific && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Empresa
                        </Badge>
                      )}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => setNewPostDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-9">
          <div className="space-y-6">
            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Pesquisar posts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Recentes
                </Button>
                <Button 
                  onClick={() => setNewPostDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Post
                </Button>
              </div>
            </div>
            
            {/* Posts grid */}
            <div className="space-y-4">
              {loadingPosts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full mb-4" />
                ))
              ) : filteredPosts && filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <CommunityPostCard 
                    key={post.id} 
                    post={post as CommunityPost} 
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum post encontrado</h3>
                    <p className="text-gray-500 text-center mb-6">
                      {searchQuery 
                        ? "Não encontramos posts que correspondam à sua pesquisa."
                        : "Seja o primeiro a iniciar uma discussão neste canal!"}
                    </p>
                    <Button onClick={() => setNewPostDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Novo Post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* New Post Dialog */}
      <Dialog open={newPostDialog} onOpenChange={setNewPostDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Post</DialogTitle>
            <DialogDescription>
              Compartilhe suas ideias, dúvidas ou insights com a comunidade.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                placeholder="Um título claro e descritivo"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Conteúdo
              </label>
              <Textarea
                id="content"
                placeholder="O que você gostaria de compartilhar?"
                rows={6}
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="channel" className="text-sm font-medium">
                Canal
              </label>
              <select
                id="channel"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newPost.channelId}
                onChange={(e) => setNewPost({...newPost, channelId: e.target.value})}
              >
                <option value="">Selecione um canal</option>
                {channels?.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name} {channel.is_company_specific ? '(Empresa)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPostDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePost}>
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
