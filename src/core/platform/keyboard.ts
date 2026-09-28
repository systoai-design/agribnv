import { Keyboard } from '@capacitor/keyboard';
import { isNativePlatform } from './device';

/**
 * Mobile software keyboard platform adapter.
 * Safe no-op on web browsers.
 */
export const keyboard = {
  /**
   * Configures whether the iOS accessory bar (Done button bar) appears above the keyboard.
   */
  async setAccessoryBarVisible(isVisible: boolean): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await Keyboard.setAccessoryBarVisible({ isVisible });
    } catch (err) {
      console.warn('[Platform:Keyboard] setAccessoryBarVisible failed:', err);
    }
  },

  /**
   * Programmatically hides the virtual on-screen keyboard.
   */
  async hide(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await Keyboard.hide();
    } catch {
      // Ignore
    }
  },

  /**
   * Programmatically shows the virtual on-screen keyboard.
   */
  async show(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await Keyboard.show();
    } catch {
      // Ignore
    }
  },

  /**
   * Listen to keyboard show/hide events.
   */
  async addListener(
    eventName: 'keyboardWillShow' | 'keyboardDidShow' | 'keyboardWillHide' | 'keyboardDidHide',
    callback: (info: any) => void
  ): Promise<{ remove: () => void }> {
    if (!isNativePlatform()) {
      return { remove: () => {} };
    }
    return Keyboard.addListener(eventName, callback);
  },
};
