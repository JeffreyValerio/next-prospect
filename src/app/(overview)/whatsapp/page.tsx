import { Suspense } from "react";
import { WhatsAppChatWindow } from "@/components/whatsapp/WhatsAppChatWindow";
import { SendToProspectsButton } from "@/components/whatsapp/SendToProspectsButton";

function WhatsAppContent() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus conversaciones de WhatsApp
          </p>
        </div>
        <SendToProspectsButton />
      </div>
      
      <WhatsAppChatWindow />
    </div>
  );
}

export default function WhatsAppPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6">Cargando...</div>}>
      <WhatsAppContent />
    </Suspense>
  );
}
