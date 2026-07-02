import { motion } from 'framer-motion';
import { Tent, Sprout, ShieldCheck } from 'lucide-react';

const PILLARS = [
  {
    icon: Tent,
    title: 'For travelers',
    body: 'Browse farm stays and hands-on experiences no resort can offer — harvest at sunrise, cook with your host, and sleep where your food is grown.',
  },
  {
    icon: Sprout,
    title: 'For hosts',
    body: 'List your farm in minutes, set your own prices, and earn all year — not just at harvest. You keep the majority of every booking.',
  },
  {
    icon: ShieldCheck,
    title: 'Booked with confidence',
    body: 'Verified listings, secure GCash and Maya payments, and real guest reviews mean every trip is protected from search to checkout.',
  },
];

export function PhilosophySection() {
  return (
    <section className="py-24 md:py-36 overflow-hidden relative bg-[#156530]">
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
          className="mb-10 md:mb-12 text-center"
        >
          <p className="font-poppins font-medium text-sm tracking-widest uppercase mb-6" style={{ color: 'hsl(var(--sage) / 0.7)' }}>For hosts &amp; travelers</p>
          <h2 className="font-roca text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-[1.1] max-w-4xl mx-auto">
            Stay on a farm.
            <br />
            <span className="text-[#B0D182]">Or share yours.</span>
          </h2>
          <p className="mt-8 font-poppins text-[#FEF9F0] text-sm max-w-md mx-auto">The Philippines' marketplace for farm stays and hands-on rural experiences.</p>
        </motion.div>

        {/* Single divider line, drawn just above the three columns */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-px w-full origin-center bg-[#B0D182]/30 mb-10 md:mb-12"
        />

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
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#B0D182]/20 mb-5">
                  <Icon className="h-6 w-6 text-[#B0D182]" strokeWidth={2.5} />
                </span>
                <h3 className="font-poppins text-white font-semibold text-lg mb-4">{pillar.title}</h3>
                <p className="font-poppins text-[#FEF9F0] text-sm leading-relaxed">{pillar.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
