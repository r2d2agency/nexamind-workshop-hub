import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar } from "lucide-react";

const CTA_LINK = "https://tinyurl.com/workshopnexaminddho";

export const FinalCTASection = () => {
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
              <span>Tangará da Serra</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-border">
              <Calendar className="w-5 h-5 text-primary" />
              <span>12/03/2026 · 18h às 22h</span>
            </div>
          </div>

          <a 
            href={CTA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-flex items-center gap-3 text-primary-foreground pulse-glow text-xl px-10 py-5"
          >
            GARANTIR MINHA VAGA AGORA
            <ArrowRight className="w-6 h-6" />
          </a>

          <p className="text-muted-foreground mt-6">
            <span className="text-gradient-gold font-semibold">Lote 1:</span> De R$ 997 por apenas{" "}
            <span className="text-foreground font-bold">R$ 497</span> (50% OFF)
          </p>

          <p className="text-primary text-sm mt-4 font-medium">
            ⚡ Vagas Limitadas — Primeiro Lote Liberado
          </p>
        </motion.div>
      </div>
    </section>
  );
};
