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
import Explore from "./pages/Explore";
import Auth from "./pages/Auth";
import PropertyDetails from "./pages/PropertyDetails";
import Bookings from "./pages/Bookings";
import HostDashboard from "./pages/HostDashboard";
import NewProperty from "./pages/NewProperty";
import EditProperty from "./pages/EditProperty";
import Profile from "./pages/Profile";
import Wishlists from "./pages/Wishlists";
import MapView from "./pages/MapView";
import Inbox from "./pages/Inbox";
import Products from "./pages/Products";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { SafeArea } from 'capacitor-plugin-safe-area';
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
    if (Capacitor.isNativePlatform()) {
      Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(console.error);
    }
  }, []);
  return null;
}

function SafeAreaSetup() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SafeArea.getSafeAreaInsets().then(({ insets }) => {
        document.documentElement.style.setProperty('--sat', `${insets.top}px`);
        document.documentElement.style.setProperty('--sab', `${insets.bottom}px`);
        document.documentElement.style.setProperty('--sar', `${insets.right}px`);
        document.documentElement.style.setProperty('--sal', `${insets.left}px`);
      }).catch(console.error);

      SafeArea.addListener('safeAreaChanged', data => {
        document.documentElement.style.setProperty('--sat', `${data.insets.top}px`);
        document.documentElement.style.setProperty('--sab', `${data.insets.bottom}px`);
        document.documentElement.style.setProperty('--sar', `${data.insets.right}px`);
        document.documentElement.style.setProperty('--sal', `${data.insets.left}px`);
      });
    }
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
              <Route path="/explore" element={<Explore />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/host" element={<HostDashboard />} />
              <Route path="/host/properties/new" element={<NewProperty />} />
              <Route path="/host/properties/:id/edit" element={<EditProperty />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlists" element={<Wishlists />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
