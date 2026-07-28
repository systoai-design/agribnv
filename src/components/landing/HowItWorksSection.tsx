import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Search, CalendarCheck, Leaf, Sprout, Wallet } from 'lucide-react';

type Mode = 'travel' | 'host';

interface Step {
  icon: typeof Search;
  title: string;
  description: string;
}
interface Journey {
  eyebrow: string;
  heading: string;
  sub: string;
  steps: Step[];
}

const JOURNEYS: Record<Mode, Journey> = {
  travel: {
    eyebrow: 'For travelers',
    heading: 'Three steps to the real thing.',
    sub: 'No middlemen. No algorithms. Just you, a farm, and a few unforgettable days.',
    steps: [
      {
        icon: Search,
        title: 'Discover',
        description:
          'Browse authentic farm stays across the Philippines. Filter by region, experience, or price — every listing is a real working farm.',
      },
      {
        icon: CalendarCheck,
        title: 'Reserve',
        description:
          'Choose your dates, add experiences like harvesting or cooking, and pay securely. Your host confirms in an instant.',
      },
      {
        icon: Leaf,
        title: 'Experience',
        description:
          'Live as a farmer for a few days. Wake to roosters, harvest at dawn, and share meals cooked straight from the field.',
      },
    ],
  },
  host: {
    eyebrow: 'For hosts',
    heading: 'Hosting is just as simple.',
    sub: 'List once, get discovered, and earn all year — you keep 100% of your listed price.',
    steps: [
      {
        icon: Sprout,
        title: 'List your farm',
        description:
          'Add photos, set your own prices, and publish in minutes. Our tools handle the calendar, guests, and payouts for you.',
      },
      {
        icon: CalendarCheck,
        title: 'Get booked',
        description:
          'Travelers discover your farm and book stays and experiences. Message guests and manage requests right from your dashboard.',
      },
      {
        icon: Wallet,
        title: 'Get paid',
        description:
          'Secure GCash and Maya payouts land after every stay. You keep 100% — no listing fees, no lock-in, ever.',
      },
    ],
  },
};

// Curated, verified Unsplash farm imagery — swap for owned photos later.
const COLLAGE = {
  field: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=720&q=80&auto=format&fit=crop',
  farmer: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=720&q=80&auto=format&fit=crop',
  harvest: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80&auto=format&fit=crop',
};

const EASE = [0.16, 1, 0.3, 1] as const;
const POP = [0.34, 1.56, 0.64, 1] as const;

// Header + steps orchestrate from one container so they reveal in sequence — and re-run the whole
// cascade whenever the traveler/host toggle swaps the content.
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.04 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } },
};
const headerItemV = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };
const stepsGroupV = { hidden: {}, show: { transition: { staggerChildren: 0.13 } } };
const stepItemV = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const nodeVariant = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: POP } },
};
const copyVariant = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
};

const OPTIONS: { id: Mode; label: string }[] = [
  { id: 'travel', label: 'I want to travel' },
  { id: 'host', label: 'I want to host' },
];

function JourneyToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full p-1 ring-1"
      style={{ backgroundColor: 'hsl(var(--forest) / 0.06)', borderColor: 'hsl(var(--forest) / 0.14)' }}
      role="tablist"
      aria-label="Choose your journey"
    >
      {OPTIONS.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className="relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--forest))]"
            style={{ color: active ? '#fff' : 'hsl(var(--forest) / 0.7)' }}
          >
            {active && (
              <motion.span
                layoutId="journeyTogglePill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'hsl(var(--forest))' }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HowItWorksSection() {
  const [mode, setMode] = useState<Mode>('travel');
  const swapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(swapRef, { once: true, margin: '-100px' });
  const journey = JOURNEYS[mode];

  return (
    <section className="bg-white py-24 md:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* items-start (not center) so the collage stays pinned to the top and doesn't drift
            vertically when the travel/host toggle changes the left column's height. */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* LEFT — toggle + swappable header & animated steps */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="mb-9"
            >
              <JourneyToggle mode={mode} onChange={setMode} />
            </motion.div>

            <div ref={swapRef}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  variants={containerV}
                  initial="hidden"
                  animate={inView ? 'show' : 'hidden'}
                  exit="exit"
                >
                  {/* Header */}
                  <motion.div variants={headerItemV} className="mb-12 md:mb-14">
                    <p className="text-primary font-medium text-xs tracking-widest uppercase mb-4">{journey.eyebrow}</p>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-5">
                      {journey.heading}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed max-w-md">{journey.sub}</p>
                  </motion.div>

                  {/* Steps */}
                  <motion.div variants={stepsGroupV} className="space-y-8">
                    {journey.steps.map((step, i) => {
                      const Icon = step.icon;
                      const isLast = i === journey.steps.length - 1;
                      return (
                        <motion.div key={step.title} variants={stepItemV} className="relative flex gap-5">
                          {/* Badge + connector */}
                          <div className="relative shrink-0">
                            <motion.div
                              variants={nodeVariant}
                              className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 ring-1"
                              style={{ backgroundColor: 'hsl(var(--forest) / 0.06)', borderColor: 'hsl(var(--forest) / 0.15)' }}
                            >
                              <Icon className="h-6 w-6" style={{ color: 'hsl(var(--forest))' }} />
                            </motion.div>
                            {!isLast && (
                              <div
                                className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-[calc(100%-1rem)]"
                                style={{ backgroundColor: 'hsl(var(--forest) / 0.12)' }}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <motion.div variants={copyVariant} className="pt-1 pb-2">
                            <span
                              className="font-semibold text-xs tracking-widest uppercase"
                              style={{ color: 'hsl(var(--forest) / 0.5)' }}
                            >
                              Step {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1.5 mb-2.5">{step.title}</h3>
                            <p className="text-gray-600 text-base leading-relaxed max-w-md">{step.description}</p>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — stacked photo collage */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none aspect-[4/5]"
          >
            {/* Back — lush field landscape */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="absolute left-0 top-[8%] w-[66%] aspect-[3/4] z-10"
            >
              <motion.img
                src={COLLAGE.field}
                alt="Lush farm fields in the Philippine countryside"
                width={720}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover rounded-3xl shadow-xl ring-1 ring-black/5"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Front — farmer at work */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 4 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.14, ease: EASE }}
              className="absolute right-0 bottom-0 w-[60%] aspect-[3/4] z-20"
            >
              <motion.img
                src={COLLAGE.farmer}
                alt="A Filipino farmer tending the harvest"
                width={720}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover rounded-3xl shadow-2xl ring-4 ring-white"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </motion.div>

            {/* Accent — harvest bounty */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: 16 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 8 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
              className="absolute right-[8%] top-0 w-[38%] aspect-square z-30"
            >
              <motion.img
                src={COLLAGE.harvest}
                alt="Freshly harvested farm produce"
                width={600}
                height={600}
                loading="lazy"
                className="h-full w-full object-cover rounded-2xl shadow-lg ring-4 ring-white"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </motion.div>

            {/* Floating credibility chip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute left-[2%] bottom-[6%] z-40 flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 shadow-xl ring-1 ring-black/5"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'hsl(var(--sage) / 0.25)' }}
              >
                <Sprout className="h-4 w-4" style={{ color: 'hsl(var(--forest))' }} />
              </div>
              <div className="leading-tight">
                <p className="text-gray-900 font-semibold text-sm">Real farms</p>
                <p className="text-gray-500 text-xs">Real Experiences</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
