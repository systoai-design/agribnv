import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { camera, haptics } from '@/core/platform';
import { cn } from '@/lib/utils';
import { FarmerStep3Data } from './types';

interface FarmerStep3PanelProps {
  initialData?: Partial<FarmerStep3Data>;
  onComplete: (data: FarmerStep3Data) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function FarmerStep3Panel({
  initialData,
  onComplete,
  onBack,
  onSkip,
  isLoading,
}: FarmerStep3PanelProps) {
  const [farmerBio, setFarmerBio] = useState(initialData?.farmerBio || '');
  const [farmDescription, setFarmDescription] = useState(initialData?.farmDescription || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialData?.avatarUrl);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(initialData?.coverImageUrl);

  const handlePickAvatar = async () => {
    haptics.impact('light');
    try {
      const photo = await camera.getPhoto({ source: 'prompt', quality: 90 });
      if (photo?.webPath || photo?.dataUrl) {
        setAvatarUrl(photo.webPath || photo.dataUrl);
        haptics.notification('success');
      }
    } catch (err) {
      console.warn('Failed to pick avatar:', err);
    }
  };

  const handlePickCover = async () => {
    haptics.impact('light');
    try {
      const photo = await camera.getPhoto({ source: 'prompt', quality: 90 });
      if (photo?.webPath || photo?.dataUrl) {
        setCoverImageUrl(photo.webPath || photo.dataUrl);
        haptics.notification('success');
      }
    } catch (err) {
      console.warn('Failed to pick cover image:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact('medium');
    onComplete({
      farmerBio: farmerBio.trim(),
      farmDescription: farmDescription.trim(),
      avatarUrl,
      coverImageUrl,
    });
  };

  return (
    <motion.div
      key="farmer-step-3-panel"
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
            Descriptions & Visual Identity
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[300px] mx-auto leading-relaxed">
            Introduce yourself and showcase your farmland with high-res photos
          </p>
        </div>

        {/* 2 Stacked Cards matching User Write-in and Wireframe */}
        <div className="space-y-3">
          {/* Card 1: Description for the Farmer */}
          <div className="space-y-1">
            <label htmlFor="farmer-bio" className="text-xs font-medium text-foreground px-1">
              About the Farmer
            </label>
            <Textarea
              id="farmer-bio"
              value={farmerBio}
              onChange={(e) => setFarmerBio(e.target.value)}
              placeholder="Tell visitors about yourself — your farming journey, personal mission, and background..."
              rows={2}
              className="rounded-2xl border-2 border-border/80 focus:border-primary p-3.5 text-xs sm:text-sm bg-background resize-none shadow-2xs"
            />
          </div>

          {/* Card 2: Description for the Farm itself */}
          <div className="space-y-1">
            <label htmlFor="farm-desc" className="text-xs font-medium text-foreground px-1">
              About the Farm
            </label>
            <Textarea
              id="farm-desc"
              value={farmDescription}
              onChange={(e) => setFarmDescription(e.target.value)}
              placeholder="Highlight what makes this farmland special — natural views, soil, river/spring, and ambiance..."
              rows={2}
              className="rounded-2xl border-2 border-border/80 focus:border-primary p-3.5 text-xs sm:text-sm bg-background resize-none shadow-2xs"
            />
          </div>
        </div>

        {/* Thin Divider Line matching Wireframe */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border/70" />
          <span className="shrink-0 mx-3 text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-wider">
            Media & Photos
          </span>
          <div className="flex-grow border-t border-border/70" />
        </div>

        {/* Visual Media Upload Area matching Wireframe (Circle + Mountain/Sun Rectangle) */}
        <div className="flex items-center gap-3">
          {/* Small Circle: Farmer Profile Photo */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handlePickAvatar}
              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer"
              aria-label="Upload Farmer Photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Farmer Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-primary/70">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-semibold uppercase">Profile</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full shadow">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </button>
            <span className="text-[10px] text-muted-foreground mt-1">Profile Photo</span>
          </div>

          {/* Large Landscape Card: Farm Cover Photo with Mountain/Sun Placeholder matching Wireframe */}
          <div className="flex-1 flex flex-col">
            <button
              type="button"
              onClick={handlePickCover}
              className="relative h-20 sm:h-22 w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer"
              aria-label="Upload Farm Cover Photo"
            >
              {coverImageUrl ? (
                <img src={coverImageUrl} alt="Farm Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary/70 group-hover:text-primary">
                  {/* Stylized Sun/Mountain motif placeholder from wireframe */}
                  <div className="relative w-12 h-7 flex items-center justify-center mb-0.5">
                    <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-[#E09F5A]/80 shadow-xs" />
                    <svg viewBox="0 0 40 24" className="w-10 h-6 text-[#2E5A3E]" fill="currentColor">
                      <polygon points="20,2 38,22 2,22" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide text-foreground/80">
                    Upload Cover Banner
                  </span>
                </div>
              )}
              <div className="absolute top-1.5 right-1.5 bg-primary text-white p-1 rounded-full shadow-sm">
                <ImageIcon className="w-2.5 h-2.5" />
              </div>
            </button>
            <span className="text-[10px] text-muted-foreground mt-1 px-1">Farm Cover Banner</span>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-3 pb-1">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-base font-semibold bg-[#1E3A2B] hover:bg-[#274B38] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F2C078]" />
                <span>Complete & Launch Farm Profile</span>
              </>
            )}
          </Button>

          <div className="text-center mt-2.5">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Skip and go to Host Dashboard
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
