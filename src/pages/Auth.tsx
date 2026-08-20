import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import agribnvIconGreen from '@/assets/agribnv-icon-green.png?v=2';
import { AuthGraphic } from '@/components/auth/AuthGraphic';
import { TreeOverlay } from '@/components/auth/TreeOverlay';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phone: z.string().optional(),
});

type AuthForm = z.infer<typeof authSchema>;
type UserRole = 'guest' | 'host';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(searchParams.get('role') === 'host' ? 'host' : 'guest');
  const { user, signIn, signUp: authSignUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user) {
        // Check if user is a host and redirect accordingly
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'host')
          .single();

        if (data) {
          navigate('/host');
        } else {
          navigate('/explore');
        }
      }
    };
    checkUserAndRedirect();
  }, [user, navigate]);

  const handleDemoLogin = async (role: 'guest' | 'host') => {
    setIsLoading(true);
    const demoEmail = role === 'host' ? 'demo.host@agribnv.com' : 'demo.guest@agribnv.com';
    const demoPassword = 'DemoPassword123!';
    const demoName = role === 'host' ? 'Demo Farm Host' : 'Demo Traveler';

    try {
      // 1. Try to sign in first
      const { error: signInErr } = await signIn(demoEmail, demoPassword);
      if (!signInErr) {
        toast({
          title: role === 'host' ? 'Signed in as Demo Host' : 'Signed in as Demo Guest',
          description: 'Welcome to Agribnv demo.',
        });
        navigate(role === 'host' ? '/host' : '/explore');
        return;
      }

      // 2. If user doesn't exist yet, sign up
      const { data: signUpData, error: signUpErr } = await authSignUp(demoEmail, demoPassword, demoName);
      if (signUpErr) {
        toast({
          title: 'Demo sign-in notice',
          description: signUpErr.message,
          variant: 'destructive',
        });
        return;
      }

      // If host, assign host role
      if (role === 'host' && signUpData?.user?.id) {
        await supabase.from('user_roles').insert({
          user_id: signUpData.user.id,
          role: 'host',
        });
      }

      toast({
        title: role === 'host' ? 'Welcome, Demo Host!' : 'Welcome, Demo Guest!',
        description: 'Account created and ready.',
      });
      navigate(role === 'host' ? '/host' : '/explore');
    } catch (err: any) {
      toast({
        title: 'Demo login failed',
        description: err?.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up the user
        const { data: authData, error } = await authSignUp(
          data.email, 
          data.password, 
          data.fullName, 
          data.username, 
          data.phone
        );
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Try signing in instead.',
              variant: 'destructive',
            });
          } else {
            toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
          }
        } else {
          // If host role selected, add it (guest role is added by default via trigger)
          if (selectedRole === 'host' && authData?.user?.id) {
            await supabase.from('user_roles').insert({
              user_id: authData.user.id,
              role: 'host',
            });
          }

          toast({
            title: selectedRole === 'host' ? 'Welcome, Host!' : 'Welcome to Agribnv!',
            description: selectedRole === 'host'
              ? 'Your host account has been created. Start listing your farm!'
              : 'Your account has been created.',
          });
          navigate(selectedRole === 'host' ? '/host' : '/explore');
        }
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) {
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
          navigate('/explore');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row">
      {/* LEFT — form pane */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 sm:px-10 lg:px-12 xl:px-20 overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <div className="text-center">
            <img src={agribnvIconGreen} alt="Agribnv" className="h-10 sm:h-12 w-auto mx-auto mb-2" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-0.5">
              {isSignUp ? 'Get started' : 'Welcome back'}
            </h1>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
              {isSignUp ? 'Create your account to start booking farm stays.' : 'Sign in to your Agribnv account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
            {/* Role Selection for Sign Up */}
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-medium text-muted-foreground">I want to:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('guest')}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center',
                        selectedRole === 'guest' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', selectedRole === 'guest' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-xs">Book Stays</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">Find & book farm stays</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('host')}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center',
                        selectedRole === 'host' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', selectedRole === 'host' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <Home className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-xs">Host Guests</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">List your farm property</span>
                    </button>
                  </div>

                  <Input
                    id="fullName"
                    placeholder="Full name"
                    className="h-11 rounded-xl border-2 text-base"
                    {...register('fullName')}
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Input
                        id="username"
                        placeholder="Username"
                        className="h-11 rounded-xl border-2 text-base"
                        {...register('username')}
                      />
                      {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        className="h-11 rounded-xl border-2 text-base"
                        {...register('phone')}
                      />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="h-11 rounded-xl border-2 text-base"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="h-11 rounded-xl border-2 text-base pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug pt-0.5">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="underline font-semibold hover:text-foreground">Terms of Use</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline font-semibold hover:text-foreground">Privacy Policy</Link>.
            </p>

            <Button
              type="submit"
              className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                selectedRole === 'host' ? 'Create Host Account' : 'Create Account'
              ) : (
                'Log in'
              )}
            </Button>
          </form>

          <div className="mt-2.5 sm:mt-3 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); reset(); setSelectedRole('guest'); }}
              className="text-xs sm:text-sm font-semibold underline text-foreground/80 hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* 1-Click Demo Access for quick testing */}
          <div className="mt-3 pt-2.5 border-t border-border/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Demo Quick Access</span>
              <span className="text-[10px] bg-primary/10 text-primary font-medium px-1.5 py-0.2 rounded">1-Click</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => handleDemoLogin('guest')}
                className="h-8 rounded-lg text-xs font-medium border-border hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-1.5"
              >
                <User className="h-3 w-3 text-primary" />
                <span>Demo Guest</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => handleDemoLogin('host')}
                className="h-8 rounded-lg text-xs font-medium border-border hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-1.5"
              >
                <Home className="h-3 w-3 text-primary" />
                <span>Demo Host</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — animated "Terraced Light" brand graphic (desktop only) */}
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
