import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden" style={{ backgroundColor: 'hsl(var(--forest-dark))' }}>
      {/* Refined background — minimal, elegant */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle gradient backdrop */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% 0%, hsl(var(--forest)), hsl(var(--forest-dark)))',
          }}
        />
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-medium text-xs tracking-widest uppercase mb-5"
          style={{ color: 'hsl(var(--sage) / 0.7)' }}
        >
          Ready to explore
        </motion.p>

        {/* Headline — premium serif, scale and contrast */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-7"
        >
          Your next adventure is growing in a field.
        </motion.h2>

        {/* Subheadline — refined, breathed */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto mb-12"
        >
          Whether you're seeking authentic farm experiences or opening your land to the world, Agribnv connects Filipino agriculture with curious travelers.
        </motion.p>

        {/* CTAs — refined button treatment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-shadow group"
          >
            <Link to="/explore">
              Explore farms
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="border-white/40 text-white hover:bg-white/5 hover:border-white/60 bg-transparent font-semibold rounded-full px-8 h-12 text-base transition-all"
          >
            <Link to="/host">
              <Home className="mr-2 h-4 w-4" />
              List your farm
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
