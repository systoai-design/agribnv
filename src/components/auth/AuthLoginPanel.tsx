import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { GoogleIcon } from './AuthWelcomePanel';

interface AuthLoginPanelProps {
  form: UseFormReturn<any>;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToSignup: () => void;
  onSocialAuth: () => void;
  isLoading: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function AuthLoginPanel({
  form,
  onSubmit,
  onSwitchToSignup,
  onSocialAuth,
  isLoading,
  showPassword,
  onTogglePassword,
}: AuthLoginPanelProps) {
  const { register, formState: { errors } } = form;

  return (
    <motion.div
      key="login-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-between h-full"
    >
      <div className="my-auto py-2">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to your UMANI account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Email Pill Input */}
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="h-12 sm:h-13 pl-11 pr-5 rounded-full border-2 border-border/80 focus:border-primary bg-background text-sm"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-destructive px-3">{errors.email.message as string}</p>
            )}
          </div>

          {/* Password Pill Input */}
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                className="h-12 sm:h-13 pl-11 pr-12 rounded-full border-2 border-border/80 focus:border-primary bg-background text-sm"
                {...register('password')}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive px-3">{errors.password.message as string}</p>
            )}
          </div>

          {/* Right-aligned Forgot Password Link */}
          <div className="text-right pt-0.5">
            <Link
              to="/change-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary Log In Pill Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-13 rounded-full text-sm font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-border/80" />
          <span className="shrink-0 mx-3 px-3 py-0.5 rounded-full bg-muted/60 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            or continue with
          </span>
          <div className="flex-grow border-t border-border/80" />
        </div>

        {/* Social Auth Pill Button */}
        <button
          type="button"
          onClick={onSocialAuth}
          disabled={isLoading}
          className="w-full h-12 sm:h-13 rounded-full border border-border/90 bg-card hover:bg-muted/40 text-foreground font-medium text-sm flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] transition-all"
        >
          <GoogleIcon />
          <span>Sign In with Google</span>
        </button>
      </div>

      {/* Switch to Sign-up */}
      <div className="pt-6 pb-2 text-center mt-auto">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-foreground hover:text-primary transition-colors underline ml-1"
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
}
