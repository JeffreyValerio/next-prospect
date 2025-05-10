"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

interface User {
  id: string;
  fullName: string;
  email: string;
}

export const createUpdateProspect = async (
  formData: FormData,
  users: User[]
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
  const { id, ...rest } = prospect;

  if (!googleScriptURL) {
    throw new Error("GOOGLE_SCRIPT_URL is not defined");
  }

  const assignedAt =
    rest.assignedTo && rest.assignedTo !== "Sin asignar"
      ? new Date().toISOString()
      : null;

  try {
    const bodyPayload = {
      ...rest,
      id: id || uuidv4(),
      assignedAt,
      action: id ? "update" : undefined,
    };

    const url = id ? `${googleScriptURL}?id=${id}` : googleScriptURL;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `${id ? "Update" : "Create"} prospect error: ${errorText}`
      );
      return {
        ok: false,
        message: `Failed to ${
          id ? "update" : "create"
        } prospect: ${res.statusText}`,
      };
    }

    return {
      ok: true,
      message: `Prospect ${rest.firstName} ${
        id ? "updated" : "created"
      } successfully!`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Ooops! There was a problem! ${error}`,
    };
  } finally {
    redirect("/prospects");
  }
};
