
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = subscribeToNotifications();
    
    // Check for platform updates periodically
    const platformUpdateInterval = setInterval(checkForPlatformUpdates, 3600000); // Check every hour
    
    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(platformUpdateInterval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data as Notification[] || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const subscribeToNotifications = () => {
    try {
      const channel = supabase
        .channel("schema-db-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications"
          },
          (payload) => {
            console.log("Notification change received:", payload);
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      return undefined;
    }
  };

  // Function to check for platform updates
  const checkForPlatformUpdates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Check for new content (videos, materials, etc.)
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      if (!lastLoginTime) {
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        return;
      }
      
      // Check for new videos
      const { data: newVideos, error: videosError } = await supabase
        .from("videos")
        .select("count")
        .gt("created_at", lastLoginTime);
        
      if (videosError) throw videosError;
      
      // Check for new materials
      const { data: newMaterials, error: materialsError } = await supabase
        .from("materials")
        .select("count")
        .gt("date_added", lastLoginTime);
        
      if (materialsError) throw materialsError;
      
      // If there are new items, create a notification
      if ((newVideos && newVideos.length > 0) || (newMaterials && newMaterials.length > 0)) {
        await supabase
          .from('notifications')
          .insert({
            user_id: session.user.id,
            title: "Novos conteúdos disponíveis",
            message: "Novos vídeos e materiais foram adicionados na plataforma desde seu último acesso.",
            read: false
          });
      }
      
      // Update the last login time
      localStorage.setItem('lastLoginTime', new Date().toISOString());
    } catch (error) {
      console.error("Error checking for platform updates:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}
