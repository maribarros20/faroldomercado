
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import ChannelsList from "@/components/community/ChannelsList";
import { Channel } from "@/types/community";

interface ChannelsSectionProps {
  isLoading: boolean;
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
}

const ChannelsSection: React.FC<ChannelsSectionProps> = ({
  isLoading,
  channels,
  selectedChannelId,
  onSelectChannel
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Nenhum canal disponível no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ChannelsList 
      channels={channels} 
      activeChannel={selectedChannelId}
      onSelectChannel={onSelectChannel}
    />
  );
};

export default ChannelsSection;
