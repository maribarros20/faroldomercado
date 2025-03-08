
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Channel } from "@/types/community";
import ChannelsSection from '@/components/community/ChannelsSection';
import PostsSection from '@/components/community/PostsSection';
import CommunityHeader from '@/components/community/CommunityHeader';
import CreatePostDialog from '@/components/community/CreatePostDialog';
import { useToast } from '@/hooks/use-toast';

interface CommunityContentProps {
  channels: Channel[];
  initialChannelId: string;
  userProfile: any;
  isAdmin: boolean;
}

const CommunityContent: React.FC<CommunityContentProps> = ({
  channels,
  initialChannelId,
  userProfile,
  isAdmin
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(initialChannelId);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(
    channels.find(channel => channel.id === initialChannelId) || null
  );
  const [accessDenied, setAccessDenied] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();

  // Update current channel when selection changes
  useEffect(() => {
    if (!selectedChannelId || !channels.length) return;
    
    const selectedChannel = channels.find(channel => channel.id === selectedChannelId);
    if (selectedChannel) {
      setCurrentChannel(selectedChannel);
      
      // Check if user has access to this channel
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

  const handleOpenCreatePost = () => {
    setIsCreatePostOpen(true);
  };

  return (
    <>
      <CommunityHeader 
        onCreatePost={handleOpenCreatePost}
        isDisabled={!selectedChannelId || accessDenied}
      />
      
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <ChannelsSection 
              isLoading={false}
              channels={channels}
              selectedChannelId={selectedChannelId}
              onSelectChannel={handleSelectChannel}
            />
          </div>
          
          <div className="md:col-span-3">
            <PostsSection 
              accessDenied={accessDenied}
              currentChannel={currentChannel}
              selectedChannelId={selectedChannelId}
              userId={userProfile?.id || ""}
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Nenhum canal disponível no momento.</p>
          </CardContent>
        </Card>
      )}
      
      <CreatePostDialog 
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onPostCreated={handleCreatePostSuccess}
        channelId={selectedChannelId}
      />
    </>
  );
};

export default CommunityContent;
