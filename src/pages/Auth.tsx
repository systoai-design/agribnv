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
          navigate('/');
        }
      }
    };
    checkUserAndRedirect();
  }, [user, navigate]);

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up the user
        const { error } = await authSignUp(data.email, data.password, data.fullName);
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
          if (selectedRole === 'host') {
            setTimeout(async () => {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session?.user) {
                await supabase.from('user_roles').insert({
                  user_id: sessionData.session.user.id,
                  role: 'host',
                });
              }
            }, 500);
          }

          toast({
            title: selectedRole === 'host' ? 'Welcome, Host!' : 'Welcome to Agribnv!',
            description: selectedRole === 'host'
              ? 'Your host account has been created. Start listing your farm!'
              : 'Your account has been created.',
          });
          navigate(selectedRole === 'host' ? '/host' : '/');
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
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row">
      {/* LEFT — form pane */}
      <div className="flex-1 flex flex-col px-6 py-8 sm:px-10 lg:px-16 xl:px-24">
        {/* Form — vertically centered in the pane */}
        <div className="flex-1 flex flex-col justify-center py-10">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center">
              <img src={agribnvIconGreen} alt="Agribnv" className="h-24 w-auto mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isSignUp ? 'Get started' : 'Welcome back'}
              </h1>
              <p className="text-muted-foreground mb-8">
                {isSignUp ? 'Create your account to start booking farm stays.' : 'Sign in to your Agribnv account.'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Role Selection for Sign Up */}
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm font-medium text-muted-foreground">I want to:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('guest')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          selectedRole === 'guest' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', selectedRole === 'guest' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          <User className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-sm">Book Stays</span>
                        <span className="text-xs text-muted-foreground text-center">Find & book farm experiences</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('host')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          selectedRole === 'host' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', selectedRole === 'host' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          <Home className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-sm">Host Guests</span>
                        <span className="text-xs text-muted-foreground text-center">List your farm property</span>
                      </button>
                    </div>

                    <Input
                      id="fullName"
                      placeholder="Full name"
                      className="h-14 rounded-xl border-2"
                      {...register('fullName')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="h-14 rounded-xl border-2"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="h-14 rounded-xl border-2 pr-12"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="underline font-semibold">Terms of Use</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline font-semibold">Privacy Policy</Link>.
              </p>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSignUp ? (
                  selectedRole === 'host' ? 'Create Host Account' : 'Create Account'
                ) : (
                  'Log in'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); reset(); setSelectedRole('guest'); }}
                className="text-sm font-semibold underline"
              >
                {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — animated "Terraced Light" brand graphic (desktop only) */}
      <div className="hidden lg:flex lg:flex-1 relative flex-col justify-end overflow-hidden p-12 xl:p-16 bg-[#156530]">
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
