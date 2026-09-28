import { StatusBar, Style } from '@capacitor/status-bar';
import { isNativePlatform } from './device';

export type StatusBarStyle = 'dark' | 'light' | 'default';

/**
 * Mobile status bar platform adapter.
 * Configures the OS status bar background, icon contrast, and webview overlap.
 */
export const statusBar = {
  /**
   * Sets the text/icon theme of the mobile status bar.
   * 'dark' means dark icons (for light backgrounds).
   * 'light' means light icons (for dark backgrounds like canopy green).
   */
  async setStyle(style: StatusBarStyle): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      const styleMap = {
        dark: Style.Dark,
        light: Style.Light,
        default: Style.Default,
      };
      await StatusBar.setStyle({ style: styleMap[style] || Style.Default });
    } catch (err) {
      console.warn('[Platform:StatusBar] setStyle failed:', err);
    }
  },

  /**
   * Set status bar background color (Android only).
   */
  async setBackgroundColor(hexColor: string): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await StatusBar.setBackgroundColor({ color: hexColor });
    } catch (err) {
      console.warn('[Platform:StatusBar] setBackgroundColor failed:', err);
    }
  },

  /**
   * Configure whether the webview draws underneath the status bar.
   */
  async setOverlaysWebView(overlay: boolean): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay });
    } catch (err) {
      console.warn('[Platform:StatusBar] setOverlaysWebView failed:', err);
    }
  },

  /**
   * Show status bar.
   */
  async show(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await StatusBar.show();
    } catch {
      // Ignore
    }
  },

  /**
   * Hide status bar (for full-screen immersive video reels or photos).
   */
  async hide(): Promise<void> {
    if (!isNativePlatform()) return;
    try {
      await StatusBar.hide();
    } catch {
      // Ignore
    }
  },
};
