import { isNativePlatform } from './device';

export interface PushNotificationPayload {
  title?: string;
  body?: string;
  data?: Record<string, any>;
  id?: string;
}

/**
 * Native push notifications adapter.
 * Uses dynamic import for @capacitor/push-notifications to avoid bundling issues on web.
 */
export const push = {
  /**
   * Request push notification permissions on device.
   */
  async requestPermissions(): Promise<boolean> {
    if (!isNativePlatform()) return false;
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (err) {
      console.warn('[Platform:Push] requestPermissions error:', err);
      return false;
    }
  },

  /**
   * Register device for remote APNs / FCM push notifications.
   */
  async register(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.register();
    } catch (err) {
      console.warn('[Platform:Push] register error:', err);
    }
  },

  /**
   * Listen for successful push registration token.
   */
  async onRegistration(callback: (token: string) => void): Promise<{ remove: () => void }> {
    if (!isNativePlatform()) return { remove: () => {} };
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      return await PushNotifications.addListener('registration', ({ value }) => {
        callback(value);
      });
    } catch {
      return { remove: () => {} };
    }
  },

  /**
   * Listen for incoming push notification while app is in foreground.
   */
  async onNotificationReceived(callback: (notification: PushNotificationPayload) => void): Promise<{ remove: () => void }> {
    if (!isNativePlatform()) return { remove: () => {} };
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      return await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        callback({
          title: notification.title,
          body: notification.body,
          data: notification.data,
          id: notification.id,
        });
      });
    } catch {
      return { remove: () => {} };
    }
  },
};
