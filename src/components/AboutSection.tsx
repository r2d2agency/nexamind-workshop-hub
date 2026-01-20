import { motion } from "framer-motion";
import { Award, BookOpen, Users, Briefcase } from "lucide-react";

export const AboutSection = () => {
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
              Quem é <span className="text-gradient-primary">Sonia Alves?</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-premium"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-teal-dark flex items-center justify-center text-4xl font-bold text-primary-foreground flex-shrink-0">
                SA
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2 text-foreground">Sonia Alves</h3>
                <p className="text-primary font-medium mb-4">CEO da Nexamind</p>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Referência em Desenvolvimento Humano e Organizacional, apaixonada por transformar 
                  pessoas e elevar empresas ao seu mais alto nível de performance. Com formação robusta 
                  em Administração, RH, e múltiplas Especializações e MBAs em Gestão de Pessoas, 
                  Liderança Executiva e Análise Comportamental.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    <span className="text-sm text-muted-foreground">Especialista NR-1</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <span className="text-sm text-muted-foreground">Múltiplos MBAs</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    <span className="text-sm text-muted-foreground">Coaching & Mentoria</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    <span className="text-sm text-muted-foreground">Consultoria Executiva</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
