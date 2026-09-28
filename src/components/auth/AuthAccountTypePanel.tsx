import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sprout, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { haptics } from '@/core/platform';

export type UserRole = 'guest' | 'host';

interface AuthAccountTypePanelProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
  isLoading: boolean;
}

export function AuthAccountTypePanel({
  selectedRole,
  onSelectRole,
  onContinue,
  isLoading,
}: AuthAccountTypePanelProps) {
  const handleSelect = (role: UserRole) => {
    haptics.impact('light');
    onSelectRole(role);
  };

  const handleContinue = () => {
    haptics.impact('medium');
    onContinue();
  };

  return (
    <motion.div
      key="account-type-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-between h-full py-1"
    >
      {/* 1. Header Block */}
      <div className="text-center pt-1">
        <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider mb-2">
          Step 2 of 2
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
          Type of Account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[300px] mx-auto leading-relaxed">
          Choose how you would like to experience the UMANI farmland ecosystem
        </p>
      </div>

      {/* 2. Selection Cards (Centered and filling vertical room) */}
      <div className="space-y-4 my-auto py-2">
        {/* Option 1: Traveler / Guest */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect('guest')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect('guest');
            }
          }}
          className={cn(
            "w-full text-left p-5 sm:p-6 rounded-[24px] border-2 transition-all cursor-pointer relative select-none flex items-start gap-4 shadow-xs active:scale-[0.99]",
            selectedRole === 'guest'
              ? "border-primary bg-primary/[0.05] shadow-sm ring-1 ring-primary/20"
              : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
            selectedRole === 'guest'
              ? "bg-[#1E3A2B] text-white shadow-xs"
              : "bg-muted text-muted-foreground"
          )}>
            <Compass className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-serif font-bold text-foreground text-lg tracking-tight">
                Traveler / Guest
              </h3>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800">
                Explorer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Discover scenic farm stays, book hands-on harvest tours, and purchase fresh produce directly from local farms.
            </p>
          </div>

          {/* Selection Radio Indicator */}
          <div className={cn(
            "w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all absolute right-4 top-5",
            selectedRole === 'guest'
              ? "border-[#1E3A2B] bg-[#1E3A2B] text-white"
              : "border-muted-foreground/30 bg-transparent"
          )}>
            {selectedRole === 'guest' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {/* Option 2: Farm Host */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect('host')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect('host');
            }
          }}
          className={cn(
            "w-full text-left p-5 sm:p-6 rounded-[24px] border-2 transition-all cursor-pointer relative select-none flex items-start gap-4 shadow-xs active:scale-[0.99]",
            selectedRole === 'host'
              ? "border-primary bg-primary/[0.05] shadow-sm ring-1 ring-primary/20"
              : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
            selectedRole === 'host'
              ? "bg-[#C87941] text-white shadow-xs"
              : "bg-muted text-muted-foreground"
          )}>
            <Sprout className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-serif font-bold text-foreground text-lg tracking-tight">
                Farm Host
              </h3>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800">
                Producer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              List your farm accommodations, host seasonal activities &amp; workshops, and sell your harvest directly to travelers.
            </p>
          </div>

          {/* Selection Radio Indicator */}
          <div className={cn(
            "w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all absolute right-4 top-5",
            selectedRole === 'host'
              ? "border-[#1E3A2B] bg-[#1E3A2B] text-white"
              : "border-muted-foreground/30 bg-transparent"
          )}>
            {selectedRole === 'host' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Area */}
      <div className="pt-4 pb-1 space-y-3">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full h-14 rounded-full text-base font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-muted-foreground leading-tight px-4">
          You can also switch or manage your host profile anytime from your account settings.
        </p>
      </div>
    </motion.div>
  );
}
