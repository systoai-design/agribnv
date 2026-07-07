import { motion } from 'framer-motion';
import agribnvIconWhite from '@/assets/agribnv-icon-white.png';
import agribnvLogoWhite from '@/assets/agribnv-logo-white.png';

export type SplashVariant = 'icon' | 'primary';

// Dev/QA escape hatch, matching the ?treeframe pattern used elsewhere in the app: append
// ?splashVariant=primary to compare the full-lockup treatment against the icon-only default.
export function getSplashVariant(): SplashVariant {
  if (typeof window === 'undefined') return 'icon';
  return window.location.search.includes('splashVariant=primary') ? 'primary' : 'icon';
}

interface AppLoadingScreenProps {
  variant?: SplashVariant;
}

// Shown on native platforms while the initial auth session check resolves, between the native
// OS splash screen (also the icon-only mark, for a seamless handoff) and the sign-in form. Full-
// bleed forest-green to match both the OS splash background and capacitor.config.ts's configured
// SplashScreen color, so there's no color flash at the handoff.
export function AppLoadingScreen({ variant = 'icon' }: AppLoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary safe-area-pt safe-area-pb"
      role="status"
      aria-live="polite"
      aria-label="Loading Agribnv"
    >
      <motion.img
        key={variant}
        src={variant === 'icon' ? agribnvIconWhite : agribnvLogoWhite}
        alt="Agribnv"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={variant === 'icon' ? 'h-24 w-auto' : 'h-12 w-auto max-w-[70vw]'}
      />
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-secondary"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
