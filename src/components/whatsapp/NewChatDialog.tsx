'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (phoneNumber: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onStartChat }: NewChatDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const normalizePhoneNumber = (phone: string): string => {
    // Remover espacios, guiones y otros caracteres
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    
    // Si ya tiene código de país, usarlo tal cual
    if (cleaned.startsWith("+")) {
      return cleaned;
    }
    
    // Si empieza con 506 (código de Costa Rica sin +), agregar el +
    if (cleaned.startsWith("506")) {
      return "+" + cleaned;
    }
    
    // Si no tiene código de país, agregar +506 (Costa Rica)
    return "+506" + cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return false;
    
    const normalized = normalizePhoneNumber(phone);
    // Validar que tenga formato correcto: +506 seguido de 8 dígitos
    // Formato esperado: +506XXXXXXXX (8 dígitos después del código de país)
    const pattern = /^\+506\d{8}$/;
    return pattern.test(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error("Por favor ingresa un número de teléfono");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    if (!validatePhoneNumber(normalizedPhone)) {
      toast.error("Por favor ingresa un número de teléfono válido de Costa Rica (8 dígitos)");
      return;
    }

    try {
      setIsValidating(true);
      
      // Opcional: Verificar si el número está en WhatsApp
      // Por ahora, simplemente iniciar el chat
      onStartChat(normalizedPhone);
      setPhoneNumber("");
      onOpenChange(false);
      toast.success("Conversación iniciada");
    } catch (error) {
      console.error("Error iniciando conversación:", error);
      toast.error("Error al iniciar la conversación");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Conversación</DialogTitle>
          <DialogDescription>
            Ingresa el número de teléfono (se agregará automáticamente +506 si no lo incluyes)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="60265671"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isValidating}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Ejemplo: 60265671 o 860265671 (se agregará automáticamente +506)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setPhoneNumber("");
              }}
              disabled={isValidating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isValidating || !phoneNumber.trim()}>
              {isValidating ? "Iniciando..." : "Iniciar Conversación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
