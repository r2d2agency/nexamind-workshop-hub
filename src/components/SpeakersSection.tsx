import { motion } from "framer-motion";

const speakers = [
  {
    name: "Sonia Alves",
    role: "CEO da Nexamind",
    expertise: "RH Estratégico, Cultura Organizacional, Análise Comportamental e NR1",
    image: "SA"
  },
  {
    name: "Veruska Galvão",
    role: "CEO",
    expertise: "Segurança Psicológica e Modelagem da Cultura Organizacional no Brasil",
    image: "VG"
  },
  {
    name: "Luiz Vicente",
    role: "CEO",
    expertise: "Uma das maiores referências em Análise Comportamental DISC do Brasil",
    image: "LV"
  },
  {
    name: "Rafael Freitas",
    role: "CEO da Planus Contabilidade",
    expertise: "Sócio da Simplifique Inteligência Financeira",
    image: "RF"
  }
];

export const SpeakersSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Conheça os <span className="text-gradient-primary">Especialistas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Quatro profissionais referência em liderança, cultura organizacional e finanças 
            reunidos para transformar sua visão de negócio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {speakers.map((speaker, index) => (
            <motion.div
              key={speaker.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="card-premium text-center group"
            >
              {/* Avatar placeholder */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-teal-dark flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {speaker.image}
              </div>
              
              <h3 className="text-xl font-bold mb-1 text-foreground">
                {speaker.name}
              </h3>
              <p className="text-primary font-medium text-sm mb-3">
                {speaker.role}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {speaker.expertise}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
