import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Stat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 12, prefix: '₱', suffix: 'M', label: 'Channeled to farming families' },
  { value: 120, suffix: '+', label: 'Farms listed nationwide' },
  { value: 3400, suffix: '+', label: 'Guests hosted' },
  { value: 85, suffix: '%', label: 'Reaches farmers directly' },
];

function AnimatedCounter({ value, suffix, prefix = '' }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const startTime = performance.now();
    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Thin vertical dividers between stats — mobile is a 2-col grid, desktop a 4-col row.
function dividerClass(i: number): string {
  const mobileLeft = i % 2 === 1; // right column on mobile
  if (mobileLeft) return 'border-l pl-6 md:pl-10';
  if (i !== 0) return 'pl-0 md:border-l md:pl-10'; // divider appears only at desktop width
  return 'pl-0';
}

export function ImpactStatsSection() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Compact editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-12 md:mb-14"
        >
          <p className="text-primary font-medium text-xs tracking-widest uppercase mb-3">Our Impact</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Real numbers. Real change.
          </h2>
        </motion.div>

        {/* Clean horizontal stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-y-0">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`text-left ${dividerClass(i)}`}
              style={{ borderColor: 'hsl(var(--cream-dark))' }}
            >
              <div
                className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-none mb-2.5"
                style={{ color: 'hsl(var(--forest))' }}
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <p className="text-gray-500 text-sm leading-snug max-w-[14ch]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
