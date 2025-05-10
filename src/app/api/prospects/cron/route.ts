import { NextResponse } from "next/server";

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  nId: string;
  phone1: string;
  phone2?: string;
  address: string;
  location?: string;
  comments?: string;
  customerResponse?: string;
  assignedTo?: string;
  assignedAt?: string; // ISO string
}

export async function GET() {
  const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptURL) {
    return NextResponse.json(
      { error: "GOOGLE_SCRIPT_URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(googleScriptURL);
    const prospects: Prospect[] = await res.json();
    const now = new Date();

    const updates = await Promise.all(
      prospects.map(async (prospect) => {
        const { assignedTo, assignedAt, customerResponse } = prospect;

        // Solo desasignar si:
        // 1. Está asignado a alguien
        // 2. Fue asignado hace más de 20 minutos
        // 3. No se ha tipificado aún (customerResponse es "Sin tipificar")
        if (
          assignedTo &&
          assignedTo !== "Sin asignar" &&
          assignedAt &&
          customerResponse === "Sin tipificar"
        ) {
          const assignedTime = new Date(assignedAt);
          const minutesPassed =
            (now.getTime() - assignedTime.getTime()) / 60000;

          if (minutesPassed >= 20) {
            const updatedProspect = {
              ...prospect,
              assignedTo: "Sin asignar",
              lastActivityAt: new Date().toISOString(),
            };

            await fetch(`${googleScriptURL}?id=${prospect.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedProspect),
            });

            return prospect.id;
          }
        }

        return null;
      })
    );

    console.log({ updates });
    const updatedIds = updates.filter(Boolean);
    return NextResponse.json({ updated: updatedIds });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Error processing cron job" },
      { status: 500 }
    );
  }
}
