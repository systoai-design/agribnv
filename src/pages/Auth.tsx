import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { haptics } from '@/core/platform';
import { MobileAuthHero } from '@/components/auth/MobileAuthHero';
import { AuthWelcomePanel } from '@/components/auth/AuthWelcomePanel';
import { AuthLoginPanel } from '@/components/auth/AuthLoginPanel';
import { AuthSignupPanel } from '@/components/auth/AuthSignupPanel';
import { AuthAccountTypePanel } from '@/components/auth/AuthAccountTypePanel';
import { AuthGraphic } from '@/components/auth/AuthGraphic';
import { TreeOverlay } from '@/components/auth/TreeOverlay';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  username: z.string().optional(),
});

export type AuthForm = z.infer<typeof authSchema>;
export type UserRole = 'guest' | 'host';
export type AuthMode = 'welcome' | 'login' | 'signup' | 'account-type';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode: AuthMode = searchParams.get('mode') === 'welcome' 
    ? 'welcome' 
    : searchParams.get('mode') === 'login' 
    ? 'login' 
    : searchParams.get('mode') === 'signup'
    ? 'signup'
    : 'welcome';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    searchParams.get('role') === 'host' ? 'host' : 'guest'
  );

  const { user, signIn, signUp: authSignUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const { reset } = form;

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Only auto-redirect if we're not actively picking account type
      if (user && mode !== 'account-type') {
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
    if (mode === 'account-type') {
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
        toast({
          title: 'Social login notice',
          description: error.message || 'Google authentication provider is being configured.',
        });
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
        const computedName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.fullName || 'UMANI Explorer';
        const { data: signUpData, error } = await authSignUp(
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
        setMode('account-type');
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

  const handleConfirmAccountType = async () => {
    haptics.impact('medium');
    setIsLoading(true);
    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      if (selectedRole === 'host' && currentUser?.id) {
        await supabase.from('user_roles').upsert({
          user_id: currentUser.id,
          role: 'host',
        }, { onConflict: 'user_id,role' });
      }

      haptics.notification('success');
      toast({
        title: 'Welcome to UMANI!',
        description: selectedRole === 'host'
          ? 'Your farm host account has been created. Start listing your farm!'
          : 'Your explorer account has been created. Start discovering farms!',
      });
      navigate(selectedRole === 'host' ? '/host' : '/explore');
    } catch {
      navigate('/explore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#142A1D] lg:bg-background flex flex-col lg:flex-row overflow-x-hidden">
      {/* MOBILE CONTAINER (Full width on mobile, centered card frame on desktop) */}
      <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col min-h-screen bg-[#142A1D] shrink-0 mx-auto">
        {/* Top Hero Section (Atmospheric Sunrise & Terrace Motif) */}
        <MobileAuthHero mode={mode} onBack={handleBackFromHero} />

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
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT PANE — Expanded "Terraced Light" Brand Artwork (Desktop View) */}
      <div className="hidden lg:flex lg:flex-1 relative flex-col justify-end overflow-hidden p-12 xl:p-16 bg-primary">
        <AuthGraphic />
        <TreeOverlay />

        {/* Caption — bottom */}
        <div className="relative z-10">
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-[1.1]">
            Stay on a farm.
            <br />
            <span className="text-[#B0D182]">Or share yours.</span>
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'hsl(var(--sage) / 0.6)' }} />
            <span className="text-[11px] tracking-[0.2em] uppercase text-white/55 font-medium">
              Guimaras · 10.60°N 122.60°E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
