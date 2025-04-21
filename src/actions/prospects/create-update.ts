"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

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
      "Sin asignar",
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
    ])
    .optional()
    .nullable(),
  assignedTo: z
    .enum(["Sin asignar", "Michael Valerio", "Cecilia Angulo"])
    .optional()
    .nullable(),
});

export const createUpdateProspect = async (formData: FormData) => {
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
          id: prospect.id, // Mantener el id original si existe
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
        message: `Prospect ${rest.firstName} updated successfully!`,
      };
    } else {
      // Crear un nuevo prospecto si no existe el ID
      await fetch(googleScriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...rest,
          id: uuidv4(), // Generar ID solo si no existe
        }),
      });

      return {
        ok: true,
        message: `Prospect ${rest.firstName} created successfully!`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      message: `Ooops! There was a problem!`,
    };
  } finally {
    redirect("/prospects");
  }
};
