import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNativePlatform } from './device';

export type HapticImpactStyle = 'heavy' | 'medium' | 'light';
export type HapticNotificationType = 'success' | 'warning' | 'error';

/**
 * Triggers physical haptic feedback on supported mobile devices.
 * Gracefully falls back to navigator.vibrate or a silent no-op on web browsers.
 */
export const haptics = {
  /**
   * Trigger impact feedback (e.g. button click, modal dismissal, card snap)
   */
  async impact(style: HapticImpactStyle = 'light'): Promise<void> {
    try {
      if (isNativePlatform()) {
        const styleMap = {
          heavy: ImpactStyle.Heavy,
          medium: ImpactStyle.Medium,
          light: ImpactStyle.Light,
        };
        await Haptics.impact({ style: styleMap[style] || ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const durationMap = { light: 10, medium: 25, heavy: 40 };
        navigator.vibrate(durationMap[style] || 15);
      }
    } catch {
      // Haptics not supported or permission denied; ignore safely
    }
  },

  /**
   * Trigger notification haptic pattern (success, warning, error)
   */
  async notification(type: HapticNotificationType = 'success'): Promise<void> {
    try {
      if (isNativePlatform()) {
        const typeMap = {
          success: NotificationType.Success,
          warning: NotificationType.Warning,
          error: NotificationType.Error,
        };
        await Haptics.notification({ type: typeMap[type] || NotificationType.Success });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patternMap = {
          success: [15, 50, 20],
          warning: [25, 40, 25],
          error: [50, 40, 50, 40, 50],
        };
        navigator.vibrate(patternMap[type] || [15, 50, 20]);
      }
    } catch {
      // Ignore safely
    }
  },

  /**
   * Selection change feedback for pickers, tabs, and list item scrubbing
   */
  async selectionChanged(): Promise<void> {
    try {
      if (isNativePlatform()) {
        await Haptics.selectionChanged();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {
      // Ignore safely
    }
  },

  /**
   * Timed vibration in milliseconds
   */
  async vibrate(duration: number = 300): Promise<void> {
    try {
      if (isNativePlatform()) {
        await Haptics.vibrate({ duration });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    } catch {
      // Ignore safely
    }
  },
};
