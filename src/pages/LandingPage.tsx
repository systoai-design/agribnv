import { Layout } from '@/components/layout/Layout';
import { Footer } from '@/components/layout/Footer';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ImpactStatsSection } from '@/components/landing/ImpactStatsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturedFarmsSection } from '@/components/landing/FeaturedFarmsSection';
import { PhilosophySection } from '@/components/landing/PhilosophySection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <Layout hideNav={true}>
      <LandingNav />
      <HeroSection />
      <ImpactStatsSection />
      <HowItWorksSection />
      <FeaturedFarmsSection />
      <PhilosophySection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </Layout>
  );
}
