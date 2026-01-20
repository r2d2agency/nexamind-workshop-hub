import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

const CTA_LINK = "https://tinyurl.com/workshopnexaminddho";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, hsl(174 60% 30% / 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(40 80% 40% / 0.15) 0%, transparent 50%)'
        }}
      />
      
      {/* Floating promo badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-20"
      >
        <div className="badge-promo floating-badge">
          <span className="text-xs md:text-sm">🔥 50% OFF</span>
          <span className="text-xs md:text-sm font-bold">LOTE 1</span>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-sm mb-4"
          >
            Workshop Exclusivo · 12/03/2026
          </motion.p>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-foreground">Business</span>
            <br />
            <span className="text-gradient-primary">MindShift</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gradient-gold font-semibold mb-6"
          >
            Workshop Negócios Lucrativos
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Descubra como <strong className="text-foreground">comportamento, clima e cultura organizacional</strong> podem 
            alavancar a produtividade e a margem financeira da sua empresa.
          </motion.p>

          {/* Location and date info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Tangará da Serra - Hotel Ibis</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>12/03/2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>18h às 22h</span>
            </div>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">Vagas do Lote 1 encerram em:</p>
            <CountdownTimer targetDate={new Date("2026-02-15T23:59:59")} />
          </motion.div>

          {/* Price highlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-4 bg-card/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-border">
              <div className="text-muted-foreground">
                <span className="line-through text-lg">R$ 997</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="text-3xl md:text-4xl font-bold text-gradient-gold">R$ 497</span>
                <span className="text-muted-foreground text-sm ml-2">ou 4x 135,28</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <a 
              href={CTA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta inline-flex items-center gap-3 text-primary-foreground pulse-glow"
            >
              GARANTIR MINHA VAGA COM 50% OFF
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-muted-foreground text-sm mt-4">
              ⚡ Vagas extremamente limitadas
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
