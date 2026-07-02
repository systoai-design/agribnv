import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FeaturedFarmCard } from '@/components/landing/FeaturedFarmCard';
import { Property } from '@/types/database';

const GAP = 16;
const SWIPE_THRESHOLD = 45;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'; // symmetric ease-in-out — buttery, no expo hard-stop
const DURATION = 560;
const COPIES = 3; // [before | real | after] — enough to keep both sides filled while looping.

// Active slide expands; the rest stay shrunk. Widths scale with the viewport.
function slideWidths(containerW: number): { active: number; inactive: number } {
  if (containerW === 0) return { active: 0, inactive: 0 };
  if (containerW >= 1024) {
    return {
      active: Math.min(containerW * 0.56, 660),
      inactive: Math.min(Math.max(containerW * 0.17, 170), 230),
    };
  }
  if (containerW >= 640) {
    return { active: containerW * 0.64, inactive: containerW * 0.24 };
  }
  return { active: containerW * 0.82, inactive: containerW * 0.32 };
}

export function FeaturedFarmsSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const [transitionOn, setTransitionOn] = useState(false);
  const reduce = useReducedMotion();
  // Gate only the timing, never the width/position values, or the carousel stops working.
  const slide = (prop: 'transform' | 'width') => {
    if (!transitionOn) return 'none';
    // Under reduced motion keep an instant transform transition so the loop-rebase
    // transitionend still fires (the infinite carousel depends on that event); width can skip.
    if (reduce) return prop === 'transform' ? 'transform 1ms linear' : 'none';
    return `${prop} ${DURATION}ms ${EASE}`;
  };

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const draggedRef = useRef(false);

  const N = properties.length;
  const slides: Property[] = N > 0 ? Array.from({ length: COPIES * N }, (_, i) => properties[i % N]) : [];

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(*), experiences(*)')
        .eq('is_published', true)
        .limit(8);
      if (data && data.length > 0) {
        setProperties(data as Property[]);
        setActive(data.length); // start at the first slide of the middle copy
      }
      setIsLoading(false);
    }
    fetchFeatured();
  }, []);

  // Measure the viewport so slide widths and the track offset stay responsive.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Enable transitions once positioned; also re-enables after a no-transition rebase.
  useEffect(() => {
    if (!transitionOn && N > 0 && containerW > 0) {
      const id = requestAnimationFrame(() => setTransitionOn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [transitionOn, N, containerW]);

  const { active: activeW, inactive: inactiveW } = slideWidths(containerW);
  // Everything left of the active slide is shrunk, so the offset is exact.
  const trackOffset = active * (inactiveW + GAP);
  const logical = N > 0 ? (((active - N) % N) + N) % N : 0;
  const progressPct = N > 0 ? ((logical + 1) / N) * 100 : 0;

  // Seamlessly snap back into the middle copy after a loop crosses a boundary.
  const onTrackTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform' || N === 0) return;
    if (active < N) {
      setTransitionOn(false);
      setActive(active + N);
    } else if (active >= 2 * N) {
      setTransitionOn(false);
      setActive(active - N);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    draggedRef.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 8) {
      draggedRef.current = true;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (delta <= -SWIPE_THRESHOLD) setActive((a) => a + 1);
    else if (delta >= SWIPE_THRESHOLD) setActive((a) => a - 1);
    dragStartX.current = null;
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  };

  return (
    <section className="py-24 md:py-32 overflow-hidden" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-medium text-xs tracking-widest uppercase mb-3">Featured</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Farms you'll love.
            </h2>
          </motion.div>

          <Link
            to="/explore"
            className="group hidden md:inline-flex items-center gap-1.5 text-primary font-medium text-sm pb-1"
          >
            Explore all farms
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Variable-width looping track */}
        <div
          ref={viewportRef}
          className="overflow-hidden touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClickCapture={onClickCapture}
        >
          {isLoading ? (
            <div className="flex" style={{ gap: GAP }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[300px] sm:h-[380px] lg:h-[440px] rounded-[22px] bg-gray-200/60 animate-pulse shrink-0"
                  style={{ width: i === 0 ? '56%' : '20%' }}
                />
              ))}
            </div>
          ) : N > 0 ? (
            <div
              className="flex"
              style={{
                gap: GAP,
                transform: `translate3d(-${trackOffset}px, 0, 0)`,
                transition: slide('transform'),
              }}
              onTransitionEnd={onTrackTransitionEnd}
            >
              {slides.map((property, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={i}
                    className={`shrink-0 h-[300px] sm:h-[380px] lg:h-[440px] ${isActive ? '' : 'cursor-pointer'}`}
                    style={{
                      width: containerW === 0 ? undefined : isActive ? activeW : inactiveW,
                      transition: slide('width'),
                    }}
                    onClickCapture={(e) => {
                      // A peeking card focuses itself instead of navigating to a half-hidden farm.
                      if (!isActive) {
                        e.preventDefault();
                        e.stopPropagation();
                        setActive(i);
                      }
                    }}
                  >
                    <FeaturedFarmCard property={property} expanded={isActive} editorsPick={i % N === 0} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>Farm listings coming soon.</p>
            </div>
          )}
        </div>

        {/* Controls + progress bar */}
        {N > 0 && (
          <div className="flex items-center justify-between gap-6 mt-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActive((a) => a - 1)}
                aria-label="Previous farm"
                className="w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:bg-primary/5"
                style={{ borderColor: 'hsl(var(--forest) / 0.25)', color: 'hsl(var(--forest))' }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActive((a) => a + 1)}
                aria-label="Next farm"
                className="w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:bg-primary/5"
                style={{ borderColor: 'hsl(var(--forest) / 0.25)', color: 'hsl(var(--forest))' }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="ml-1 text-sm tabular-nums" style={{ color: 'hsl(var(--forest) / 0.6)' }}>
                <span className="font-semibold" style={{ color: 'hsl(var(--forest))' }}>
                  {String(logical + 1).padStart(2, '0')}
                </span>{' '}
                / {String(N).padStart(2, '0')}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 max-w-[280px] h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--forest) / 0.12)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: 'hsl(var(--forest))',
                  transition: reduce ? 'none' : `width ${DURATION}ms ${EASE}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Mobile see all */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center md:hidden"
        >
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm border border-primary/20 bg-primary/5 hover:bg-primary/10 px-6 py-3 rounded-full transition-colors"
          >
            Explore all farms <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
