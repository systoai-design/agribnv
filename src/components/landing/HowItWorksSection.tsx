import { motion } from 'framer-motion';
import { Search, CalendarCheck, Leaf, Sprout } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Discover',
    description:
      "Browse authentic farm stays across the Philippines. Filter by region, experience type, or price range. Each listing tells a farming family's story.",
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Reserve',
    description:
      'Choose your dates. Select optional experiences — harvest, cooking, or guided tours. Pay transparently. The farmer gets confirmed instantly.',
  },
  {
    number: '03',
    icon: Leaf,
    title: 'Experience',
    description:
      'Live as a farmer. Wake to roosters. Harvest at dawn. Share meals cooked from the farm. Every peso you spend stays in the community.',
  },
];

// Curated, verified Unsplash farm imagery — swap for owned photos later.
const COLLAGE = {
  field: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=720&q=80&auto=format&fit=crop',
  farmer: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=720&q=80&auto=format&fit=crop',
  harvest: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80&auto=format&fit=crop',
};

export function HowItWorksSection() {
  return (
    <section className="bg-white py-24 md:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* LEFT — header + vertically stacked steps */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="mb-12 md:mb-14"
            >
              <p className="text-primary font-medium text-xs tracking-widest uppercase mb-4">How it works</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-5">
                Three steps to the real thing.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                No middlemen. No algorithms. Direct from farmer to your table.
              </p>
            </motion.div>

            <div className="space-y-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === STEPS.length - 1;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className="relative flex gap-5"
                  >
                    {/* Badge + vertical connector */}
                    <div className="relative shrink-0">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 ring-1"
                        style={{
                          backgroundColor: 'hsl(var(--forest) / 0.06)',
                          borderColor: 'hsl(var(--forest) / 0.15)',
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color: 'hsl(var(--forest))' }} />
                      </div>
                      {!isLast && (
                        <div
                          className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-[calc(100%-1rem)]"
                          style={{ backgroundColor: 'hsl(var(--forest) / 0.12)' }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pt-1 pb-2">
                      <span className="font-semibold text-xs tracking-widest uppercase" style={{ color: 'hsl(var(--forest) / 0.5)' }}>
                        Step {step.number}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1.5 mb-2.5">{step.title}</h3>
                      <p className="text-gray-600 text-base leading-relaxed max-w-md">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
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
              initial={{ opacity: 0, scale: 0.92, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
              initial={{ opacity: 0, scale: 0.92, rotate: 8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 4 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
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
              initial={{ opacity: 0, scale: 0.85, rotate: 14 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 8 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
                <p className="text-gray-500 text-xs">Real families</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
