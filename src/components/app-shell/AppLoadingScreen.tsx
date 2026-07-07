import { motion } from 'framer-motion';
import agribnvIconGreen from '@/assets/agribnv-icon-green.png';

// Shown on native platforms while the initial auth session check resolves, between the native
// OS splash screen (same cream background + icon, for a seamless handoff) and the sign-in form.
export function AppLoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background safe-area-pt safe-area-pb"
      role="status"
      aria-live="polite"
      aria-label="Loading Agribnv"
    >
      <motion.img
        src={agribnvIconGreen}
        alt="Agribnv"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-28 w-auto"
      />
    </div>
  );
}
