import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { SpeakersSection } from "@/components/SpeakersSection";
import { TargetSection } from "@/components/TargetSection";
import { PricingSection } from "@/components/PricingSection";
import { AboutSection } from "@/components/AboutSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <BenefitsSection />
      <SpeakersSection />
      <TargetSection />
      <PricingSection />
      <AboutSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
