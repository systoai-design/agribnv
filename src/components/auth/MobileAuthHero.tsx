import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { haptics } from '@/core/platform';
import { cn } from '@/lib/utils';

export type AuthHeroMode =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'account-type'
  | 'traveler-onboarding'
  | 'farmer-step1'
  | 'farmer-step2'
  | 'farmer-step3';

interface MobileAuthHeroProps {
  mode: AuthHeroMode;
  onBack: () => void;
  onSkip?: () => void;
}

export function MobileAuthHero({ mode, onBack, onSkip }: MobileAuthHeroProps) {
  const isDetail = mode !== 'welcome';

  const handleBack = () => {
    haptics.impact('light');
    onBack();
  };

  const isWelcome = mode === 'welcome';
  const isAccountType = mode === 'account-type';
  const isSignup = mode === 'signup';
  const isOnboarding =
    mode === 'traveler-onboarding' ||
    mode === 'farmer-step1' ||
    mode === 'farmer-step2' ||
    mode === 'farmer-step3';

  const heroHeightClass = isWelcome
    ? 'h-[44vh] min-h-[320px]'
    : isOnboarding
    ? 'h-[18vh] min-h-[130px]'
    : isAccountType
    ? 'h-[24vh] min-h-[180px]'
    : isSignup
    ? 'h-[23vh] min-h-[160px]'
    : 'h-[34vh] min-h-[240px]';

  return (
    <div
      className={cn(
        "relative w-full bg-[#142A1D] overflow-hidden flex flex-col justify-between shrink-0 select-none transition-all duration-300",
        heroHeightClass
      )}
    >
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 25%, rgba(176, 209, 130, 0.22) 0%, rgba(20, 42, 29, 0) 70%)',
        }}
      />

      {/* Pure Picture Placeholder: Stylized Sun (Circle) & Terraced Mountain (Triangle) Geometric Motifs from Wireframe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* The Golden Rising Sun (Circle) */}
        <motion.div
          animate={{
            scale: isDetail ? 0.85 : 1,
            y: isDetail ? -14 : 0,
            opacity: isDetail ? 0.75 : 0.95,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-8 sm:top-12 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#F2C078] via-[#E09F5A] to-[#C87941] shadow-[0_0_60px_rgba(242,192,120,0.45)] flex items-center justify-center opacity-90"
        >
          {/* Subtle inner sun ring */}
          <div className="w-24 h-24 rounded-full border border-white/20 bg-white/5" />
        </motion.div>

        {/* Terraced Ridge Lines / Mountain Silhouette (Triangle & Contours) */}
        <svg
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-[190px] sm:h-[210px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="terraceGrad1" x1="200" y1="30" x2="200" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#254A35" stopOpacity="0.9" />
              <stop offset="1" stopColor="#142A1D" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="terraceGrad2" x1="200" y1="80" x2="200" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#315E44" stopOpacity="0.75" />
              <stop offset="1" stopColor="#183223" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="ridgeLine" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F2C078" stopOpacity="0.6" />
              <stop offset="0.5" stopColor="#B0D182" stopOpacity="0.7" />
              <stop offset="1" stopColor="#F2C078" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Background Mountain Triangle */}
          <path
            d="M 200 45 L 340 220 L 60 220 Z"
            fill="url(#terraceGrad1)"
            opacity="0.85"
          />
          <path
            d="M 200 45 L 340 220 L 60 220 Z"
            stroke="url(#ridgeLine)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* Foreground Terraced Contours */}
          <path
            d="M -20 160 Q 90 120 200 150 T 420 140 L 420 220 L -20 220 Z"
            fill="url(#terraceGrad2)"
            opacity="0.95"
          />
          <path
            d="M -20 160 Q 90 120 200 150 T 420 140"
            stroke="#B0D182"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />

          {/* Front Terrace Wave */}
          <path
            d="M -20 185 Q 120 165 240 190 T 420 175 L 420 220 L -20 220 Z"
            fill="#12251A"
          />
          <path
            d="M -20 185 Q 120 165 240 190 T 420 175"
            stroke="#B0D182"
            strokeWidth="1.4"
            strokeOpacity="0.6"
          />
        </svg>

        {/* Ambient atmospheric stars/fireflies */}
        <div className="absolute inset-0 flex items-center justify-around opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-[#B0D182] animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 rounded-full bg-[#F2C078] animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F5] animate-pulse" style={{ animationDelay: '1.4s' }} />
          <div className="w-1 h-1 rounded-full bg-[#B0D182] animate-pulse" style={{ animationDelay: '2.1s' }} />
        </div>
      </div>

      {/* Top Navigation Bar with Safe Area matching Wireframe Header */}
      {isDetail ? (
        <div className="relative z-20 pt-4 px-4 sm:px-6 flex items-center justify-between safe-area-pt">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/35 active:scale-95 text-white text-xs font-medium backdrop-blur-md border border-white/15 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white" />
            <span>Back</span>
          </motion.button>

          {/* 3-Dot Step Indicator for Farmer Steps matching Wireframe Top-Right */}
          {mode.startsWith('farmer-') && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-white shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80 mr-0.5">
                {mode === 'farmer-step1' ? '1 of 3' : mode === 'farmer-step2' ? '2 of 3' : '3 of 3'}
              </span>
              <div className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full transition-all", mode === 'farmer-step1' ? "bg-[#B0D182] scale-110 shadow-sm" : "bg-white/30")} />
                <span className={cn("w-2 h-2 rounded-full transition-all", mode === 'farmer-step2' ? "bg-[#B0D182] scale-110 shadow-sm" : "bg-white/30")} />
                <span className={cn("w-2 h-2 rounded-full transition-all", mode === 'farmer-step3' ? "bg-[#B0D182] scale-110 shadow-sm" : "bg-white/30")} />
              </div>
            </div>
          )}

          {/* Skip CTA for Traveler */}
          {mode === 'traveler-onboarding' && onSkip && (
            <button
              type="button"
              onClick={() => {
                haptics.impact('light');
                onSkip();
              }}
              className="text-xs font-semibold text-white/90 hover:text-white px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/35 backdrop-blur-md border border-white/15 transition-all shadow-sm cursor-pointer"
            >
              Skip
            </button>
          )}

          {/* Clean spacer if neither applies */}
          {!mode.startsWith('farmer-') && mode !== 'traveler-onboarding' && (
            <div className="w-8" />
          )}
        </div>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}
