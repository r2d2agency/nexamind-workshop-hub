export const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient-primary">NEXA</span>
            <span className="text-2xl font-bold text-gradient-gold">MIND</span>
          </div>
          
          <p className="text-muted-foreground text-sm text-center">
            © 2026 Nexamind - Desenvolvimento Humano e Organizacional. Todos os direitos reservados.
          </p>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
