import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SampleProduct } from '@/types/product';

interface ProductCardProps {
  product: SampleProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group relative h-full flex flex-col"
    >
      <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-md transition-shadow flex flex-col flex-1">
        {/* Image area: gradient + emoji */}
        <div
          className={cn(
            'aspect-square flex items-center justify-center relative bg-gradient-to-br shrink-0',
            product.gradient
          )}
        >
          <span className="text-6xl md:text-7xl drop-shadow-sm select-none">
            {product.emoji}
          </span>
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Soon
          </span>
        </div>

        {/* Body */}
        <div className="p-3 md:p-4 flex flex-col flex-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-sm md:text-base leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1 mb-2 mt-auto">
            <span className="font-bold text-base md:text-lg text-foreground">
              ₱{product.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.unit}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{product.farm}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
