
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Channel } from "@/types/community";

interface ChannelsListProps {
  channels: Channel[];
  activeChannel: string | null;
  onSelectChannel: (channelId: string) => void;
}

const ChannelsList: React.FC<ChannelsListProps> = ({
  channels,
  activeChannel,
  onSelectChannel
}) => {
  return (
    <Card className="rounded-md border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Canais</CardTitle>
      </CardHeader>
      <CardContent>
        {channels.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum canal disponível
          </p>
        ) : (
          <div className="space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeChannel === channel.id ? "default" : "ghost"}
                className="w-full justify-start hover:bg-[#e6f0ff] hover:text-[#0066FF]"
                onClick={() => onSelectChannel(channel.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="truncate">{channel.name}</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelsList;
