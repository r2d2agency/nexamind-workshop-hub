import { motion } from "framer-motion";
import { ArrowRight, Check, Zap } from "lucide-react";
import { EventData } from "@/pages/EventPage";

const DEFAULT_CTA_LINK = "https://tinyurl.com/workshopnexaminddho";

const includes = [
  "4h de evento presencial imersivo",
  "4 palestrantes renomados",
  "Kit Boas vindas exclusivo",
  "Credenciamento Personalizado",
  "Material de apoio completo",
  "Ferramentas e exercícios práticos",
  "Link para análise de perfil comportamental",
  "Coffee break premium",
  "Sorteio de 2 livros"
];

interface PricingSectionProps {
  eventData?: EventData;
}

export const PricingSection = ({ eventData }: PricingSectionProps) => {
  const priceCents = eventData?.price_cents || 49700;
  const originalPriceCents = eventData?.original_price_cents || 99700;
  const installmentsCount = eventData?.installments || 4;
  const price = (priceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  const originalPrice = (originalPriceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  const discount = Math.round((1 - priceCents / originalPriceCents) * 100);
  const installment = (priceCents / 100 / installmentsCount).toFixed(2).replace('.', ',');
  const currentBatch = eventData?.current_batch || 1;
  const ctaLink = eventData?.cta_link || DEFAULT_CTA_LINK;

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(40 80% 50% / 0.2) 0%, transparent 60%)'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-promo inline-flex mb-6">
            <Zap className="w-4 h-4" />
            <span>LOTE {String(currentBatch).padStart(2, '0')} LIBERADO</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Invista no <span className="text-gradient-gold">Seu Crescimento</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Vagas extremamente limitadas! Aproveite o desconto exclusivo do Lote {currentBatch}.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="card-premium border-2 border-primary/50 relative">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="badge-promo">
                <span>{discount}% OFF</span>
              </div>
            </div>

            <div className="pt-8 pb-6 text-center border-b border-border">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Lote {currentBatch}</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl text-muted-foreground line-through">R$ {originalPrice}</span>
                <span className="text-5xl md:text-6xl font-bold text-gradient-gold">R$ {price}</span>
              </div>
              <p className="text-muted-foreground mt-2">
                ou {installmentsCount}x de <span className="text-foreground font-semibold">R$ {installment}</span>
              </p>
            </div>

            <div className="py-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4 text-center">O que está incluso:</p>
              <ul className="space-y-3">
                {includes.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <a 
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full flex items-center justify-center gap-3"
              >
                QUERO O LOTE {currentBatch} COM {discount}% OFF
                <ArrowRight className="w-5 h-5" />
              </a>
              <p className="text-center text-muted-foreground text-xs mt-4">
                🔒 Pagamento 100% seguro
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
