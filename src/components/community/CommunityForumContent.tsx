
import React from "react";
import { Channel } from "@/types/community";
import CommunityLoading from "./CommunityLoading";
import CommunityEmptyState from "./CommunityEmptyState";
import ChannelsSection from "./ChannelsSection";
import PostsSection from "./PostsSection";

interface CommunityForumContentProps {
  isLoading: boolean;
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  accessDenied: boolean;
  currentChannel: Channel | null;
  userId: string;
}

const CommunityForumContent: React.FC<CommunityForumContentProps> = ({
  isLoading,
  channels,
  selectedChannelId,
  onSelectChannel,
  accessDenied,
  currentChannel,
  userId
}) => {
  if (isLoading) {
    return <CommunityLoading />;
  }
  
  if (channels.length === 0) {
    return <CommunityEmptyState />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <ChannelsSection 
          isLoading={isLoading}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={onSelectChannel}
        />
      </div>
      
      <div className="md:col-span-3">
        <PostsSection 
          accessDenied={accessDenied}
          currentChannel={currentChannel}
          selectedChannelId={selectedChannelId}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default CommunityForumContent;
