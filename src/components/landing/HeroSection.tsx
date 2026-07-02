import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroSearch } from '@/components/landing/HeroSearch';

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
      className="relative min-h-screen flex items-start md:items-center justify-center overflow-hidden"
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

      {/* Content — top-anchored below the nav on mobile (content is taller than the viewport
          there); vertically centered from md up. */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-16 md:py-0"
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
          <span className="text-white/80 text-xs font-medium tracking-widest uppercase">The farm-stay marketplace · Philippines</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-serif text-4xl md:text-7xl lg:text-8xl font-bold text-white leading-[1] md:leading-[0.95] tracking-tight mb-5 md:mb-6"
          style={{ textShadow: '0 2px 32px hsl(146 70% 4% / 0.55)' }}
        >
          Where every stay
          <br />
          is a real
          <br />
          <span style={{ color: 'hsl(var(--sage))' }}>Filipino farm.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-white/75 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
          style={{ textShadow: '0 1px 20px hsl(146 70% 4% / 0.5)' }}
        >
          Trade the city for authentic, hands-on rural experiences. Discover and book
          verified farm stays across the Philippine countryside.
        </motion.p>

        {/* Booking search — the primary action, front and center */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <HeroSearch />
        </motion.div>

        {/* Secondary paths — quiet links so search stays the hero action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-6 flex items-center justify-center gap-3 text-sm text-white/70"
        >
          <Link to="/explore" className="hover:text-white transition-colors underline-offset-4 hover:underline">
            Browse all farms
          </Link>
          <span aria-hidden className="text-white/30">·</span>
          <Link to="/auth?mode=signup&role=host" className="hover:text-white transition-colors underline-offset-4 hover:underline">
            List your farm
          </Link>
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
    </section>
  );
}
