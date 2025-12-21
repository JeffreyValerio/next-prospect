'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SendToProspectsButtonProps {
  message?: string;
}

interface SendResult {
  prospectId: string;
  prospectName: string;
  phoneNumber?: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
  reason?: string;
}

interface SendResults {
  success: boolean;
  message?: string;
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  results: SendResult[];
}

export function SendToProspectsButton({ message = "¡Hola! Soy Christian Valerio, asesor comercial de CLARO. ¿Quieres disfrutar de Internet + TV de alta velocidad sin complicaciones? ¡Contáctame y te haré una oferta personalizada! 💻📺" }: SendToProspectsButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(message);
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState<SendResults | null>(null);

  const handleSend = async () => {
    if (!customMessage.trim()) {
      toast.error("Por favor ingresa un mensaje");
      return;
    }

    try {
      setIsSending(true);
      setResults(null);

      const response = await fetch("/api/whatsapp/send-to-prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: customMessage.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar mensajes");
      }

      setResults(data);
      
      if (data.sent > 0) {
        toast.success(`${data.sent} mensaje(s) enviado(s) exitosamente`);
      }
      
      if (data.failed > 0) {
        toast.warning(`${data.failed} mensaje(s) fallaron`);
      }
      
      if (data.sent === 0 && data.failed === 0) {
        toast.info(data.message || "No se encontraron prospectos para enviar");
      }
    } catch (error) {
      console.error("Error enviando mensajes:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar mensajes");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChat = (phoneNumber: string) => {
    // Cerrar el modal primero
    setIsOpen(false);
    // Navegar a WhatsApp con el número como query param
    router.push(`/whatsapp?openChat=${encodeURIComponent(phoneNumber)}`);
  };

  const handleClose = () => {
    setIsOpen(false);
    setResults(null);
    setCustomMessage(message);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
        variant="default"
      >
        <Send className="h-4 w-4" />
        Enviar a Prospectos de Ayer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Mensaje a Prospectos</DialogTitle>
            <DialogDescription>
              Se enviará el mensaje a todos los prospectos agregados ayer
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!results ? (
              <div className="grid gap-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Escribe el mensaje a enviar..."
                  rows={4}
                  disabled={isSending}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen general */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold text-lg mb-3">Resumen de Envío</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{results.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Enviados</p>
                      <p className="text-2xl font-bold text-green-600">{results.sent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fallidos</p>
                      <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                    </div>
                  </div>
                </div>

                {/* Lista de resultados */}
                {results.results && results.results.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Mensajes Enviados:</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {results.results
                        .filter((r) => r.status === "sent")
                        .map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">{result.prospectName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {result.phoneNumber}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => result.phoneNumber && handleOpenChat(result.phoneNumber)}
                              className="gap-2"
                              disabled={!result.phoneNumber}
                            >
                              <MessageSquare className="h-4 w-4" />
                              Abrir Chat
                            </Button>
                          </div>
                        ))}
                      
                      {results.results
                        .filter((r) => r.status === "failed")
                        .map((result, index) => (
                          <div
                            key={`failed-${index}`}
                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium">{result.prospectName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {result.error || "Error desconocido"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="destructive">Fallido</Badge>
                          </div>
                        ))}
                      
                      {results.results
                        .filter((r) => r.status === "skipped")
                        .map((result, index) => (
                          <div
                            key={`skipped-${index}`}
                            className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="font-medium">{result.prospectName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {result.reason || "Omitido"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">Omitido</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {!results ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSend} disabled={isSending || !customMessage.trim()}>
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} variant="default">
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
