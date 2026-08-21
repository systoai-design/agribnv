import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useShare } from '@/hooks/useShare';
import { 
  Loader2, 
  Camera, 
  ArrowLeft, 
  ChevronRight, 
  Lock,
  Info,
  FileText, 
  Shield, 
  Share2,
  LogOut,
  User,
  Repeat,
  LayoutDashboard
} from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile, signOut, isHost, viewMode, switchViewMode, becomeHost } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { share } = useShare();
  const [isBecomingHost, setIsBecomingHost] = useState(false);

  const handleSwitchMode = () => {
    if (viewMode === 'host') {
      switchViewMode('guest');
      navigate('/');
      toast({ title: 'Switched to Traveller mode', description: 'Now browsing as a traveller.' });
    } else {
      switchViewMode('host');
      navigate('/host');
      toast({ title: 'Switched to Host mode', description: 'Now managing your listings.' });
    }
  };

  const handleShareApp = () => {
    share({
      title: 'Agribnv - Farm Stay Experiences',
      text: 'Discover authentic farm stays and agricultural experiences across the Philippines! 🌿',
      url: window.location.origin,
    });
  };

  const handleBecomeHost = async () => {
    setIsBecomingHost(true);
    const { error } = await becomeHost();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome, Host!', description: 'You can now list your properties.' });
    }
    setIsBecomingHost(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your profile</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sign in to manage your profile and settings.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">Sign In</Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const initials = (profile?.full_name || user?.user_metadata?.full_name)
    ?.split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
  const username = profile?.username || user?.user_metadata?.username || (profile?.full_name || user?.user_metadata?.full_name)?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || 'user';

  const settingsItems = [
    { icon: Lock, label: 'Change Password', href: '/change-password' },
  ];

  const infoItems = [
    { icon: Info, label: 'About App', href: '/about' },
    { icon: FileText, label: 'Terms of Use', href: '/terms' },
    { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
    { icon: Share2, label: 'Share This App', href: '#', action: 'share' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 safe-area-pt z-40 bg-background/80 backdrop-blur-md px-4 py-4 border-b border-border/30 md:hidden">
        <div className="flex items-center gap-4">
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-3 -ml-3 rounded-full hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </div>

      <div className="container py-8 md:py-12 safe-area-pt max-w-5xl mx-auto px-4">
        
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold text-foreground">Account</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 md:gap-12">
          
          {/* LEFT COLUMN: Identity & Editing */}
          <div className="flex flex-col gap-6">
            {/* Sticky Wrapper */}
            <div className="md:sticky md:top-28 space-y-6">
              
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl p-8 shadow-soft border border-border/40 flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{profile?.full_name || 'Your Name'}</h2>
                <p className="text-muted-foreground mb-6">@{username}</p>
                
                <Link to="/profile/edit" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-full font-medium"
                  >
                    Edit Profile
                  </Button>
                </Link>
              </motion.div>
              
            </div>
          </div>

          {/* RIGHT COLUMN: Control Center */}
          <div className="flex flex-col gap-8">
            
            {/* Host Mode Toggle - For users who are hosts */}
            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-6 md:p-8"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      {viewMode === 'host' ? "You're in Host mode" : "You're in Traveller mode"}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {viewMode === 'host' ? 'Manage your listings, bookings, and earnings.' : 'Browse unique farm stays and book experiences.'}
                    </p>
                  </div>
                  <Button onClick={handleSwitchMode} className="rounded-full shadow-sm whitespace-nowrap">
                    <Repeat className="h-4 w-4 mr-2" />
                    {viewMode === 'host' ? 'Switch to Traveller' : 'Switch to Host'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Become Host Card - Only for non-hosts */}
            {!isHost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 md:p-8 shadow-md text-primary-foreground relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                  <LayoutDashboard className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Become a Host</h3>
                    <p className="text-primary-foreground/80">List your property, farm, or experience and start earning.</p>
                  </div>
                  <Button 
                    onClick={handleBecomeHost} 
                    disabled={isBecomingHost} 
                    variant="secondary"
                    className="rounded-full font-semibold shadow-sm px-8"
                  >
                    {isBecomingHost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Started
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Settings & Information Grid (Desktop) / Stack (Mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* General Settings Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4"
              >
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider px-2">
                  Account Settings
                </h3>
                <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/40">
                  {settingsItems.map((item, index) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`flex items-center justify-between p-5 hover:bg-muted/50 transition-colors group ${
                        index < settingsItems.length - 1 ? 'border-b border-border/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                  ))}
                  
                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-between p-5 hover:bg-destructive/5 transition-colors group w-full text-left border-t border-border/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive group-hover:bg-destructive/20 transition-colors">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-destructive">Sign Out</span>
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-4"
              >
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider px-2">
                  Information & Support
                </h3>
                <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/40">
                  {infoItems.map((item, index) => {
                    const baseClassName = `flex items-center justify-between p-5 hover:bg-muted/50 transition-colors w-full text-left group ${
                      index < infoItems.length - 1 ? 'border-b border-border/40' : ''
                    }`;
                    
                    const content = (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-foreground">{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </>
                    );

                    if (item.action === 'share') {
                      return (
                        <button key={item.label} onClick={handleShareApp} type="button" className={baseClassName}>
                          {content}
                        </button>
                      );
                    }
                    
                    return (
                      <Link key={item.label} to={item.href} className={baseClassName}>
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
