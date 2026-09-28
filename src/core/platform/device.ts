import { Capacitor } from '@capacitor/core';

export type PlatformType = 'ios' | 'android' | 'web';

/**
 * Checks whether the application is running inside a native mobile runtime (iOS or Android).
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Checks whether the application is running on iOS.
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Checks whether the application is running on Android.
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Checks whether the application is running on the Web (browser / PWA).
 */
export function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web';
}

/**
 * Returns current platform name ('ios', 'android', or 'web').
 */
export function getPlatform(): PlatformType {
  return Capacitor.getPlatform() as PlatformType;
}
