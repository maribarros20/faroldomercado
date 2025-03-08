
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Channel } from "@/types/community";
import CommunityLoader from "@/components/community/CommunityLoader";
import CommunityContent from "@/components/community/CommunityContent";

const CommunityPage = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleDataLoaded = (
    loadedChannels: Channel[], 
    initialChannelId: string, 
    profileData: any, 
    userIsAdmin: boolean
  ) => {
    setChannels(loadedChannels);
    setSelectedChannelId(initialChannelId);
    setUserProfile(profileData);
    setIsAdmin(userIsAdmin);
    setIsDataLoaded(true);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Tabs defaultValue="forum" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forum">Fórum</TabsTrigger>
          <TabsTrigger value="mentors" disabled>Mentores</TabsTrigger>
          <TabsTrigger value="network" disabled>Networking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forum">
          <CommunityLoader onChannelsLoaded={handleDataLoaded}>
            {isDataLoaded && (
              <CommunityContent
                channels={channels}
                initialChannelId={selectedChannelId}
                userProfile={userProfile}
                isAdmin={isAdmin}
              />
            )}
          </CommunityLoader>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPage;
