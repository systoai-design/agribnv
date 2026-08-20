import { Capacitor } from '@capacitor/core';
import { Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import { NativeRoot } from './NativeRoot';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoadingScreen } from '@/components/app-shell/AppLoadingScreen';

// The "/" route: the marketing LandingPage on the web.
// Automatically redirects authenticated users to the app dashboard (/explore or /host)
// to maintain separation between the marketing site and the actual application.
export function Root() {
  const { user, viewMode, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  // If authenticated and on web, go to the app dashboard
  if (user && !Capacitor.isNativePlatform()) {
    return <Navigate to={viewMode === 'host' ? '/host' : '/explore'} replace />;
  }

  return Capacitor.isNativePlatform() ? <NativeRoot /> : <LandingPage />;
}
