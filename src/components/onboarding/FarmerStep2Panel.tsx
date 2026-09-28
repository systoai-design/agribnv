import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Home, Compass, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { haptics } from '@/core/platform';
import { cn } from '@/lib/utils';
import { FarmerStep2Data } from './types';

interface FarmerStep2PanelProps {
  initialData?: Partial<FarmerStep2Data>;
  onNext: (data: FarmerStep2Data) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function FarmerStep2Panel({
  initialData,
  onNext,
  onBack,
  onSkip,
}: FarmerStep2PanelProps) {
  const [farmType, setFarmType] = useState(initialData?.farmType || '');
  const [landArea, setLandArea] = useState(initialData?.landArea || '');
  const [crops, setCrops] = useState(initialData?.crops || '');
  const [livestock, setLivestock] = useState(initialData?.livestock || '');
  const [facilities, setFacilities] = useState(initialData?.facilities || '');
  const [offersStays, setOffersStays] = useState(initialData?.offersStays ?? true);
  const [offersTours, setOffersTours] = useState(initialData?.offersTours ?? true);
  const [storyAndTerroir, setStoryAndTerroir] = useState(initialData?.storyAndTerroir || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact('medium');
    onNext({
      farmType: farmType.trim(),
      landArea: landArea.trim(),
      crops: crops.trim(),
      livestock: livestock.trim(),
      facilities: facilities.trim(),
      offersStays,
      offersTours,
      storyAndTerroir: storyAndTerroir.trim(),
    });
  };

  return (
    <motion.div
      key="farmer-step-2-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-between h-full py-0"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-3.5 my-auto">
        {/* Title and Subtitle */}
        <div className="text-center pt-0 mb-1">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
            Agricultural Profile & Terroir
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[300px] mx-auto leading-relaxed">
            Specify what you cultivate, your farm size, and visitor offerings
          </p>
        </div>

        <div className="space-y-3">
          {/* Row 1: 2 Split Inputs matching Wireframe */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label htmlFor="farm-type" className="text-xs font-medium text-foreground px-1">
                Farm Type
              </label>
              <Input
                id="farm-type"
                value={farmType}
                onChange={(e) => setFarmType(e.target.value)}
                placeholder="e.g. Organic / Agroforestry"
                className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-4 text-sm bg-background shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="farm-land" className="text-xs font-medium text-foreground px-1">
                Land Area
              </label>
              <Input
                id="farm-land"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="e.g. 3.5 Hectares"
                className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-4 text-sm bg-background shadow-2xs"
              />
            </div>
          </div>

          {/* Row 2: 2 Split Inputs matching Wireframe */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label htmlFor="farm-crops" className="text-xs font-medium text-foreground px-1">
                Primary Crops
              </label>
              <Input
                id="farm-crops"
                value={crops}
                onChange={(e) => setCrops(e.target.value)}
                placeholder="e.g. Coffee, Berries"
                className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-4 text-sm bg-background shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="farm-livestock" className="text-xs font-medium text-foreground px-1">
                Livestock / Animals
              </label>
              <Input
                id="farm-livestock"
                value={livestock}
                onChange={(e) => setLivestock(e.target.value)}
                placeholder="e.g. Bees, Poultry"
                className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-4 text-sm bg-background shadow-2xs"
              />
            </div>
          </div>

          {/* Row 3: 1 Full-Width Input matching Wireframe */}
          <div className="space-y-1">
            <label htmlFor="farm-facilities" className="text-xs font-medium text-foreground px-1">
              Facilities & Amenities
            </label>
            <Input
              id="farm-facilities"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              placeholder="e.g. Restrooms, Parking, WiFi, Farm Store"
              className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-5 text-sm bg-background shadow-2xs"
            />
          </div>
        </div>

        {/* Thin Divider Line matching Wireframe */}
        <div className="relative flex py-1.5 items-center">
          <div className="flex-grow border-t border-border/70" />
          <span className="shrink-0 mx-3 text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-wider">
            Visitor Offerings
          </span>
          <div className="flex-grow border-t border-border/70" />
        </div>

        {/* 2 Split Offering Toggle Buttons matching Wireframe */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              haptics.impact('light');
              setOffersStays(!offersStays);
            }}
            className={cn(
              "flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all shadow-2xs cursor-pointer",
              offersStays
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border/80 bg-background text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Farm Stays</span>
            </div>
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", offersStays ? "bg-primary border-primary text-white" : "border-border")}>
              {offersStays && <Check className="w-3 h-3" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.impact('light');
              setOffersTours(!offersTours);
            }}
            className={cn(
              "flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all shadow-2xs cursor-pointer",
              offersTours
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border/80 bg-background text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Day Tours</span>
            </div>
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", offersTours ? "bg-primary border-primary text-white" : "border-border")}>
              {offersTours && <Check className="w-3 h-3" />}
            </div>
          </button>
        </div>

        {/* Large Card Textarea matching Wireframe */}
        <div className="space-y-1">
          <label htmlFor="farm-story" className="text-xs font-medium text-foreground px-1">
            Farm Story & Terroir Notes
          </label>
          <Textarea
            id="farm-story"
            value={storyAndTerroir}
            onChange={(e) => setStoryAndTerroir(e.target.value)}
            placeholder="Tell travelers what makes your land unique — soil composition, altitude, water source, and your family's farming heritage..."
            rows={3}
            className="rounded-2xl border-2 border-border/80 focus:border-primary p-3.5 text-xs sm:text-sm bg-background resize-none shadow-2xs"
          />
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-3 pb-1">
          <Button
            type="submit"
            className="w-full h-14 rounded-full text-base font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Step 3</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center mt-2.5">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Skip setup for now
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
