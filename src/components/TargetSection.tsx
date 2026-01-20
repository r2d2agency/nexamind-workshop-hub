import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const targets = [
  "Gestores e líderes decisores",
  "Empresários e donos de negócios",
  "CEOs, diretores e alta liderança",
  "Empresas que querem maiores resultados com mais engajamento",
  "Empresários cansados de apagar incêndios",
  "Organizações que buscam mais clareza e performance"
];

export const TargetSection = () => {
  return (
    <section className="py-20 md:py-28 section-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Para Quem é o <span className="text-gradient-gold">BMS Negócios Lucrativos?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Criado para empresários e líderes que sentem, todos os dias, a responsabilidade 
              de conduzir pessoas, resultados e o futuro da empresa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targets.map((target, index) => (
              <motion.div
                key={target}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 card-premium"
              >
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-foreground">{target}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
