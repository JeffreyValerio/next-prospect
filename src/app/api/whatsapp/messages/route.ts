import { NextResponse } from "next/server";
import { getMessageLogs } from "@/lib/whatsapp-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    // Obtener los logs de mensajes
    // Nota: WasenderAPI no tiene endpoint directo para obtener mensajes históricos
    // Los mensajes se reciben a través de webhooks, por lo que por ahora retornamos array vacío
    // En producción, deberías almacenar los mensajes recibidos via webhooks en una base de datos
    const messageLogs = await getMessageLogs();

    // Filtrar mensajes por número de teléfono si se proporciona
    let messages = Array.isArray(messageLogs) ? messageLogs : [];
    
    if (phoneNumber) {
      messages = messages.filter((msg: Record<string, unknown>) => {
        const fromValue = msg.from as string | undefined;
        const from = fromValue || ((msg.fromMe as boolean) ? "me" : (fromValue?.split("@")[0] || ""));
        const toValue = msg.to as string | undefined;
        const to = toValue?.split("@")[0] || "";
        // Normalizar el número de teléfono para comparación (remover @s.whatsapp.net, espacios, etc.)
        const normalizePhone = (phone: string) => phone?.replace(/[@\s]/g, "") || "";
        return normalizePhone(from) === normalizePhone(phoneNumber) || normalizePhone(to) === normalizePhone(phoneNumber);
      });
    }

    // Transformar mensajes a formato estándar
    const formattedMessages = messages.map((msg: Record<string, unknown>) => {
      const fromValue = msg.from as string | undefined;
      const toValue = msg.to as string | undefined;
      const keyValue = msg.key as { id?: string } | undefined;
      const messageBodyValue = msg.messageBody as { text?: string; mediaUrl?: string; caption?: string } | undefined;
      
      return {
        id: (msg.id as string | undefined) || keyValue?.id || Math.random().toString(),
        from: fromValue?.split("@")[0] || fromValue || "",
        to: toValue?.split("@")[0] || toValue || "",
        text: (msg.text as string | undefined) || (msg.body as string | undefined) || messageBodyValue?.text || "",
        timestamp: msg.timestamp ? (typeof msg.timestamp === 'number' ? msg.timestamp * 1000 : new Date(msg.timestamp as string | number).getTime()) : Date.now(),
        type: (msg.type as string | undefined) || 'text',
        status: (msg.status as string | undefined) || 'sent',
        isFromMe: msg.fromMe !== undefined ? (msg.fromMe as boolean) : false,
        mediaUrl: (msg.mediaUrl as string | undefined) || messageBodyValue?.mediaUrl,
        caption: (msg.caption as string | undefined) || messageBodyValue?.caption,
      };
    });

    return NextResponse.json({ messages: formattedMessages }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    // En caso de error inesperado, retornar array vacío en lugar de error 500
    // Esto evita que se muestren errores constantemente cuando no hay mensajes
    return NextResponse.json({ messages: [] }, { status: 200 });
  }
}
