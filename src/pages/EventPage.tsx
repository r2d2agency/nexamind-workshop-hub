import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePageTracking } from "@/hooks/usePageTracking";
import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { SpeakersSection } from "@/components/SpeakersSection";
import { TargetSection } from "@/components/TargetSection";
import { PricingSection } from "@/components/PricingSection";
import { AboutSection } from "@/components/AboutSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";
import NotFound from "./NotFound";

export interface EventData {
  id: number;
  slug: string;
  name: string;
  location: string;
  address: string;
  date: string;
  time_start: string;
  time_end: string;
  price_cents: number;
  original_price_cents: number;
  installments: number;
  current_batch: number;
  batch_end_date: string;
  max_capacity: number;
  current_capacity: number;
  cta_text: string;
  cta_link: string;
  hero_title: string;
  hero_subtitle: string;
}

const EventPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Track page view
  usePageTracking(slug);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.leads.getEvent(slug!),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection eventData={event} />
      <BenefitsSection />
      <SpeakersSection />
      <TargetSection />
      <PricingSection eventData={event} />
      <AboutSection />
      <FinalCTASection eventData={event} />
      <Footer />
    </div>
  );
};

export default EventPage;
