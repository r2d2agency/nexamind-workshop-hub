import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const result = await api.getPaymentStatus(sessionId);
        if (result.status === "paid") {
          setStatus("success");
          setEmail(result.customerEmail || "");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    checkPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium max-w-md w-full text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processando...</h1>
            <p className="text-muted-foreground">
              Aguarde enquanto confirmamos seu pagamento.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground mb-6">
              Sua inscrição foi realizada com sucesso.
              {email && (
                <span className="block mt-2">
                  Enviamos os detalhes para <strong>{email}</strong>
                </span>
              )}
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 text-left">
                <h3 className="font-medium mb-2">Próximos passos:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Verifique seu email para detalhes do evento</li>
                  <li>✓ Anote a data e local no seu calendário</li>
                  <li>✓ Prepare-se para uma experiência transformadora!</li>
                </ul>
              </div>
              <Button asChild className="w-full btn-cta">
                <Link to="/">
                  Voltar ao início
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-20 h-20 mx-auto mb-6 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h1>
            <p className="text-muted-foreground mb-6">
              Não conseguimos confirmar seu pagamento.
              Por favor, tente novamente ou entre em contato conosco.
            </p>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  Voltar e tentar novamente
                </Link>
              </Button>
              <Button asChild className="w-full btn-cta">
                <a href="https://wa.me/5565999999999" target="_blank" rel="noopener noreferrer">
                  Falar com suporte
                </a>
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
