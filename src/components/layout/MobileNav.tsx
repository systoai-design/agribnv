import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Bookmark, Home, Mail, User, Building2, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

export function MobileNav() {
  const { user, isHost, viewMode } = useAuth();
  const { unreadMessageCount } = useNotifications();
  const location = useLocation();

  // Different navigation for hosts vs guests based on viewMode
  const guestNavItems = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/wishlists', label: 'Wishlist', icon: Bookmark },
    { href: '/inbox', label: 'Inbox', icon: Mail },
    ...(user 
      ? [{ href: '/profile', label: 'Profile', icon: User }]
      : [{ href: '/auth', label: 'Log in', icon: User }]
    ),
  ];

  const hostNavItems = [
    { href: '/host', label: 'Dashboard', icon: Building2 },
    { href: '/bookings', label: 'Bookings', icon: Calendar },
    { href: '/inbox', label: 'Inbox', icon: Mail },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Use viewMode instead of isHost to determine which nav to show
  const navItems = (isHost && viewMode === 'host') ? hostNavItems : guestNavItems;

  const isActive = (path: string, label: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/85 backdrop-blur-xl border-t border-border/50 safe-area-pb">
      <div className="flex items-end py-1 px-2 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.label);


          const showInboxBadge = item.label === 'Inbox' && unreadMessageCount > 0;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              to={item.href}
              onClick={() => haptics.selection()}
              className="flex-1 flex flex-col items-center gap-1 py-2"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="relative"
              >
                <Icon
                  className={cn(
                    'h-[22px] w-[22px] transition-colors',
                    active
                      ? 'text-forest'
                      : 'text-muted-foreground'
                  )}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active && item.icon === Bookmark ? 'currentColor' : 'none'}
                />
                {showInboxBadge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </motion.div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'text-forest font-semibold' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
