import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, text, mediaUrl, type } = body;

    if (!to || !text) {
      return NextResponse.json(
        { error: "Los campos 'to' y 'text' son requeridos" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({
      to,
      text,
      mediaUrl,
      type: type || 'text',
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}
