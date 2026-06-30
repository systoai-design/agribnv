import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Served from /public — drop the farm photo here as `hero-farm.jpg`.
const HERO_IMAGE = '/hero-farm.jpg';

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--forest-dark))' }}
    >
      {/* Full-bleed farm photo with subtle parallax */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <div
          className="absolute inset-0 bg-cover bg-center scale-125"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
      </motion.div>

      {/* Forest-green scrims for text legibility over the photo */}
      <div className="absolute inset-0" style={{ backgroundColor: 'hsl(146 70% 8% / 0.5)' }} />
      <div
        className="absolute inset-x-0 top-0 h-48"
        style={{ background: 'linear-gradient(to bottom, hsl(146 70% 6% / 0.85), transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{ background: 'linear-gradient(to top, hsl(var(--forest-dark)), transparent)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 42%, hsl(146 70% 5% / 0.55), transparent 72%)' }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        style={{ opacity, y: contentY }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(var(--sage))' }} />
          <span className="text-white/80 text-xs font-medium tracking-widest uppercase">Farm-to-traveler platform · Philippines</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-6"
          style={{ textShadow: '0 2px 32px hsl(146 70% 4% / 0.55)' }}
        >
          Where every stay
          <br />
          <span style={{ color: 'hsl(var(--sage))' }}>empowers</span>
          <br />
          Filipino Farmers.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-white/75 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ textShadow: '0 1px 20px hsl(146 70% 4% / 0.5)' }}
        >
          Book a farm stay, join a harvest experience, or source produce directly
          from the hands that grow it. Tourism that rebuilds rural economies.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-8 h-12 text-base shadow-xl shadow-black/30 group"
          >
            <Link to="/explore">
              Explore farms
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 bg-white/5 backdrop-blur-sm font-semibold rounded-full px-8 h-12 text-base"
          >
            <Link to="/host">
              <Play className="mr-2 h-4 w-4 fill-white" />
              List your farm
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Editorial corner — location (bottom-left) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute bottom-8 left-6 md:left-10 z-10 hidden sm:flex items-center gap-2 text-white/70"
      >
        <MapPin className="h-4 w-4" style={{ color: 'hsl(var(--sage))' }} />
        <span className="text-xs font-medium tracking-wide uppercase">Guimaras · Philippines</span>
      </motion.div>

      {/* Editorial corner — scroll cue (bottom-right) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 right-6 md:right-10 z-10 hidden sm:flex items-center gap-3 text-white/60"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll to explore</span>
        <motion.div
          className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-white/70 rounded-full"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
