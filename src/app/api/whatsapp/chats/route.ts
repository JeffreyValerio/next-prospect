import { NextResponse } from "next/server";
import { getContacts } from "@/lib/whatsapp-api";

export async function GET() {
  try {
    const contacts = await getContacts();
    
    // Transformar los contactos en chats
    const chats = Array.isArray(contacts) ? contacts.map((contact: Record<string, unknown>) => ({
      id: contact.id || contact.phoneNumber || contact.jid,
      phoneNumber: contact.phoneNumber || contact.phone || contact.id,
      name: contact.name || contact.pushName || contact.phoneNumber || "Sin nombre",
      lastMessage: (contact.lastMessage as { text?: string } | undefined)?.text || "",
      lastMessageTime: (contact.lastMessage as { timestamp?: string | number } | undefined)?.timestamp ? new Date((contact.lastMessage as { timestamp: string | number }).timestamp).getTime() : undefined,
      unreadCount: contact.unreadCount || 0,
      profilePicture: contact.profilePicture || contact.pictureUrl,
    })) : [];

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo chats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
