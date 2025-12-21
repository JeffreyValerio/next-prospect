import { NextResponse } from "next/server";
import { WhatsAppMessage } from "@/interfaces/whatsapp.interface";
import { addReceivedMessage } from "@/lib/whatsapp-webhook-storage";

// Esta ruta recibe webhooks de WasenderAPI
// Necesitarás configurar esta URL en el dashboard de WasenderAPI
// URL esperada: https://tu-dominio.com/api/whatsapp/webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log del webhook recibido para debugging
    console.log("Webhook recibido de WasenderAPI:", JSON.stringify(body, null, 2));

    // Procesar diferentes tipos de eventos según la documentación de WasenderAPI
    const eventType = body.type || body.event || "";
    
    // Procesar mensajes recibidos
    if (eventType.includes("message") || body.messageBody || body.text || body.message) {
      // Determinar si es un mensaje recibido (no enviado por nosotros)
      const fromNumber = body.from?.split("@")[0] || body.from || body.fromNumber || body.phoneNumber || "";
      const toNumber = body.to?.split("@")[0] || body.to || body.toNumber || "";
      const isFromMe = body.fromMe !== undefined ? body.fromMe : false;
      
      // Solo procesar mensajes recibidos (no enviados por nosotros)
      if (!isFromMe && fromNumber) {
        const message: WhatsAppMessage = {
          id: body.id || body.key?.id || body.messageId || `webhook-${Date.now()}-${Math.random()}`,
          from: fromNumber,
          to: toNumber,
          text: body.text || body.body || body.messageBody?.text || body.messageBody || body.message?.text || "",
          timestamp: body.timestamp 
            ? (typeof body.timestamp === 'number' ? body.timestamp * 1000 : new Date(body.timestamp).getTime())
            : Date.now(),
          type: body.type || 'text',
          status: body.status || 'sent',
          isFromMe: false,
          mediaUrl: body.mediaUrl || body.messageBody?.mediaUrl || body.message?.mediaUrl,
          caption: body.caption || body.messageBody?.caption || body.message?.caption,
        };

        // Almacenar mensaje recibido para que el frontend lo pueda consultar
        addReceivedMessage(fromNumber, message);
        console.log("Mensaje recibido procesado:", message);
      }
    }
    
    // Procesar actualizaciones de estado de mensajes
    if (eventType.includes("status") || body.status) {
      console.log("Actualización de estado:", body);
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
