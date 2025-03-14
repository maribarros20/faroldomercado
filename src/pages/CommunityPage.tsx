
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCommunityChannels } from "@/hooks/use-community-channels";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityPageHeader from "@/components/community/CommunityPageHeader";
import CommunityForumContent from "@/components/community/CommunityForumContent";
import CreatePostDialog from "@/components/community/CreatePostDialog";

const CommunityPage = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    isLoading,
    channels,
    userProfile,
    isAdmin,
    accessDenied,
    currentChannel,
    selectedChannelId,
    setSelectedChannelId
  } = useCommunityChannels();

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

  const handleOpenCreatePost = () => {
    setIsCreatePostOpen(true);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <CommunityPageHeader />
      
      <CommunityHeader 
        onCreatePost={handleOpenCreatePost}
        isDisabled={isLoading || !selectedChannelId || accessDenied}
      />
      
      <Tabs defaultValue="forum" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forum">Fórum</TabsTrigger>
          <TabsTrigger value="mentors" disabled>Mentores</TabsTrigger>
          <TabsTrigger value="network" disabled>Networking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forum">
          <CommunityForumContent 
            isLoading={isLoading}
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={handleSelectChannel}
            accessDenied={accessDenied}
            currentChannel={currentChannel}
            userId={userProfile?.id || ""}
          />
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
