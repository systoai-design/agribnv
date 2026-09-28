import { SplashScreen } from '@capacitor/splash-screen';
import { isNativePlatform } from './device';

/**
 * Splash screen platform adapter.
 * Used to orchestrate the handoff between native OS launch screens and React hydration.
 */
export const splash = {
  /**
   * Dismiss the native OS launch screen.
   */
  async hide(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await SplashScreen.hide();
    } catch (err) {
      console.warn('[Platform:Splash] SplashScreen.hide failed:', err);
    }
  },

  /**
   * Programmatically show the native splash screen.
   */
  async show(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await SplashScreen.show({ autoHide: false });
    } catch (err) {
      console.warn('[Platform:Splash] SplashScreen.show failed:', err);
    }
  },
};
