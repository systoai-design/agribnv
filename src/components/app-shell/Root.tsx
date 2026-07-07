import { Capacitor } from '@capacitor/core';
import LandingPage from '@/pages/LandingPage';
import { NativeRoot } from './NativeRoot';

// The "/" route: the marketing LandingPage on the web, but the native app has no marketing
// pitch to show its own installed users — it goes straight to sign-in/sign-up (or past it,
// if already signed in). See NativeRoot for that flow.
export function Root() {
  return Capacitor.isNativePlatform() ? <NativeRoot /> : <LandingPage />;
}
