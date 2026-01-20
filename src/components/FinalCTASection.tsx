import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { EventData } from "@/pages/EventPage";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const DEFAULT_CTA_LINK = "https://tinyurl.com/workshopnexaminddho";

interface FinalCTASectionProps {
  eventData?: EventData;
}

export const FinalCTASection = ({ eventData }: FinalCTASectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = eventData?.location || "Tangará da Serra";
  // Strip time from ISO dates to avoid timezone shifting (showing previous day in Brasília)
  const eventDateOnly = eventData?.date ? eventData.date.split("T")[0] : undefined;
  const eventDate = eventDateOnly ? parseISO(eventDateOnly) : new Date("2026-03-12");
  const formattedDate = format(eventDate, "dd/MM/yyyy", { locale: ptBR });
  const timeStart = eventData?.time_start || "18h";
  const timeEnd = eventData?.time_end || "22h";
  const ctaLink = eventData?.cta_link || DEFAULT_CTA_LINK;
  const priceCents = eventData?.price_cents || 49700;
  const originalPriceCents = eventData?.original_price_cents || 99700;
  const price = (priceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  const originalPrice = (originalPriceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  const discount = Math.round((1 - priceCents / originalPriceCents) * 100);
  const currentBatch = eventData?.current_batch || 1;
  const eventSlug = eventData?.slug;

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, hsl(174 60% 30% / 0.3) 0%, transparent 60%)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto Para <span className="text-gradient-gold">Transformar</span> Seu Negócio?
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Se você busca reduzir a rotatividade, aumentar a produtividade, tornar suas 
            decisões mais assertivas e construir uma cultura organizacional forte — 
            <strong className="text-foreground"> este workshop é para você.</strong>
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 text-muted-foreground">
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-border">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-border">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{formattedDate} · {timeStart} às {timeEnd}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-cta inline-flex items-center gap-3 text-primary-foreground pulse-glow text-xl px-10 py-5"
          >
            GARANTIR MINHA VAGA AGORA
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-muted-foreground mt-6">
            <span className="text-gradient-gold font-semibold">Lote {currentBatch}:</span> De R$ {originalPrice} por apenas{" "}
            <span className="text-foreground font-bold">R$ {price}</span> ({discount}% OFF)
          </p>

          <p className="text-primary text-sm mt-4 font-medium">
            ⚡ Vagas Limitadas — Lote {currentBatch} Liberado
          </p>
        </motion.div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        eventSlug={eventSlug}
        onSuccess={() => {
          window.open(ctaLink, "_blank");
        }}
      />
    </section>
  );
};
