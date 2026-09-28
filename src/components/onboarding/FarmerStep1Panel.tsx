import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { haptics } from '@/core/platform';
import { FarmerStep1Data } from './types';

interface FarmerStep1PanelProps {
  initialData?: Partial<FarmerStep1Data>;
  onNext: (data: FarmerStep1Data) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function FarmerStep1Panel({
  initialData,
  onNext,
  onBack,
  onSkip,
}: FarmerStep1PanelProps) {
  const [farmName, setFarmName] = useState(initialData?.farmName || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [municipality, setMunicipality] = useState(initialData?.municipality || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [region, setRegion] = useState(initialData?.region || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) {
      haptics.notification('error');
      setError('Please provide your farm name.');
      return;
    }
    setError(null);
    haptics.impact('medium');
    onNext({
      farmName: farmName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      municipality: municipality.trim(),
      province: province.trim(),
      region: region.trim(),
    });
  };

  return (
    <motion.div
      key="farmer-step-1-panel"
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
            Farm Identity & Location
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[300px] mx-auto leading-relaxed">
            Enter the basic profile details and address of your farmland
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Stack of 3 Full-Width Inputs matching Wireframe */}
        <div className="space-y-3">
          {/* 1. Farm Name */}
          <div className="space-y-1">
            <label htmlFor="farm-name" className="text-xs font-medium text-foreground px-1">
              Farm Name *
            </label>
            <Input
              id="farm-name"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Green Valley Organic Farmland"
              className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-5 text-sm bg-background shadow-2xs"
            />
          </div>

          {/* 2. Farm Tagline */}
          <div className="space-y-1">
            <label htmlFor="farm-tagline" className="text-xs font-medium text-foreground px-1">
              Tagline / Short Description
            </label>
            <Input
              id="farm-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Heirloom Robusta Coffee & Citrus Farm"
              className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-5 text-sm bg-background shadow-2xs"
            />
          </div>

          {/* 3. Street / Sitio / Barangay Address */}
          <div className="space-y-1">
            <label htmlFor="farm-address" className="text-xs font-medium text-foreground px-1">
              Street / Sitio / Barangay
            </label>
            <Input
              id="farm-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sitio Balangay, Brgy. Camp 4"
              className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-5 text-sm bg-background shadow-2xs"
            />
          </div>
        </div>

        {/* Thin Divider Line matching Wireframe */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/70" />
          <span className="shrink-0 mx-3 text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-wider">
            Jurisdiction
          </span>
          <div className="flex-grow border-t border-border/70" />
        </div>

        {/* Row 4: 2 Side-by-Side Inputs matching Wireframe */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label htmlFor="farm-muni" className="text-xs font-medium text-foreground px-1">
              Municipality / City
            </label>
            <Input
              id="farm-muni"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="e.g. Tuba"
              className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-4 text-sm bg-background shadow-2xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="farm-prov" className="text-xs font-medium text-foreground px-1">
              Province
            </label>
            <Input
              id="farm-prov"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="e.g. Benguet"
              className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-4 text-sm bg-background shadow-2xs"
            />
          </div>
        </div>

        {/* Row 5: 1 Full-Width Input matching Wireframe */}
        <div className="space-y-1">
          <label htmlFor="farm-reg" className="text-xs font-medium text-foreground px-1">
            Region
          </label>
          <Input
            id="farm-reg"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Cordillera Administrative Region (CAR)"
            className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-5 text-sm bg-background shadow-2xs"
          />
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-3 pb-1">
          <Button
            type="submit"
            className="w-full h-14 rounded-full text-base font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Step 2</span>
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
