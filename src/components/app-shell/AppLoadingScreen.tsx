import { motion } from 'framer-motion';
import agribnvIconGreen from '@/assets/agribnv-icon-green.png?v=2';

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
        animate={{ 
          opacity: [0, 1, 1, 1], 
          scale: [0.92, 1, 1.05, 1] 
        }}
        transition={{ 
          duration: 2, 
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className="h-28 w-auto drop-shadow-md"
      />
    </div>
  );
}
