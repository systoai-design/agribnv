import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

// Hides the native OS splash screen once React has mounted and committed its first paint —
// at that point AppLoadingScreen (same forest-green background, same icon) is already on
// screen underneath it, so the reveal is seamless regardless of how long app init actually
// takes. Pairs with capacitor.config.ts's launchAutoHide: false, which stops the OS from
// hiding the splash on its own fixed timer (previously 2000ms) and risking a blank white gap
// on slower devices where init takes longer than that.
export function useHideNativeSplash(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    SplashScreen.hide();
  }, []);
}
