
import React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  description?: string;
  is_company_specific: boolean;
}

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
  // If no channels available, show empty state
  if (channels.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">Nenhum canal disponível.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {channels.map((channel) => (
        <li key={channel.id}>
          <button
            onClick={() => onSelectChannel(channel.id)}
            className={cn(
              "w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
              activeChannel === channel.id
                ? "bg-gray-100 text-trade-blue font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{channel.name}</span>
            {channel.is_company_specific && (
              <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">Empresa</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ChannelsList;
