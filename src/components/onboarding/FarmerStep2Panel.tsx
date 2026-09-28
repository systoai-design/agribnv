import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { haptics } from '@/core/platform';
import { FarmerStep2Data } from './types';

interface FarmerStep2PanelProps {
  initialData?: Partial<FarmerStep2Data>;
  onNext: (data: FarmerStep2Data) => void;
  onBack: () => void;
  onSkip: () => void;
}

const PREDEFINED_FARM_TYPES = [
  'Crop & Vegetable Farm',
  'Fruit Orchard & Plantation',
  'Poultry & Egg Farm',
  'Dairy & Cattle Farm',
  'Livestock & Swine Farm',
  'Coffee & Cacao Agroforestry',
  'Aquaculture & Fish Farm',
  'Beekeeping & Apiary',
  'Organic & Permaculture Farm',
  'Flower & Ornamental Nursery',
  'Mixed / Integrated Farm',
];

const PREDEFINED_FACILITIES = [
  'Restrooms & Toilets',
  'Parking Area',
  'Farm Store & Market',
  'Dining / Picnic Area',
  'Potable Drinking Water',
  'WiFi Access',
  'Campsite / Grounds',
  'Children\'s Play Area',
  'Function Hall / Gazebo',
  'Wheelchair Accessible',
  'Pet Friendly',
  'Solar Powered / Off-Grid',
];

export function FarmerStep2Panel({
  initialData,
  onNext,
  onBack,
  onSkip,
}: FarmerStep2PanelProps) {
  // Parse initial farm type
  const isInitialPredefined = initialData?.farmType
    ? PREDEFINED_FARM_TYPES.includes(initialData.farmType)
    : true;
  const initialType = initialData?.farmType
    ? isInitialPredefined
      ? initialData.farmType
      : 'other'
    : '';

  const [farmType, setFarmType] = useState<string>(initialType);
  const [customFarmType, setCustomFarmType] = useState<string>(
    initialData?.farmType && !isInitialPredefined ? initialData.farmType : ''
  );

  // Parse initial land area (strip non-digits except dot)
  const initialLand = initialData?.landArea
    ? initialData.landArea.replace(/[^0-9.]/g, '')
    : '';
  const [landArea, setLandArea] = useState<string>(initialLand);

  const [crops, setCrops] = useState<string>(initialData?.crops || '');
  const [livestock, setLivestock] = useState<string>(initialData?.livestock || '');

  // Facilities as array and controlled select value
  const [facilities, setFacilities] = useState<string[]>(
    Array.isArray(initialData?.facilities) ? initialData.facilities : []
  );
  const [selectedFacilityVal, setSelectedFacilityVal] = useState<string>('');

  const [storyAndTerroir, setStoryAndTerroir] = useState<string>(
    initialData?.storyAndTerroir || ''
  );

  const handleFacilitySelect = (value: string) => {
    if (!value) return;
    haptics.impact('light');
    if (!facilities.includes(value)) {
      setFacilities((prev) => [...prev, value]);
    }
    setSelectedFacilityVal('');
  };

  const handleRemoveFacility = (facilityToRemove: string) => {
    haptics.impact('light');
    setFacilities((prev) => prev.filter((f) => f !== facilityToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact('medium');

    const resolvedFarmType =
      farmType === 'other'
        ? customFarmType.trim() || 'Other'
        : farmType.trim();

    onNext({
      farmType: resolvedFarmType,
      landArea: landArea ? `${landArea} ha` : '',
      crops: crops.trim(),
      livestock: livestock.trim(),
      facilities,
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
            Specify what you cultivate, your farm size, and on-site amenities
          </p>
        </div>

        <div className="space-y-3">
          {/* Row 1: Farm Type Dropdown & Land Area Number Input */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Farm Type Dropdown */}
            <div className="space-y-1">
              <label htmlFor="farm-type-select" className="text-xs font-medium text-foreground px-1">
                Farm Type
              </label>
              <div className="relative">
                <select
                  id="farm-type-select"
                  value={farmType}
                  onChange={(e) => {
                    haptics.impact('light');
                    setFarmType(e.target.value);
                  }}
                  className="h-12 w-full appearance-none rounded-full border-2 border-border/80 focus:border-primary pl-4 pr-9 text-xs sm:text-sm bg-background shadow-2xs text-foreground cursor-pointer"
                >
                  <option value="">Select Farm Type</option>
                  {PREDEFINED_FARM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="other">Other (Specify)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
              </div>
            </div>

            {/* Land Area: Number only with default 'ha' unit */}
            <div className="space-y-1">
              <label htmlFor="farm-land" className="text-xs font-medium text-foreground px-1">
                Land Area
              </label>
              <div className="relative">
                <Input
                  id="farm-land"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="h-12 rounded-full border-2 border-border/80 focus:border-primary pl-4 pr-12 text-sm bg-background shadow-2xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                  ha
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Custom Farm Type Input if 'Other' is chosen */}
          {farmType === 'other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              <label htmlFor="custom-farm-type" className="text-xs font-medium text-primary px-1">
                Specify Other Farm Type
              </label>
              <Input
                id="custom-farm-type"
                value={customFarmType}
                onChange={(e) => setCustomFarmType(e.target.value)}
                placeholder="e.g. Mushroom farm, Herbal sanctuary"
                className="h-12 rounded-full border-2 border-primary/50 focus:border-primary px-4 text-xs sm:text-sm bg-background shadow-2xs"
                autoFocus
              />
            </motion.div>
          )}

          {/* Row 2: Primary Crops & Livestock */}
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

          {/* Row 3: Facilities & Amenities Dropdown with Predefined Choices */}
          <div className="space-y-1.5">
            <label htmlFor="facilities-select" className="text-xs font-medium text-foreground px-1">
              Facilities & Amenities
            </label>
            <div className="relative">
              <select
                id="facilities-select"
                value={selectedFacilityVal}
                onChange={(e) => handleFacilitySelect(e.target.value)}
                className="h-12 w-full appearance-none rounded-full border-2 border-border/80 focus:border-primary pl-4 pr-9 text-xs sm:text-sm bg-background shadow-2xs text-foreground cursor-pointer"
              >
                <option value="" disabled>+ Add facilities & amenities...</option>
                {PREDEFINED_FACILITIES.map((facility) => {
                  const isSelected = facilities.includes(facility);
                  return (
                    <option key={facility} value={facility} disabled={isSelected}>
                      {facility} {isSelected ? '✓ (Added)' : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            </div>

            {/* Selected Facilities Tag Pills */}
            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto px-1">
                {facilities.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <span>{facility}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(facility)}
                      className="hover:text-destructive p-0.5 rounded-full transition-colors cursor-pointer"
                      aria-label={`Remove ${facility}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Farm Story & Terroir Notes Textarea */}
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
