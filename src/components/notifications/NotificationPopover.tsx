
import React, { useEffect, useState } from 'react';
import { Check, Bell, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPopoverProps {
  onClose?: () => void;
}

const NotificationPopover = ({ onClose }: NotificationPopoverProps) => {
  const { notifications, refresh, markAllAsRead } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await markAllAsRead();
    } finally {
      setIsLoading(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary" />
          <h3 className="font-semibold">Notificações</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead} 
            disabled={isLoading || notifications.length === 0}
            className="text-xs"
          >
            <Check className="h-4 w-4 mr-1" /> Marcar todas como lidas
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[300px] p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">Você não tem notificações.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg border ${notification.read ? 'bg-background' : 'bg-accent'}`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPopover;
