/**
 * UMANI Platform Facade
 * ---------------------
 * Decouples Capacitor native device bridges (haptics, camera, safe areas, status bar,
 * keyboard, geolocation, splash, push notifications) behind clean platform adapters.
 *
 * Guarantees zero runtime breakage on web and mobile platforms.
 */

export * from './device';
export * from './haptics';
export * from './camera';
export * from './safeArea';
export * from './statusBar';
export * from './keyboard';
export * from './splash';
export * from './geolocation';
export * from './push';

import { isNativePlatform, isIOS, isAndroid, isWeb, getPlatform } from './device';
import { haptics } from './haptics';
import { camera } from './camera';
import { initSafeArea, useSafeAreaInsets } from './safeArea';
import { statusBar } from './statusBar';
import { keyboard } from './keyboard';
import { splash } from './splash';
import { geolocation } from './geolocation';
import { push } from './push';

export const platform = {
  isNative: isNativePlatform,
  isIOS,
  isAndroid,
  isWeb,
  getPlatform,
  haptics,
  camera,
  safeArea: {
    init: initSafeArea,
    useInsets: useSafeAreaInsets,
  },
  statusBar,
  keyboard,
  splash,
  geolocation,
  push,
};

export default platform;
