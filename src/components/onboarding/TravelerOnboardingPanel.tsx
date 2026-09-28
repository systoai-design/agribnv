import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Home,
  Utensils,
  Compass,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { camera, haptics } from '@/core/platform';
import { cn } from '@/lib/utils';
import { TravelerOnboardingData } from './types';

interface TravelerOnboardingPanelProps {
  initialData?: Partial<TravelerOnboardingData>;
  onComplete: (data: TravelerOnboardingData) => void;
  onSkip: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const INTEREST_OPTIONS = [
  { id: 'stays', label: 'Farm Stays', icon: Home },
  { id: 'experiences', label: 'Farm Experiences', icon: Compass },
  { id: 'dining', label: 'Farm Dining', icon: Utensils },
  { id: 'products', label: 'Farm Products', icon: ShoppingBag },
];

export function TravelerOnboardingPanel({
  initialData,
  onComplete,
  onSkip,
  onBack,
  isLoading,
}: TravelerOnboardingPanelProps) {
  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialData?.avatarUrl);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData?.interests || ['stays', 'experiences']
  );

  const toggleInterest = (id: string) => {
    haptics.impact('light');
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact('medium');
    onComplete({
      displayName: displayName.trim() || 'UMANI Explorer',
      bio: bio.trim(),
      avatarUrl,
      interests: selectedInterests,
    });
  };

  return (
    <motion.div
      key="traveler-onboarding-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-between h-full py-0"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-3.5 my-auto">
        {/* Title and Subtitle matching Wireframe */}
        <div className="text-center pt-0">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
            Personalize Your Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[300px] mx-auto leading-relaxed">
            Set up your traveler profile for curated farm recommendations
          </p>
        </div>

        {/* Central Circular Avatar Upload matching Wireframe */}
        <div className="flex flex-col items-center justify-center my-0.5">
          <button
            type="button"
            onClick={handlePickAvatar}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer"
            aria-label="Upload Profile Photo"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-primary/70 group-hover:text-primary">
                <Camera className="w-6 h-6 mb-0.5" />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Photo</span>
              </div>
            )}
          </button>
          <span className="text-[10px] text-muted-foreground mt-1">Tap to choose profile picture</span>
        </div>

        {/* Display Name Pill Input */}
        <div className="space-y-1">
          <label htmlFor="traveler-name" className="text-xs font-medium text-foreground px-1">
            Display Name
          </label>
          <Input
            id="traveler-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should farmers call you?"
            className="h-12 rounded-full border-2 border-border/80 focus:border-primary px-5 text-sm bg-background shadow-2xs"
          />
        </div>

        {/* Bio / Travel Style Card */}
        <div className="space-y-1">
          <label htmlFor="traveler-bio" className="text-xs font-medium text-foreground px-1">
            About You & Travel Style
          </label>
          <Textarea
            id="traveler-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share a bit about your travel interests (e.g. coffee enthusiast, organic lover, weekend family explorer)..."
            rows={2}
            className="rounded-2xl border-2 border-border/80 focus:border-primary p-3.5 text-xs sm:text-sm bg-background resize-none shadow-2xs"
          />
        </div>

        {/* 2x3 Grid of Interest Pills matching Wireframe Dropdown Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-foreground">Select Your Farm Interests</span>
            <span className="text-[10px] text-muted-foreground">Select all that apply</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-full border text-xs font-medium transition-all shadow-2xs cursor-pointer text-left",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border/80 bg-background text-foreground/80 hover:bg-muted/40"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-white" : "text-primary")} />
                  <span className="truncate flex-1">{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
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
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <div className="text-center mt-2.5">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Skip for now, take me to explore
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
