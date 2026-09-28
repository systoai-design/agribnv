import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPhRegions, getPhProvinces, getPhMunicipalities } from '@/shared/data/phLocations';
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

  const regions = useMemo(() => getPhRegions(), []);

  const selectedRegionObj = useMemo(() => {
    return regions.find((r) => r.label === region || r.value === region);
  }, [regions, region]);

  const provinces = useMemo(() => {
    return getPhProvinces(selectedRegionObj?.code);
  }, [selectedRegionObj]);

  const selectedProvinceObj = useMemo(() => {
    return provinces.find((p) => p.value === province || p.label === province);
  }, [provinces, province]);

  const municipalities = useMemo(() => {
    return getPhMunicipalities(selectedProvinceObj?.code || selectedProvinceObj?.value, selectedRegionObj?.code);
  }, [selectedProvinceObj, selectedRegionObj]);

  const handleSelectProvince = (provName: string) => {
    haptics.impact('light');
    setProvince(provName);
    setMunicipality('');
    // Auto-populate Region from province if not explicitly set
    if (provName) {
      const match = provinces.find((p) => p.value === provName || p.label === provName);
      if (match?.regionCode) {
        const foundReg = regions.find((r) => r.code === match.regionCode);
        if (foundReg) {
          setRegion(foundReg.label);
        }
      }
    }
  };

  const handleSelectMunicipality = (muniName: string) => {
    haptics.impact('light');
    setMunicipality(muniName);
  };

  const handleSelectRegion = (regName: string) => {
    haptics.impact('light');
    setRegion(regName);
    // Reset province & city if region changed and province doesn't match
    if (selectedProvinceObj && selectedProvinceObj.regionCode !== selectedRegionObj?.code) {
      setProvince('');
      setMunicipality('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) {
      setError('Farm Name is required.');
      haptics.notification('error');
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

        {/* Row 4: 2 Side-by-Side Dropdowns (Municipality & Province) matching Wireframe */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Municipality / City Dropdown */}
          <div className="space-y-1">
            <label htmlFor="muni-select" className="text-xs font-medium text-foreground px-1">
              City / Municipality
            </label>
            <div className="relative">
              <select
                id="muni-select"
                value={municipality}
                onChange={(e) => handleSelectMunicipality(e.target.value)}
                disabled={municipalities.length === 0}
                className="h-12 w-full appearance-none rounded-full border-2 border-border/80 focus:border-primary pl-4 pr-9 text-xs sm:text-sm bg-background shadow-2xs text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled={Boolean(province)}>
                  {province ? 'Select City/Town' : 'Pick Province 1st'}
                </option>
                {municipalities.map((m) => (
                  <option key={m.code || m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            </div>
          </div>

          {/* Province Dropdown */}
          <div className="space-y-1">
            <label htmlFor="prov-select" className="text-xs font-medium text-foreground px-1">
              Province
            </label>
            <div className="relative">
              <select
                id="prov-select"
                value={province}
                onChange={(e) => handleSelectProvince(e.target.value)}
                className="h-12 w-full appearance-none rounded-full border-2 border-border/80 focus:border-primary pl-4 pr-9 text-xs sm:text-sm bg-background shadow-2xs text-foreground cursor-pointer"
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.code || p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            </div>
          </div>
        </div>

        {/* Row 5: 1 Full-Width Region Dropdown matching Wireframe */}
        <div className="space-y-1">
          <label htmlFor="region-select" className="text-xs font-medium text-foreground px-1">
            Region
          </label>
          <div className="relative">
            <select
              id="region-select"
              value={region}
              onChange={(e) => handleSelectRegion(e.target.value)}
              className="h-12 w-full appearance-none rounded-full border-2 border-border/80 focus:border-primary pl-4 pr-9 text-xs sm:text-sm bg-background shadow-2xs text-foreground cursor-pointer"
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r.code || r.value} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
          </div>
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
