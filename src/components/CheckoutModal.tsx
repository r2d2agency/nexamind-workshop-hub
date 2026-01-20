import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
import { z } from "zod";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Array<{
    id: string;
    name: string;
    location: string;
    date: string;
    price_cents: number;
    original_price_cents: number;
  }>;
}

const checkoutSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(10, "Telefone inválido").max(20),
  eventId: z.string().uuid("Selecione um evento"),
});

export const CheckoutModal = ({ isOpen, onClose, events }: CheckoutModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventId: events[0]?.id || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedEvent = events.find(e => e.id === formData.eventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validated = checkoutSchema.parse(formData);
      
      const response = await api.createCheckout({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        eventId: validated.eventId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao processar. Tente novamente.");
      }
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg card-premium max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="text-center mb-6">
              <div className="badge-promo inline-flex mb-4">
                <CreditCard className="w-4 h-4" />
                <span>PAGAMENTO SEGURO</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Finalizar Inscrição</h3>
              <p className="text-muted-foreground text-sm">
                Preencha seus dados para garantir sua vaga
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event selection */}
              {events.length > 1 && (
                <div className="space-y-3">
                  <Label>Escolha a data e local:</Label>
                  <RadioGroup
                    value={formData.eventId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, eventId: value }))}
                    className="space-y-2"
                  >
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          formData.eventId === event.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={event.id} id={event.id} />
                        <Label htmlFor={event.id} className="flex-1 cursor-pointer">
                          <span className="font-medium">{event.location}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            {formatDate(event.date)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="checkout-name">Nome completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkout-name"
                    value={formData.name}
                    onChange={handleChange("name")}
                    placeholder="Seu nome completo"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkout-email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="seu@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-phone">WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkout-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    placeholder="(65) 99999-9999"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Price summary */}
              {selectedEvent && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Evento</span>
                    <span className="font-medium">{selectedEvent.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <div className="text-right">
                      {selectedEvent.original_price_cents > selectedEvent.price_cents && (
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          {formatPrice(selectedEvent.original_price_cents)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-gradient-gold">
                        {formatPrice(selectedEvent.price_cents)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pagar com Cartão, Pix ou Boleto
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                🔒 Pagamento processado com segurança pelo Stripe
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
