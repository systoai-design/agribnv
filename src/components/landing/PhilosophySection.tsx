import { motion } from 'framer-motion';
import { Wheat, Heart, Globe } from 'lucide-react';

const PILLARS = [
  {
    icon: Wheat,
    title: 'Farmer-first economics',
    body: 'Unlike booking platforms that skim up to 30%, Agribnv charges 15% — the rest stays with the farmer. When you book a ₱2,500/night stay, ₱2,125 goes directly to a Filipino farming family.',
  },
  {
    icon: Heart,
    title: 'Authentic connections',
    body: 'Skip the resort. Sleep in a nipa hut, harvest mangoes at sunrise, and share a meal cooked from the farm\'s own produce. The farmer is your host, guide, and neighbor.',
  },
  {
    icon: Globe,
    title: 'A ripple through the economy',
    body: 'Every peso spent at an Agribnv farm circulates through the local barangay — funding education, infrastructure, and the next generation of Filipino farmers.',
  },
];

export function PhilosophySection() {
  return (
    <section className="py-24 md:py-36 overflow-hidden relative" style={{ backgroundColor: 'hsl(var(--forest-dark))' }}>
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Large pullquote */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="mb-20 md:mb-28"
        >
          <p className="font-medium text-sm tracking-widest uppercase mb-6" style={{ color: 'hsl(var(--sage) / 0.6)' }}>Our philosophy</p>
          <blockquote className="font-serif text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-[1.1] max-w-4xl">
            "Every booking plants a seed in the Philippine economy."
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-px" style={{ backgroundColor: 'hsl(var(--sage) / 0.4)' }} />
            <p className="text-white/40 text-sm">The Agribnv founding principle</p>
          </div>
        </motion.div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.13 }}
                className="border-t border-white/10 pt-8"
              >
                <Icon className="h-6 w-6 mb-5" style={{ color: 'hsl(var(--sage))' }} />
                <h3 className="text-white font-semibold text-lg mb-4">{pillar.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{pillar.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
