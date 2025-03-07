
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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
  const { toast } = useToast();
  
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

      // Evitamos lançar erro ao buscar as notificações
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Não foi possível buscar notificações:", error);
        return;
      }

      setNotifications(data as Notification[] || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.log("Erro ao buscar notificações:", error);
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
      console.log("Erro ao se inscrever para notificações:", error);
      return undefined;
    }
  };

  // Atualizamos a função para não causar problemas se houver falha
  const checkForPlatformUpdates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Get last login time from localStorage
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      if (!lastLoginTime) {
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        return;
      }
      
      // Check for new videos
      try {
        const { data: newVideos } = await supabase
          .from("videos")
          .select("count")
          .gt("created_at", lastLoginTime);
          
        // Check for new materials
        const { data: newMaterials } = await supabase
          .from("materials")
          .select("count")
          .gt("date_added", lastLoginTime);
          
        // If there are new items, we'll just update the UI instead of creating notifications
        // This evita erros de permissão
        if ((newVideos && newVideos.length > 0) || (newMaterials && newMaterials.length > 0)) {
          toast({
            title: "Novos conteúdos disponíveis",
            description: "Novos vídeos e materiais foram adicionados na plataforma desde seu último acesso."
          });
        }
      } catch (error) {
        console.log("Erro ao verificar por atualizações:", error);
      }
      
      // Update the last login time
      localStorage.setItem('lastLoginTime', new Date().toISOString());
    } catch (error) {
      console.log("Erro ao verificar por atualizações da plataforma:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.log("Erro ao marcar notificação como lida:", error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log("Erro ao marcar notificação como lida:", error);
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

      if (error) {
        console.log("Erro ao marcar todas notificações como lidas:", error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.log("Erro ao marcar todas notificações como lidas:", error);
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
