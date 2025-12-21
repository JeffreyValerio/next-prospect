import { NextResponse } from "next/server";
import { getReceivedMessages } from "@/lib/whatsapp-webhook-storage";

// Este endpoint permite que el frontend consulte mensajes recibidos vía webhook
// Los mensajes se almacenan temporalmente (en producción usar BD)

// Endpoint GET para consultar mensajes recibidos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    
    if (!phoneNumber) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }
    
    const messages = getReceivedMessages(phoneNumber);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo mensajes recibidos:", error);
    return NextResponse.json({ messages: [] }, { status: 200 });
  }
}
