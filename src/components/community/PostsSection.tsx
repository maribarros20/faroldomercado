
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import CommunityPosts from "@/components/community/CommunityPosts";
import { Channel } from "@/types/community";

interface PostsSectionProps {
  accessDenied: boolean;
  currentChannel: Channel | null;
  selectedChannelId: string;
  userId: string;
}

const PostsSection: React.FC<PostsSectionProps> = ({
  accessDenied,
  currentChannel,
  selectedChannelId,
  userId
}) => {
  if (accessDenied) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Este canal é específico para usuários associados ao mentor/empresa {currentChannel?.mentor_name}. 
          Você não tem permissão para acessar este conteúdo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    selectedChannelId && userId ? (
      <CommunityPosts 
        channelId={selectedChannelId}
        userId={userId}
      />
    ) : null
  );
};

export default PostsSection;
