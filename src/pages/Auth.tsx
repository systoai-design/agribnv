import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { haptics } from '@/core/platform';
import { MobileAuthHero, AuthHeroMode } from '@/components/auth/MobileAuthHero';
import { AuthWelcomePanel } from '@/components/auth/AuthWelcomePanel';
import { AuthLoginPanel } from '@/components/auth/AuthLoginPanel';
import { AuthSignupPanel } from '@/components/auth/AuthSignupPanel';
import { AuthAccountTypePanel, UserRole } from '@/components/auth/AuthAccountTypePanel';
import { TravelerOnboardingPanel } from '@/components/onboarding/TravelerOnboardingPanel';
import { FarmerStep1Panel } from '@/components/onboarding/FarmerStep1Panel';
import { FarmerStep2Panel } from '@/components/onboarding/FarmerStep2Panel';
import { FarmerStep3Panel } from '@/components/onboarding/FarmerStep3Panel';
import {
  TravelerOnboardingData,
  FarmerStep1Data,
  FarmerStep2Data,
  FarmerStep3Data,
  FarmerFullOnboardingData,
} from '@/components/onboarding/types';

// Auth validation schema
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required').optional(),
  lastName: z.string().min(2, 'Last name is required').optional(),
  fullName: z.string().min(2, 'Full name is required').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

type AuthForm = z.infer<typeof authSchema>;

export type AuthMode = AuthHeroMode;

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode: AuthMode =
    modeParam === 'welcome' ||
    modeParam === 'login' ||
    modeParam === 'signup' ||
    modeParam === 'account-type' ||
    modeParam === 'traveler-onboarding' ||
    modeParam === 'farmer-step1' ||
    modeParam === 'farmer-step2' ||
    modeParam === 'farmer-step3'
      ? (modeParam as AuthMode)
      : 'welcome';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    searchParams.get('role') === 'host' ? 'host' : 'guest'
  );

  // Onboarding accumulated state
  const [travelerData, setTravelerData] = useState<Partial<TravelerOnboardingData>>({});
  const [farmerData, setFarmerData] = useState<Partial<FarmerFullOnboardingData>>({});

  const { user, signIn, signUp: authSignUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const { reset } = form;

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Don't auto-redirect if user is in an active onboarding / selection flow
      const isOnboardingMode =
        mode === 'account-type' ||
        mode === 'traveler-onboarding' ||
        mode.startsWith('farmer-');

      if (user && !isOnboardingMode) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'host')
          .maybeSingle();

        if (data) {
          navigate('/host');
        } else {
          navigate('/explore');
        }
      }
    };
    checkUserAndRedirect();
  }, [user, mode, navigate]);

  const switchMode = (newMode: AuthMode) => {
    haptics.impact('light');
    reset();
    setMode(newMode);
  };

  const handleBackFromHero = () => {
    if (mode === 'farmer-step3') {
      switchMode('farmer-step2');
    } else if (mode === 'farmer-step2') {
      switchMode('farmer-step1');
    } else if (mode === 'farmer-step1' || mode === 'traveler-onboarding') {
      switchMode('account-type');
    } else if (mode === 'account-type') {
      switchMode('signup');
    } else {
      switchMode('welcome');
    }
  };

  const handleSocialAuth = async () => {
    haptics.impact('light');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/explore`,
        },
      });
      if (error) {
        haptics.notification('error');
        toast({ title: 'Authentication error', description: error.message, variant: 'destructive' });
      }
    } catch {
      toast({
        title: 'Social login unavailable',
        description: 'Please sign in with email credentials.',
      });
    }
  };

  const onSubmit = async (data: AuthForm) => {
    haptics.impact('medium');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const computedName =
          [data.firstName, data.lastName].filter(Boolean).join(' ') || data.fullName || 'UMANI Explorer';
        const { error } = await authSignUp(
          data.email,
          data.password,
          computedName,
          data.username || data.email.split('@')[0]
        );

        if (error) {
          haptics.notification('error');
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'An account with this email already exists. Please log in.',
              variant: 'destructive',
            });
            switchMode('login');
          } else {
            toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
          }
          return;
        }

        haptics.notification('success');
        // Transition to dedicated "Type of account" wireframe screen
        switchMode('account-type');
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          haptics.notification('error');
          if (error.message.includes('Invalid login')) {
            toast({
              title: 'Invalid credentials',
              description: 'Email or password is incorrect. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
          }
        } else {
          haptics.notification('success');
          navigate('/explore');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Account Type Selection -> Routes to Traveler setup or Farmer Step 1
  const handleConfirmAccountType = () => {
    haptics.impact('medium');
    if (selectedRole === 'host') {
      switchMode('farmer-step1');
    } else {
      switchMode('traveler-onboarding');
    }
  };

  // 2. Traveler Onboarding Completion
  const handleTravelerComplete = async (data: TravelerOnboardingData) => {
    setIsLoading(true);
    haptics.impact('medium');
    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      if (currentUser?.id) {
        await supabase
          .from('profiles')
          .update({
            full_name: data.displayName,
            bio: data.bio,
            avatar_url: data.avatarUrl || null,
          })
          .eq('id', currentUser.id);
      }
      haptics.notification('success');
      toast({
        title: 'Welcome to UMANI!',
        description: 'Your traveler profile has been saved. Happy exploring!',
      });
      navigate('/explore');
    } catch {
      navigate('/explore');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Farmer Wizard Step 1 Next
  const handleFarmerStep1Next = (step1Data: FarmerStep1Data) => {
    setFarmerData((prev) => ({ ...prev, ...step1Data }));
    switchMode('farmer-step2');
  };

  // 4. Farmer Wizard Step 2 Next
  const handleFarmerStep2Next = (step2Data: FarmerStep2Data) => {
    setFarmerData((prev) => ({ ...prev, ...step2Data }));
    switchMode('farmer-step3');
  };

  // 5. Farmer Wizard Step 3 Complete
  const handleFarmerStep3Complete = async (step3Data: FarmerStep3Data) => {
    setIsLoading(true);
    haptics.impact('medium');
    const finalData = { ...farmerData, ...step3Data };

    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      if (currentUser?.id) {
        // Assign Host Role
        await supabase
          .from('user_roles')
          .upsert({ user_id: currentUser.id, role: 'host' }, { onConflict: 'user_id,role' });

        // Build composite location and arrays
        const combinedLocation =
          [finalData.municipality, finalData.province, finalData.region].filter(Boolean).join(', ') ||
          'Philippines';

        const cropsArray = finalData.crops
          ? finalData.crops.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        const livestockArray = finalData.livestock
          ? finalData.livestock.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        const facilitiesArray = Array.isArray(finalData.facilities)
          ? finalData.facilities
          : typeof finalData.facilities === 'string' && finalData.facilities
          ? (finalData.facilities as string).split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        await supabase.from('farm_profiles').upsert(
          {
            host_id: currentUser.id,
            farm_name: finalData.farmName || 'My Farm',
            tagline: finalData.tagline || null,
            story: finalData.farmerBio || finalData.farmDescription || null,
            terroir_notes: finalData.storyAndTerroir || null,
            location: combinedLocation,
            address: finalData.address || null,
            cover_image_url: finalData.coverImageUrl || null,
            avatar_url: finalData.avatarUrl || null,
            crops: cropsArray,
            livestock: livestockArray,
            facilities: facilitiesArray,
          },
          { onConflict: 'host_id' }
        );
      }

      haptics.notification('success');
      toast({
        title: 'Welcome to UMANI!',
        description: 'Your farm profile has been created. Start listing your offerings!',
      });
      navigate('/host');
    } catch {
      navigate('/host');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#142A1D] lg:bg-background flex flex-col lg:flex-row overflow-x-hidden">
      {/* MOBILE CONTAINER (Full width on mobile, centered card frame on desktop) */}
      <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col min-h-screen bg-[#142A1D] shrink-0 mx-auto">
        {/* Top Hero Section (Pure Picture Motif) */}
        <MobileAuthHero
          mode={mode}
          onBack={handleBackFromHero}
          onSkip={() => navigate(mode.startsWith('farmer-') ? '/host' : '/explore')}
        />

        {/* Bottom Curved Sheet Container matching Low-Fi Wireframe */}
        <div className="flex-1 bg-[#FAF8F5] text-foreground rounded-t-[36px] shadow-[0_-12px_40px_rgba(0,0,0,0.35)] flex flex-col -mt-4 relative z-30 pt-3 px-6 sm:px-8 pb-8 safe-area-pb">
          {/* Subtle Pull-Bar / Card Indicator */}
          <div className="w-12 h-1.5 rounded-full bg-border/70 mx-auto mb-4 shrink-0" />

          <div className="flex-1 flex flex-col min-h-0">
            <AnimatePresence mode="wait">
              {mode === 'welcome' && (
                <AuthWelcomePanel
                  key="welcome-panel"
                  onSignIn={() => switchMode('login')}
                  onSignUp={() => switchMode('signup')}
                  onSocialAuth={handleSocialAuth}
                  isLoading={isLoading}
                />
              )}

              {mode === 'login' && (
                <AuthLoginPanel
                  key="login-panel"
                  form={form}
                  onSubmit={form.handleSubmit(onSubmit)}
                  onSwitchToSignup={() => switchMode('signup')}
                  onSocialAuth={handleSocialAuth}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  onTogglePassword={() => {
                    haptics.impact('light');
                    setShowPassword(!showPassword);
                  }}
                />
              )}

              {mode === 'signup' && (
                <AuthSignupPanel
                  key="signup-panel"
                  form={form}
                  onSubmit={form.handleSubmit(onSubmit)}
                  onSwitchToLogin={() => switchMode('login')}
                  onSocialAuth={handleSocialAuth}
                  onSwitchToAccountType={() => switchMode('account-type')}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  onTogglePassword={() => {
                    haptics.impact('light');
                    setShowPassword(!showPassword);
                  }}
                />
              )}

              {mode === 'account-type' && (
                <AuthAccountTypePanel
                  key="account-type-panel"
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                  onContinue={handleConfirmAccountType}
                  isLoading={isLoading}
                />
              )}

              {mode === 'traveler-onboarding' && (
                <TravelerOnboardingPanel
                  key="traveler-onboarding"
                  initialData={travelerData}
                  onComplete={handleTravelerComplete}
                  onSkip={() => navigate('/explore')}
                  onBack={() => switchMode('account-type')}
                  isLoading={isLoading}
                />
              )}

              {mode === 'farmer-step1' && (
                <FarmerStep1Panel
                  key="farmer-step1"
                  initialData={farmerData}
                  onNext={handleFarmerStep1Next}
                  onBack={() => switchMode('account-type')}
                  onSkip={() => navigate('/host')}
                />
              )}

              {mode === 'farmer-step2' && (
                <FarmerStep2Panel
                  key="farmer-step2"
                  initialData={farmerData}
                  onNext={handleFarmerStep2Next}
                  onBack={() => switchMode('farmer-step1')}
                  onSkip={() => navigate('/host')}
                />
              )}

              {mode === 'farmer-step3' && (
                <FarmerStep3Panel
                  key="farmer-step3"
                  initialData={farmerData}
                  onComplete={handleFarmerStep3Complete}
                  onBack={() => switchMode('farmer-step2')}
                  onSkip={() => navigate('/host')}
                  isLoading={isLoading}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT PANE — Expanded "Terraced Light" Brand Artwork (Desktop View) */}
      <div className="hidden lg:flex lg:flex-1 relative flex-col justify-end overflow-hidden p-12 xl:p-16 bg-primary">
        <AuthGraphic />
        <TreeOverlay />
        <div className="relative z-10 max-w-lg text-primary-foreground space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#B0D182] font-semibold">
            UMANI Ecosystem
          </span>
          <h2 className="text-4xl xl:text-5xl font-serif font-bold leading-tight">
            Bring the whole farm online.
          </h2>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            Discover verified farm stays, book hands-on harvesting workshops, and support authentic local harvests across the Philippines.
          </p>
        </div>
      </div>
    </div>
  );
}

// Right panel decorative elements for large desktop screens
function AuthGraphic() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-25">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#B0D182]/30 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#F2C078]/20 blur-3xl" />
    </div>
  );
}

function TreeOverlay() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] pointer-events-none opacity-15">
      <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="currentColor">
        <path d="M100 20 L150 100 L120 100 L160 160 L40 160 L80 100 L50 100 Z" />
      </svg>
    </div>
  );
}
