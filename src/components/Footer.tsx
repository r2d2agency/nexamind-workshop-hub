import nexamindLogo from "@/assets/nexamind-logo.webp";

export const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <img 
            src={nexamindLogo} 
            alt="Nexamind" 
            className="h-10 object-contain"
          />
          
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
