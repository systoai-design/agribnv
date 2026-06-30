import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, Star, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppNotification, NotificationType } from '@/hooks/useNotificationsData';

interface NotificationBellProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  booking_request: <Calendar className="h-4 w-4 text-primary" />,
  booking_confirmed: <Calendar className="h-4 w-4 text-success" />,
  booking_cancelled: <Calendar className="h-4 w-4 text-destructive" />,
  booking_completed: <Calendar className="h-4 w-4 text-muted-foreground" />,
  new_review: <Star className="h-4 w-4 text-amber-500" />,
};

function notificationLink(n: AppNotification): string {
  if (n.entity_type === 'booking') {
    if (n.type === 'booking_request' || n.type === 'booking_confirmed' && n.entity_type === 'booking') {
      return '/host';
    }
    return '/bookings';
  }
  return '/';
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationBellProps) {
  const navigate = useNavigate();
  const recent = notifications.slice(0, 10);

  function handleClick(n: AppNotification) {
    if (!n.is_read) onMarkAsRead(n.id);
    navigate(notificationLink(n));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-sage/20"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 rounded-2xl shadow-card mt-2 border-border/50 p-0 overflow-hidden" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        {recent.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <Bell className="h-7 w-7 mx-auto mb-2 opacity-25" />
            No notifications yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {recent.map((n, i) => (
              <div key={n.id}>
                {i > 0 && <DropdownMenuSeparator className="bg-border/30 my-0" />}
                <DropdownMenuItem
                  className={`px-4 py-3 gap-3 cursor-pointer items-start rounded-none focus:bg-muted/50 ${!n.is_read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleClick(n)}
                >
                  <div className="mt-0.5 shrink-0">
                    {TYPE_ICON[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${!n.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
