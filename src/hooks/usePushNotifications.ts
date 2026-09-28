import { useEffect } from 'react';
import { isNativePlatform, push } from '@/core/platform';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Lazy-load push notification APIs only on native platforms via platform adapter
async function setupPushNotifications(userId: string) {
  if (!isNativePlatform()) return;

  const granted = await push.requestPermissions();
  if (!granted) return;

  await push.register();

  await push.onRegistration(async (token) => {
    await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  });

  await push.onNotificationReceived((notification) => {
    // Native foreground notification — Sonner toast is handled in NotificationsContext
    // via realtime subscription, so no duplicate toast needed here.
    console.info('[Push] Foreground notification received:', notification.title);
  });
}

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setupPushNotifications(user.id);
  }, [user]);
}
