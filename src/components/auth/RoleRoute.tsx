import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoadingScreen } from '@/components/app-shell/AppLoadingScreen';

interface RoleRouteProps {
  requireHost: boolean;
  children: React.ReactNode;
}

export function RoleRoute({ requireHost, children }: RoleRouteProps) {
  const { user, viewMode, isLoading, isHost } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireHost && (!isHost || viewMode !== 'host')) {
    // If route requires a host and they are not a host or the view mode is NOT host, boot them to explore
    return <Navigate to="/explore" replace />;
  }

  if (!requireHost && viewMode === 'host') {
    // If route is for travelers (doesn't require host) and the view mode IS host, boot them to host dashboard
    return <Navigate to="/host" replace />;
  }

  return <>{children}</>;
}
