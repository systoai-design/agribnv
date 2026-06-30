import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Lazy-load push notification APIs only on native platforms
async function setupPushNotifications(userId: string) {
  if (!Capacitor.isNativePlatform()) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  await PushNotifications.addListener('registration', async ({ value: token }) => {
    await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  });

  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
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
