import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface AuthWelcomePanelProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onSocialAuth: () => void;
  isLoading: boolean;
}

export function AuthWelcomePanel({
  onSignIn,
  onSignUp,
  onSocialAuth,
  isLoading,
}: AuthWelcomePanelProps) {
  return (
    <motion.div
      key="welcome-panel"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-between h-full py-1"
    >
      {/* 1. Header block */}
      <div className="text-center pt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight mb-2">
          Discover the Farm
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
          Follow farmer stories, book authentic farm stays, and experience seasonal harvests.
        </p>
      </div>

      {/* 2. Primary action buttons */}
      <div className="space-y-4 my-auto py-2">
        <Button
          type="button"
          onClick={onSignIn}
          disabled={isLoading}
          className="w-full h-14 rounded-full text-base font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 opacity-80" />
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onSignUp}
          disabled={isLoading}
          className="w-full h-14 rounded-full text-base font-semibold border-2 border-[#1E3A2B]/20 hover:border-[#1E3A2B] hover:bg-[#1E3A2B]/5 text-foreground active:scale-[0.98] transition-all"
        >
          Create an Account
        </Button>
      </div>

      {/* 3. Social login block */}
      <div className="space-y-4 my-auto py-2">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/80" />
          <span className="shrink-0 mx-3 px-3.5 py-1 rounded-full bg-muted/60 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            or continue with
          </span>
          <div className="flex-grow border-t border-border/80" />
        </div>

        <button
          type="button"
          onClick={onSocialAuth}
          disabled={isLoading}
          className="w-full h-14 rounded-full border border-border/90 bg-card hover:bg-muted/40 text-foreground font-medium text-base flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] transition-all"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>

      {/* 4. Bottom guest link & trust footer */}
      <div className="pt-2 pb-1 text-center space-y-3">
        <div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Explore as Guest
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-muted-foreground/75 tracking-wider uppercase pt-2 border-t border-border/40">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Verified Working Farms · Direct Local Harvest</span>
        </div>
      </div>
    </motion.div>
  );
}
