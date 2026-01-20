import { motion } from "framer-motion";
import { 
  TrendingDown, 
  Target, 
  Users, 
  Brain, 
  Lightbulb, 
  BarChart3,
  Shield,
  Compass
} from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    title: "Reduza a Rotatividade",
    description: "Soluções aplicáveis para diminuir a rotatividade e melhorar o engajamento"
  },
  {
    icon: Target,
    title: "Decisões Assertivas",
    description: "Método simples para garantir tomadas de decisão mais assertivas"
  },
  {
    icon: Users,
    title: "Equipes de Alta Performance",
    description: "Ferramentas práticas para reduzir conflitos e fortalecer equipes"
  },
  {
    icon: Brain,
    title: "Consciência Estratégica",
    description: "Visão ampliada sobre riscos internos que afetam produtividade e clima"
  },
  {
    icon: Lightbulb,
    title: "4 Especialistas",
    description: "Acesso a quatro especialistas com métodos que geram resultados reais"
  },
  {
    icon: BarChart3,
    title: "Aumente Resultados",
    description: "Estratégias para estruturar o ambiente e aumentar resultados"
  },
  {
    icon: Shield,
    title: "Diagnósticos Práticos",
    description: "Entenda como decisões e comportamentos impactam o resultado final"
  },
  {
    icon: Compass,
    title: "Direção Estratégica",
    description: "Alinhe pessoas, cultura e operação para máxima performance"
  }
];

export const BenefitsSection = () => {
  return (
    <section className="py-20 md:py-28 section-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            O Que Você Vai <span className="text-gradient-gold">Receber</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Em 4 horas de imersão presencial, você terá acesso a ferramentas que 
            transformam a forma de liderar e decidir.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium group hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
