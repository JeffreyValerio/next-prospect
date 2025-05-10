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
  const updateURL = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptURL) {
    throw new Error("GOOGLE_SCRIPT_URL is not defined");
  }

  const response = await fetch(googleScriptURL);
  const prospects: Prospect[] = await response.json(); // Tipado correcto aquí

  const now = new Date();

  const updates = await Promise.all(
    prospects.map(async (prospect) => {
      if (
        prospect.assignedTo &&
        prospect.assignedTo !== "Sin asignar" &&
        prospect.assignedAt
      ) {
        const assignedAt = new Date(prospect.assignedAt);
        const diffMinutes = (now.getTime() - assignedAt.getTime()) / 60000;

        if (diffMinutes >= 20) {
          const updatedProspect = {
            ...prospect,
            assignedTo: "Sin asignar",
            lastActivityAt: now.toISOString(),
          };

          await fetch(`${updateURL}?id=${prospect.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProspect),
          });

          return prospect.id;
        }
      }

      return null; 
    })
  );

  return NextResponse.json({ updated: updates.filter(Boolean) });
}
