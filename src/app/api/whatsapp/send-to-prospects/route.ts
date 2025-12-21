import { NextResponse } from "next/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { filterProspectsFromYesterday, getValidPhoneNumbers } from "@/lib/whatsapp-prospects";
import { sendWhatsAppMessage } from "@/lib/whatsapp-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    // Obtener todos los prospectos
    const allProspects = await getProspect();
    
    if (!Array.isArray(allProspects)) {
      return NextResponse.json(
        { error: "Error al obtener prospectos" },
        { status: 500 }
      );
    }

    // Filtrar prospectos agregados ayer
    const prospectsFromYesterday = filterProspectsFromYesterday(allProspects);
    
    if (prospectsFromYesterday.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se encontraron prospectos agregados ayer",
        sent: 0,
        failed: 0,
        results: [],
      });
    }

    // Enviar mensajes a cada prospecto
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const prospect of prospectsFromYesterday) {
      // Solo enviar a prospectos con estado "Sin tipificar"
      if (prospect.customerResponse !== "Sin tipificar") {
        results.push({
          prospectId: prospect.id,
          prospectName: `${prospect.firstName} ${prospect.lastName}`,
          status: "skipped",
          reason: `Estado actual: ${prospect.customerResponse || "Sin estado"}`,
        });
        continue;
      }

      const phoneNumbers = getValidPhoneNumbers(prospect);
      
      if (phoneNumbers.length === 0) {
        results.push({
          prospectId: prospect.id,
          prospectName: `${prospect.firstName} ${prospect.lastName}`,
          status: "skipped",
          reason: "No tiene números de teléfono válidos",
        });
        continue;
      }

      // Enviar al primer número disponible (phone1 tiene prioridad)
      const phoneNumber = phoneNumbers[0];
      
      try {
        await sendWhatsAppMessage({
          to: phoneNumber,
          text: message,
          type: 'text',
        });

        // Actualizar el customerResponse del prospecto a "Se envía información por WhatsApp"
        // y asignar a Christian Valerio Angulo
        try {
          const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;
          if (googleScriptURL) {
            await fetch(`${googleScriptURL}?id=${prospect.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: prospect.id,
                firstName: prospect.firstName,
                lastName: prospect.lastName,
                nId: prospect.nId,
                phone1: prospect.phone1,
                phone2: prospect.phone2 || '',
                address: prospect.address,
                location: prospect.location || '',
                comments: prospect.comments || '',
                customerResponse: "Se envía información por WhatsApp",
                assignedTo: "Christian Valerio Angulo",
                assignedAt: prospect.assignedAt || '',
                date: prospect.date || '',
                action: 'update',
              }),
            });
          }
        } catch (updateError) {
          console.error(`Error actualizando prospecto ${prospect.id}:`, updateError);
          // No fallar el envío si la actualización falla, solo registrar el error
        }

        sentCount++;
        results.push({
          prospectId: prospect.id,
          prospectName: `${prospect.firstName} ${prospect.lastName}`,
          phoneNumber,
          status: "sent",
        });
      } catch (error) {
        failedCount++;
        results.push({
          prospectId: prospect.id,
          prospectName: `${prospect.firstName} ${prospect.lastName}`,
          phoneNumber,
          status: "failed",
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }

      // Pequeña pausa entre mensajes para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      message: `Proceso completado: ${sentCount} enviados, ${failedCount} fallidos`,
      total: prospectsFromYesterday.length,
      sent: sentCount,
      failed: failedCount,
      skipped: results.filter((r) => r.status === "skipped").length,
      results,
    }, { status: 200 });
  } catch (error) {
    console.error("Error enviando mensajes a prospectos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
