import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/pages/Auth';
import { AppLoadingScreen, getSplashVariant } from './AppLoadingScreen';

// Root minimum display time so the loading screen always registers as a deliberate branding
// moment rather than a flash — Supabase's local session check often resolves in well under this.
const MIN_DISPLAY_MS = 700;

// The native app's root route ("/"). Unlike the web root (the marketing LandingPage), a native
// app has no reason to show a landing pitch — it goes straight to the sign-in/sign-up flow, or
// past it entirely if a session is already active.
export function NativeRoot() {
  const { user, isHost, isLoading } = useAuth();
  const [minDisplayElapsed, setMinDisplayElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDisplayElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !minDisplayElapsed) {
    return <AppLoadingScreen variant={getSplashVariant()} />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Navigate to={isHost ? '/host' : '/explore'} replace />;
}
