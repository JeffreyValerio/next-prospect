// Este archivo maneja el almacenamiento temporal de mensajes recibidos vía webhook
// En producción, esto debería ser una base de datos

import { WhatsAppMessage } from "@/interfaces/whatsapp.interface";

// Almacenamiento en memoria (se pierde al reiniciar el servidor)
const receivedMessages: Map<string, WhatsAppMessage[]> = new Map();

export function addReceivedMessage(phoneNumber: string, message: WhatsAppMessage) {
  const normalizedPhone = phoneNumber.replace(/[@\s]/g, '');
  if (!receivedMessages.has(normalizedPhone)) {
    receivedMessages.set(normalizedPhone, []);
  }
  const messages = receivedMessages.get(normalizedPhone) || [];
  // Evitar duplicados por ID
  const exists = messages.some((msg) => (msg as { id?: string }).id === (message as { id?: string }).id);
  if (!exists) {
    messages.push(message);
    receivedMessages.set(normalizedPhone, messages);
  }
}

export function getReceivedMessages(phoneNumber: string): WhatsAppMessage[] {
  const normalizedPhone = phoneNumber.replace(/[@\s]/g, '');
  return receivedMessages.get(normalizedPhone) || [];
}

export function clearReceivedMessages(phoneNumber: string) {
  const normalizedPhone = phoneNumber.replace(/[@\s]/g, '');
  receivedMessages.delete(normalizedPhone);
}

