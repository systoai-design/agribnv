import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section
      className="relative py-32 md:py-40 overflow-hidden"
      aria-labelledby="cta-heading"
      style={{
        // Cream at the top hands off seamlessly from the testimonials; it deepens into a soft
        // sage toward the bottom so there's a clear color break against the cream footer below.
        background:
          'linear-gradient(180deg, hsl(var(--cream)) 0%, hsl(var(--cream)) 32%, hsl(var(--sage) / 0.6) 100%)',
      }}
    >

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-primary font-medium text-xs tracking-widest uppercase mb-5"
        >
          Ready to explore
        </motion.p>

        {/* Headline */}
        <motion.h2
          id="cta-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-7"
        >
          Your next adventure is{' '}
          <span style={{ color: 'hsl(var(--forest))' }}>growing in a field.</span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto mb-12"
        >
          Whether you're booking an unforgettable farm stay or turning your land into year-round income, Agribnv makes it happen in a few taps.
        </motion.p>

        {/* CTAs */}
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-shadow group"
          >
            <Link to="/explore">
              Explore farms
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 bg-transparent font-semibold rounded-full px-8 h-12 text-base transition-all"
          >
            <Link to="/auth?mode=signup&role=host">
              <Home className="mr-2 h-4 w-4" />
              List your farm
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
