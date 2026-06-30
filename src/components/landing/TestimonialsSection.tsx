import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Voice = 'host' | 'traveler';

interface Testimonial {
  id: string;
  type: Voice;
  quote: string;
  name: string;
  role: string;
  photoId: string;
}

// Larger portrait crop for the carousel cards.
const PORTRAIT = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&h=800&q=80&auto=format&fit=crop&crop=faces`;

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    type: 'host',
    quote:
      'Before Agribnv, my mango farm only earned during harvest season. Now I host travelers every week — and my kids moved back from Manila to help run it.',
    name: 'Mang Rodrigo',
    role: 'Mango Heritage Farm · Guimaras',
    photoId: 'photo-1545167622-3a6ac756afa4',
  },
  {
    id: 't2',
    type: 'traveler',
    quote:
      'We drove past a hundred resorts to find a real farm. Three days picking mangoes and cooking kare-kare with the family — nothing else compares.',
    name: 'Sarah & Marco',
    role: 'Travelers · Metro Manila',
    photoId: 'photo-1544005313-94ddf0286df2',
  },
  {
    id: 't3',
    type: 'host',
    quote:
      'The platform handles the bookings and the payments. I just focus on welcoming guests and sharing what we grow on the mountain.',
    name: 'Aling Cora',
    role: 'Highland Vegetable Farm · Benguet',
    photoId: 'photo-1494790108377-be9c29b29330',
  },
  {
    id: 't4',
    type: 'traveler',
    quote:
      'Seamless booking, a host who actually replied, and the most genuine trip I have taken. This is exactly what Philippine tourism needs.',
    name: 'James T.',
    role: 'Traveler · Booked 4 times',
    photoId: 'photo-1507003211169-0a1dd7228f2d',
  },
];

const N = TESTIMONIALS.length; // assumes N >= 3 so prev/active/next are always distinct
const VOICE_LABEL: Record<Voice, string> = { host: 'Host', traveler: 'Traveler' };
const EASE = [0.16, 1, 0.3, 1] as const;
const PEEK = 46; // % of card width to shift each neighbor; tucks them behind the active card's edges
const NEIGHBOR_SCALE = 0.72;
const NEIGHBOR_OPACITY = 0.34;
const RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--forest))]';

type Slot = 'prev' | 'active' | 'next';

function slotStyle(slot: Slot, reduce: boolean): React.CSSProperties {
  const isActive = slot === 'active';
  const xShift =
    slot === 'prev' ? `calc(-50% - ${PEEK}%)` : slot === 'next' ? `calc(-50% + ${PEEK}%)` : '-50%';
  const scale = isActive ? 1 : NEIGHBOR_SCALE;
  return {
    transform: `translate(${xShift}, -50%) scale(${scale})`,
    opacity: isActive ? 1 : NEIGHBOR_OPACITY,
    zIndex: isActive ? 30 : 10,
    boxShadow: isActive ? '0 30px 60px -20px hsl(var(--forest) / 0.45)' : 'none',
    transition: reduce
      ? undefined
      : 'transform 560ms cubic-bezier(0.16,1,0.3,1), opacity 560ms cubic-bezier(0.16,1,0.3,1)',
  };
}

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion() ?? false;

  const prev = (active - 1 + N) % N;
  const next = (active + 1) % N;
  const t = TESTIMONIALS[active];

  const go = (d: number) => {
    setDir(d);
    setActive((a) => (a + d + N) % N);
  };
  const jump = (i: number) => {
    if (i === active) return;
    setDir(i > active ? 1 : -1);
    setActive(i);
  };

  const slots: { slot: Slot; i: number }[] = [
    { slot: 'prev', i: prev },
    { slot: 'active', i: active },
    { slot: 'next', i: next },
  ];

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="testimonials-heading"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #ffffff 52%, hsl(var(--cream)) 66%, hsl(var(--forest-light)) 88%, hsl(var(--forest-dark)) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-36 pb-40 md:pb-52">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">
          {/* CAPTION — authored first so keyboard/SR reads it before the carousel controls on mobile */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-primary font-medium text-xs tracking-widest uppercase mb-5">Testimonials</p>
              <h2
                id="testimonials-heading"
                className="font-serif text-5xl md:text-6xl font-bold leading-[1.05] text-gray-900"
              >
                From our
                <br />
                <span style={{ color: 'hsl(var(--forest))' }}>community.</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mt-6 max-w-md">
                The hosts who open their farms and the travelers who visit them — in their own words.
              </p>
            </motion.div>

            {/* Single concise live announcement (kept out of the animated block to avoid fragmented reads) */}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {`${VOICE_LABEL[t.type]} testimonial from ${t.name}: ${t.quote}`}
            </p>

            {/* Rotating caption — synced to the centered portrait */}
            <div className="relative mt-10 min-h-[300px] md:min-h-[330px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={active}
                  custom={dir}
                  initial={{ opacity: 0, x: reduce ? 0 : dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduce ? 0 : dir * -40 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-5"
                    style={
                      t.type === 'host'
                        ? { backgroundColor: 'hsl(var(--forest) / 0.1)', color: 'hsl(var(--forest))' }
                        : { backgroundColor: 'hsl(var(--sage) / 0.25)', color: 'hsl(146 60% 22%)' }
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: t.type === 'host' ? 'hsl(var(--forest))' : 'hsl(var(--sage-dark))' }}
                    />
                    {VOICE_LABEL[t.type]}
                  </span>

                  <blockquote className="font-serif text-2xl md:text-[2.1rem] leading-[1.22] text-gray-900 font-medium">
                    {t.quote}
                  </blockquote>

                  <div className="mt-7">
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* LEFT — portrait carousel */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Stage — exactly three slot layers, big sharp center + two small faded sides */}
            <div className="relative mx-auto w-full h-[380px] sm:h-[440px] lg:h-[500px]">
              {slots.map(({ slot, i }) => {
                const person = TESTIMONIALS[i];
                const isActive = slot === 'active';
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => !isActive && jump(i)}
                    tabIndex={isActive ? -1 : 0}
                    aria-disabled={isActive}
                    aria-label={isActive ? `Current: ${person.name}` : `Show testimonial from ${person.name}`}
                    className={`absolute top-1/2 left-1/2 w-[64%] sm:w-[58%] max-w-[340px] aspect-[3/4] rounded-[28px] overflow-hidden ring-1 ring-black/5 ${RING}`}
                    style={{ ...slotStyle(slot, reduce), cursor: isActive ? 'default' : 'pointer' }}
                  >
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={person.id}
                        src={PORTRAIT(person.photoId)}
                        alt={person.name}
                        width={600}
                        height={800}
                        loading="lazy"
                        initial={{ opacity: 0, scale: reduce ? 1 : 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    {/* legibility floor on the active card */}
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Controls — arrows + pill-grow dots */}
            <div className="flex items-center justify-center gap-5 mt-10">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all hover:bg-primary/5 ${RING}`}
                style={{ borderColor: 'hsl(var(--forest) / 0.25)', color: 'hsl(var(--forest))' }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center">
                {TESTIMONIALS.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => jump(i)}
                    aria-label={`Go to testimonial ${i + 1}: ${p.name}`}
                    aria-current={i === active}
                    className="px-2 py-[18px] group focus-visible:outline-none"
                  >
                    <span
                      className="block h-2 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-[hsl(var(--forest))]"
                      style={{
                        width: i === active ? 26 : 8,
                        backgroundColor: i === active ? 'hsl(var(--forest))' : 'hsl(var(--forest) / 0.25)',
                      }}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all hover:bg-primary/5 ${RING}`}
                style={{ borderColor: 'hsl(var(--forest) / 0.25)', color: 'hsl(var(--forest))' }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
