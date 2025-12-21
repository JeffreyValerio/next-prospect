const WASENDER_API_BASE_URL = "https://wasenderapi.com/api";
const WASENDER_API_KEY = process.env.WASENDER_API_KEY || "dc6e85207c7a47584512d926242a2127d71aa9ff4864903dcc0e4cf4bdb04681";

export interface SendMessageParams {
  to: string;
  text: string;
  mediaUrl?: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document';
}

export async function sendWhatsAppMessage(params: SendMessageParams) {
  const response = await fetch(`${WASENDER_API_BASE_URL}/send-message`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WASENDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: params.to,
      text: params.text,
      ...(params.mediaUrl && { mediaUrl: params.mediaUrl }),
      ...(params.type && params.type !== 'text' && { type: params.type }),
    }),
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      // Si la respuesta no es JSON, usar el mensaje por defecto
      const text = await response.text().catch(() => "");
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getContacts() {
  const response = await fetch(`${WASENDER_API_BASE_URL}/contacts`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${WASENDER_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      // Si la respuesta no es JSON, usar el mensaje por defecto
      const text = await response.text().catch(() => "");
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getMessageLogs() {
  // Nota: Según la documentación de WasenderAPI, los mensajes se obtienen a través de webhooks
  // No hay un endpoint directo para obtener historial de mensajes
  // Por ahora retornamos un array vacío, los mensajes se obtendrán vía webhooks
  // Si en el futuro hay un endpoint, se puede usar algo como:
  // GET /api/whatsapp-sessions/{whatsappSession}/message-logs
  
  // Por ahora, simplemente retornar array vacío
  // Los mensajes reales se manejarán a través de webhooks
  return [];
  
  /* Código comentado para referencia futura si se agrega el endpoint:
  const url = sessionId 
    ? `${WASENDER_API_BASE_URL}/whatsapp-sessions/${sessionId}/message-logs`
    : `${WASENDER_API_BASE_URL}/message-logs`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${WASENDER_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      const text = await response.text().catch(() => "");
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
  */
}
