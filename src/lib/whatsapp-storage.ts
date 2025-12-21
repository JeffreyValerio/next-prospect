// Sistema simple de almacenamiento de mensajes usando localStorage
// En producción, deberías usar una base de datos real

import { WhatsAppMessage } from "@/interfaces/whatsapp.interface";

const STORAGE_KEY = 'whatsapp_messages';

export function getStoredMessages(phoneNumber?: string): WhatsAppMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allMessages: WhatsAppMessage[] = JSON.parse(stored);
    
    if (phoneNumber) {
      return allMessages.filter(
        (msg) => 
          msg.from?.replace(/[@\s]/g, '') === phoneNumber.replace(/[@\s]/g, '') ||
          msg.to?.replace(/[@\s]/g, '') === phoneNumber.replace(/[@\s]/g, '')
      );
    }
    
    return allMessages;
  } catch (error) {
    console.error("Error leyendo mensajes almacenados:", error);
    return [];
  }
}

export function storeMessage(message: WhatsAppMessage): void {
  try {
    const allMessages = getStoredMessages();
    
    // Verificar si el mensaje ya existe (por ID)
    const existingIndex = allMessages.findIndex((msg) => msg.id === message.id);
    
    if (existingIndex >= 0) {
      // Actualizar mensaje existente
      allMessages[existingIndex] = message;
    } else {
      // Agregar nuevo mensaje
      allMessages.push(message);
    }
    
    // Ordenar por timestamp
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error("Error almacenando mensaje:", error);
  }
}

export function storeMessages(messages: WhatsAppMessage[]): void {
  try {
    const allMessages = getStoredMessages();
    const messageMap = new Map<string, WhatsAppMessage>();
    
    // Agregar mensajes existentes
    allMessages.forEach((msg) => messageMap.set(msg.id, msg));
    
    // Agregar/actualizar nuevos mensajes
    messages.forEach((msg) => messageMap.set(msg.id, msg));
    
    const updatedMessages = Array.from(messageMap.values());
    updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
  } catch (error) {
    console.error("Error almacenando mensajes:", error);
  }
}

export function clearStoredMessages(phoneNumber?: string): void {
  try {
    if (phoneNumber) {
      const allMessages = getStoredMessages();
      const filtered = allMessages.filter(
        (msg) => 
          msg.from?.replace(/[@\s]/g, '') !== phoneNumber.replace(/[@\s]/g, '') &&
          msg.to?.replace(/[@\s]/g, '') !== phoneNumber.replace(/[@\s]/g, '')
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error limpiando mensajes:", error);
  }
}
