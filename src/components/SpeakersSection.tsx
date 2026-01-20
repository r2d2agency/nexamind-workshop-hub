import { motion } from "framer-motion";
import soniaAlves from "@/assets/sonia-alves.webp";
import veruskaGalvao from "@/assets/veruska-galvao.webp";
import luizVicente from "@/assets/luiz-vicente.webp";
import rafaelFreitas from "@/assets/rafael-freitas.webp";

const speakers = [
  {
    name: "Sonia Alves",
    role: "CEO da Nexamind",
    expertise: "RH Estratégico, Cultura Organizacional, Análise Comportamental e NR1",
    image: soniaAlves
  },
  {
    name: "Veruska Galvão",
    role: "CEO",
    expertise: "Segurança Psicológica e Modelagem da Cultura Organizacional no Brasil",
    image: veruskaGalvao
  },
  {
    name: "Luiz Vicente",
    role: "CEO",
    expertise: "Uma das maiores referências em Análise Comportamental DISC do Brasil",
    image: luizVicente
  },
  {
    name: "Rafael Freitas",
    role: "CEO da Planus Contabilidade",
    expertise: "Sócio da Simplifique Inteligência Financeira",
    image: rafaelFreitas
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
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/30">
                <img 
                  src={speaker.image} 
                  alt={speaker.name}
                  className="w-full h-full object-cover object-top"
                />
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
