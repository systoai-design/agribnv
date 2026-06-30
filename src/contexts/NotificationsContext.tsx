import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNotificationsData, AppNotification } from '@/hooks/useNotificationsData';

interface NotificationsContextValue {
  unreadMessageCount: number;
  refetchUnread: () => Promise<void>;
  bookingNotifications: AppNotification[];
  bookingUnreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadMessageCount: 0,
  refetchUnread: async () => {},
  bookingNotifications: [],
  bookingUnreadCount: 0,
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { unreadCount, refetch } = useUnreadMessages((message, conversationId) => {
    if (location.pathname.startsWith('/inbox')) return;

    const preview = message.content.length > 80
      ? `${message.content.slice(0, 80)}…`
      : message.content;

    toast.message('New message', {
      description: preview,
      action: {
        label: 'Open',
        onClick: () => navigate(`/inbox?conversation=${conversationId}`),
      },
    });
  });

  const {
    notifications,
    unreadCount: bookingUnreadCount,
    markAsRead,
    markAllAsRead,
    onNewNotification,
  } = useNotificationsData();

  useEffect(() => {
    onNewNotification((n) => {
      toast.message(n.title, {
        description: n.body ?? undefined,
        action: {
          label: 'View',
          onClick: () => navigate(n.entity_type === 'booking' ? (n.type === 'booking_request' ? '/host' : '/bookings') : '/'),
        },
      });
    });
  }, [onNewNotification, navigate]);

  return (
    <NotificationsContext.Provider
      value={{
        unreadMessageCount: unreadCount,
        refetchUnread: refetch,
        bookingNotifications: notifications,
        bookingUnreadCount,
        markNotificationRead: markAsRead,
        markAllNotificationsRead: markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
