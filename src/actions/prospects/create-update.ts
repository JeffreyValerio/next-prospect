"use server";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "@/interfaces/user.interface";

const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

export const createUpdateProspect = async (
  formData: FormData,
  users: IUser[]
) => {
  const validAssignedToUser = users.map((user) => user.fullName);
  validAssignedToUser.push("Sin asignar");

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
  });

  const data = Object.fromEntries(formData);
  const parsedData = schema.safeParse(data);

  if (!parsedData.success) {
    return {
      ok: false,
      message: `${parsedData.error}`,
    };
  }

  const prospect = parsedData.data;
  const { ...rest } = prospect;

  if (!googleScriptURL) {
    throw new Error("GOOGLE_SCRIPT_URL is not defined");
  }

  // Solo se asigna la fecha de 'assignedAt' si el prospecto tiene asignado un usuario
  const payload = {
    ...rest,
    id: prospect.id || uuidv4(),
    assignedAt:
      prospect.assignedTo && prospect.assignedTo !== "Sin asignar"
        ? new Date().toISOString()
        : null,
  };

  try {
    const url = prospect.id
      ? `${googleScriptURL}?id=${prospect.id}`
      : googleScriptURL;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error saving prospect: ${errorText}`);
      return {
        ok: false,
        message: `Error al guardar prospecto: ${res.statusText}`,
      };
    }

    return {
      ok: true,
      message: `El prospecto ${rest.firstName} fue ${
        prospect.id ? "actualizado" : "creado"
      } con éxito!`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Ooops! There was a problem! ${error}`,
    };
  }
};
