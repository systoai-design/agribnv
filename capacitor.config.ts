import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agribnv.app',
  appName: 'Agribnv',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#FEF9F0',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#156530',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
