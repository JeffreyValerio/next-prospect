"use server";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "@/interfaces/user.interface";
import { revalidatePath } from "next/cache";

const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

export const createUpdateProspect = async (
  formData: FormData,
  users: IUser[]
) => {
  const validAssignedToUser = users.map((u) => u.fullName); 

  const schema = z.object({
    id: z.string().uuid().optional().nullable(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    nId: z.string().min(1, "ID is required"),
    phone1: z.string().min(1, "Phone number is required"),
    phone2: z.string().optional().nullable(),
    address: z.string().min(1, "Address is required"),
    location: z.string().optional().nullable(),
    comments: z.string().optional().nullable(),
    customerResponse: z
      .enum([
        "Sin tipificar",
        "Alquila con los servicios incluidos",
        "Venta realizada",
        "No interesado",
        "Llamar más tarde",
        "Sin respuesta",
        "Número equivocado",
        "Dejó en visto",
        "Reprogramar cita",
        "No volver a llamar",
        "Interesado en información",
        "Cliente existente",
        "Referido",
        "Permanencia",
        "Seguimiento",
        "Buzón de voz",
        "Se envía información por WhatsApp",
        "Corta la llamada",
        "No red",
        "Trabajando",
        "El número no existe",
        "Incobrable",
        "Pendiente datos de venta",
        "Mala experiencia",
        "Contrata competencia",
      ])
      .optional()
      .nullable(),
    assignedTo: z
      .string()
      .refine((value) => validAssignedToUser.includes(value), {
        message: "Assigned user is not valid",
      })
      .optional()
      .nullable(),
    assignedAt: z.string().optional().nullable(),
  });

  // const validAssignedToUser = users.map((user) => user.fullName);
  validAssignedToUser.push("Sin asignar");

  const data = Object.fromEntries(formData);
  const parsedData = schema.safeParse(data);
  if (!parsedData.success) {
    return {
      ok: false,
      message: `${parsedData.error}`,
    };
  }

  const prospect = parsedData.data;
  const { id, ...rest } = prospect;

  if (!prospect.assignedAt) {
    prospect.assignedAt = new Date().toLocaleString("es-CR", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!googleScriptURL) {
    throw new Error("GOOGLE_SCRIPT_URL is not defined");
  }

  try {
    if (prospect.id) {
      // Actualizar el prospecto si existe el ID
      const res = await fetch(`${googleScriptURL}?id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...rest,
          id: prospect.id,
          assignedAt: prospect.assignedAt,
          action: "update",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error updating prospect: ${errorText}`);
        return {
          ok: false,
          message: `Failed to update prospect: ${res.statusText}`,
        };
      }

      return {
        ok: true,
        message: `El prospecto ${rest.firstName} fue actualizado con éxito!`,
      };
    } else {
      await fetch(googleScriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...rest,
          id: uuidv4(),
        }),
      });

      revalidatePath("/prospects");
      revalidatePath(`/prospects/${prospect.id}`);

      return {
        ok: true,
        message: `El prospecto ${rest.firstName} fue creado con éxito!`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      message: `Ooops! There was a problem! ${error}`,
    };
  }
};
