import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agribnv.app',
  appName: 'Agribnv',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#156530',
  },
  android: {
    backgroundColor: '#156530',
  },
  plugins: {
    SplashScreen: {
      // Hidden explicitly by useHideNativeSplash() once React has painted its first frame
      // (AppLoadingScreen, same background + icon), instead of a fixed timer — removes any
      // chance of a blank gap on devices where init takes longer than the old 2000ms.
      launchAutoHide: false,
      backgroundColor: '#156530',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
