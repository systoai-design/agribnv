import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { haptics } from '@/core/platform';
import { GoogleIcon } from './AuthWelcomePanel';

interface AuthSignupPanelProps {
  form: UseFormReturn<any>;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
  onSocialAuth: () => void;
  onSwitchToAccountType?: () => void;
  isLoading: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function AuthSignupPanel({
  form,
  onSubmit,
  onSwitchToLogin,
  onSocialAuth,
  onSwitchToAccountType,
  isLoading,
  showPassword,
  onTogglePassword,
}: AuthSignupPanelProps) {
  const { register, formState: { errors } } = form;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      haptics.notification('error');
      setTermsError(true);
      return;
    }
    setTermsError(false);
    onSubmit(e);
  };

  return (
    <motion.div
      key="signup-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-between h-full"
    >
      <div className="my-auto py-1">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
            Join UMANI
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create your account to start exploring
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          {/* First Name & Last Name (Side by Side Pills) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Input
                id="firstName"
                placeholder="First name"
                className="h-11 px-4 rounded-full border-2 border-border/80 focus:border-primary bg-background text-sm"
                {...register('firstName')}
              />
            </div>
            <div className="space-y-1">
              <Input
                id="lastName"
                placeholder="Last name"
                className="h-11 px-4 rounded-full border-2 border-border/80 focus:border-primary bg-background text-sm"
                {...register('lastName')}
              />
            </div>
          </div>

          {/* Email Pill Input */}
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="h-11 pl-11 pr-5 rounded-full border-2 border-border/80 focus:border-primary bg-background text-sm"
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
                placeholder="Password (min 6 chars)"
                autoComplete="new-password"
                className="h-11 pl-11 pr-12 rounded-full border-2 border-border/80 focus:border-primary bg-background text-sm"
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

          {/* Terms & Agreements Checkbox (Philippine DPA RA 10173 & UMANI Hazard Waiver) */}
          <div className="pt-1 pb-1">
            <div className="flex items-start gap-2.5 px-1 py-1">
              <Checkbox
                id="terms-checkbox"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  haptics.impact('light');
                  const val = Boolean(checked);
                  setTermsAccepted(val);
                  if (val) setTermsError(false);
                }}
                className={cn(
                  "mt-0.5 h-4 w-4 rounded-[4px] border-2 transition-all",
                  termsError
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-border/90 data-[state=checked]:bg-[#1E3A2B] data-[state=checked]:border-[#1E3A2B]"
                )}
              />
              <label
                htmlFor="terms-checkbox"
                className="text-xs text-muted-foreground cursor-pointer select-none leading-snug"
              >
                I agree to UMANI's{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms &amp; Agreements
                </Link>
                {' '}and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>.
              </label>
            </div>
            {termsError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-destructive font-medium px-7 mt-0.5"
              >
                Please agree to the Terms &amp; Agreements to continue.
              </motion.p>
            )}
          </div>

          {/* Primary Create Account Pill Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-full text-sm font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex py-3.5 items-center">
          <div className="flex-grow border-t border-border/80" />
          <span className="shrink-0 mx-3 px-3 py-0.5 rounded-full bg-muted/60 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            or sign up with
          </span>
          <div className="flex-grow border-t border-border/80" />
        </div>

        {/* Social Auth Pill Button */}
        <button
          type="button"
          onClick={onSocialAuth}
          className="w-full h-12 rounded-full border border-border/90 bg-card hover:bg-muted/40 text-foreground font-medium text-sm flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] transition-all"
        >
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>
      </div>

      {/* Switch to Log-in & Preview */}
      <div className="pt-4 pb-1 text-center mt-auto space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-foreground hover:text-primary transition-colors underline ml-1"
          >
            Sign in
          </button>
        </p>

        {onSwitchToAccountType && (
          <div>
            <button
              type="button"
              onClick={onSwitchToAccountType}
              className="text-[11px] font-semibold text-primary/80 hover:text-primary transition-colors underline underline-offset-2"
            >
              Preview "Type of Account" wireframe →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
