import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useHideNativeSplash } from "@/hooks/useHideNativeSplash";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { Root } from "@/components/app-shell/Root";
import { RoleRoute } from "@/components/auth/RoleRoute";
import Explore from "./pages/Explore";
import Auth from "./pages/Auth";
import PropertyDetails from "./pages/PropertyDetails";
import Bookings from "./pages/Bookings";
import HostDashboard from "./pages/HostDashboard";
import NewProperty from "./pages/NewProperty";
import EditProperty from "./pages/EditProperty";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Wishlists from "./pages/Wishlists";
import MapView from "./pages/MapView";
import Inbox from "./pages/Inbox";
import Products from "./pages/Products";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ChangePassword from "./pages/ChangePassword";
import Feed from "./pages/Feed";
import FarmPublicProfile from "./pages/FarmPublicProfile";
import FarmerFinish from "./pages/FarmerFinish";
import NotFound from "./pages/NotFound";

import { keyboard, initSafeArea } from '@/core/platform';
import { useEffect } from 'react';

function PushSetup() {
  usePushNotifications();
  return null;
}

function NativeSplashSetup() {
  useHideNativeSplash();
  return null;
}

function KeyboardSetup() {
  useEffect(() => {
    keyboard.setAccessoryBarVisible(false);
  }, []);
  return null;
}

function SafeAreaSetup() {
  useEffect(() => {
    const cleanupPromise = initSafeArea();
    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, []);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NotificationsProvider>
            <PushSetup />
            <NativeSplashSetup />
            <KeyboardSetup />
            <SafeAreaSetup />
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/explore" element={<RoleRoute requireHost={false}><Explore /></RoleRoute>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/properties/:id" element={<RoleRoute requireHost={false}><PropertyDetails /></RoleRoute>} />
              <Route path="/bookings" element={<RoleRoute requireHost={false}><Bookings /></RoleRoute>} />
              <Route path="/host" element={<RoleRoute requireHost={true}><HostDashboard /></RoleRoute>} />
              <Route path="/host/properties/new" element={<RoleRoute requireHost={true}><NewProperty /></RoleRoute>} />
              <Route path="/host/properties/:id/edit" element={<RoleRoute requireHost={true}><EditProperty /></RoleRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/wishlists" element={<RoleRoute requireHost={false}><Wishlists /></RoleRoute>} />
              <Route path="/map" element={<RoleRoute requireHost={false}><MapView /></RoleRoute>} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/products" element={<RoleRoute requireHost={false}><Products /></RoleRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/farm-profile-preview" element={<FarmPublicProfile />} />
              <Route path="/farmer-finish" element={<FarmerFinish />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
