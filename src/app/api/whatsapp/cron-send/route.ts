import { NextResponse } from "next/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { filterProspectsFromYesterday, getValidPhoneNumbers } from "@/lib/whatsapp-prospects";
import { sendWhatsAppMessage } from "@/lib/whatsapp-api";

const MESSAGE_TEMPLATE = "¡Hola! Soy Christian Valerio, asesor comercial de CLARO. ¿Quieres disfrutar de Internet + TV de alta velocidad sin complicaciones? ¡Contáctame y te haré una oferta personalizada! 💻📺";

/**
 * Cron job que envía un mensaje cada 20 minutos entre las 8:00 AM y las 6:00 PM
 * Busca prospectos del día anterior con estado "Sin tipificar" y envía UN mensaje por ejecución
 */
export async function GET(request: Request) {
  const startTime = new Date().toISOString();
  console.log(`[CRON-SEND] Iniciando ejecución del cron job a las ${startTime}`);

  try {
    // Verificar que sea una petición autorizada (desde Vercel Cron o con secret)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log("[CRON-SEND] Error: No autorizado");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[CRON-SEND] Obteniendo prospectos...");
    // Obtener todos los prospectos
    const allProspects = await getProspect();
    
    if (!Array.isArray(allProspects)) {
      return NextResponse.json(
        { error: "Error al obtener prospectos" },
        { status: 500 }
      );
    }

    console.log(`[CRON-SEND] Total de prospectos obtenidos: ${allProspects.length}`);
    
    // Filtrar prospectos agregados ayer
    const prospectsFromYesterday = filterProspectsFromYesterday(allProspects);
    console.log(`[CRON-SEND] Prospectos de ayer: ${prospectsFromYesterday.length}`);

    // Filtrar solo los que tienen "Sin tipificar" y tienen números de teléfono válidos
    const eligibleProspects = prospectsFromYesterday
      .filter((prospect) => {
        // Solo prospectos con estado "Sin tipificar"
        if (prospect.customerResponse !== "Sin tipificar") {
          return false;
        }
        
        // Verificar que tenga números de teléfono válidos
        const phoneNumbers = getValidPhoneNumbers(prospect);
        return phoneNumbers.length > 0;
      })
      .map((prospect) => ({
        ...prospect,
        phoneNumbers: getValidPhoneNumbers(prospect),
      }));

    console.log(`[CRON-SEND] Prospectos elegibles (Sin tipificar con teléfono): ${eligibleProspects.length}`);

    if (eligibleProspects.length === 0) {
      console.log("[CRON-SEND] No hay prospectos elegibles para enviar mensajes");
      return NextResponse.json({
        success: true,
        message: "No hay prospectos elegibles para enviar mensajes",
        sent: 0,
        totalEligible: 0,
        timestamp: startTime,
      });
    }

    // Seleccionar el primer prospecto elegible (puedes cambiar esta lógica si necesitas más sofisticación)
    const prospectToSend = eligibleProspects[0];
    const phoneNumber = prospectToSend.phoneNumbers[0];
    
    console.log(`[CRON-SEND] Enviando mensaje a prospecto: ${prospectToSend.firstName} ${prospectToSend.lastName} (${prospectToSend.id}) - Teléfono: ${phoneNumber}`);

    try {
      // Enviar el mensaje
      const sendResult = await sendWhatsAppMessage({
        to: phoneNumber,
        text: MESSAGE_TEMPLATE,
        type: 'text',
      });
      console.log("[CRON-SEND] Mensaje enviado exitosamente:", sendResult);

      // Actualizar el prospecto
      console.log(`[CRON-SEND] Actualizando prospecto ${prospectToSend.id}...`);
      const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;
      if (googleScriptURL) {
        const updateResponse = await fetch(`${googleScriptURL}?id=${prospectToSend.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: prospectToSend.id,
            firstName: prospectToSend.firstName,
            lastName: prospectToSend.lastName,
            nId: prospectToSend.nId,
            phone1: prospectToSend.phone1,
            phone2: prospectToSend.phone2 || '',
            address: prospectToSend.address,
            location: prospectToSend.location || '',
            comments: prospectToSend.comments || '',
            customerResponse: "Se envía información por WhatsApp",
            assignedTo: "Christian Valerio Angulo",
            assignedAt: prospectToSend.assignedAt || '',
            date: prospectToSend.date || '',
            action: 'update',
          }),
        });
        
        if (updateResponse.ok) {
          console.log(`[CRON-SEND] Prospecto actualizado exitosamente`);
        } else {
          console.error(`[CRON-SEND] Error al actualizar prospecto: ${updateResponse.statusText}`);
        }
      } else {
        console.error("[CRON-SEND] GOOGLE_SCRIPT_URL no está configurado");
      }

      const endTime = new Date().toISOString();
      console.log(`[CRON-SEND] Ejecución completada exitosamente a las ${endTime}`);

      return NextResponse.json({
        success: true,
        message: `Mensaje enviado exitosamente a ${prospectToSend.firstName} ${prospectToSend.lastName}`,
        sent: 1,
        prospectId: prospectToSend.id,
        prospectName: `${prospectToSend.firstName} ${prospectToSend.lastName}`,
        phoneNumber,
        totalEligible: eligibleProspects.length,
        remaining: eligibleProspects.length - 1,
        timestamp: startTime,
        completedAt: endTime,
      });
    } catch (error) {
      console.error(`[CRON-SEND] Error enviando mensaje a prospecto ${prospectToSend.id}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
          prospectId: prospectToSend.id,
          timestamp: startTime,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[CRON-SEND] Error en cron de envío de mensajes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: startTime,
      },
      { status: 500 }
    );
  }
}
