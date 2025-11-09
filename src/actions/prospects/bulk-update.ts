'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const googleScriptURL = process.env.GOOGLE_SCRIPT_URL;

const prospectUpdateSchema = z.object({
  id: z.string().min(1, 'El identificador del prospecto es obligatorio'),
  firstName: z.string(),
  lastName: z.string(),
  nId: z.string(),
  phone1: z.string(),
  phone2: z.string().optional().nullable(),
  address: z.string(),
  location: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  customerResponse: z.string(),
  assignedTo: z.string(),
  assignedAt: z.string().optional().nullable(),
  date: z.string(),
});

const bulkPayloadSchema = z.array(prospectUpdateSchema).min(1);

type ProspectUpdatePayload = z.infer<typeof prospectUpdateSchema>;

interface BulkUpdateResult {
  ok: boolean;
  successes: string[];
  failures: Array<{ id: string; error: string }>;
}

export const bulkUpdateProspects = async (
  updates: ProspectUpdatePayload[]
): Promise<BulkUpdateResult> => {
  const sanitizedUpdates = updates.map((prospect) => ({
    ...prospect,
    phone1:
      prospect.phone1 === undefined || prospect.phone1 === null
        ? ''
        : String(prospect.phone1),
    phone2:
      prospect.phone2 === undefined || prospect.phone2 === null
        ? ''
        : String(prospect.phone2),
  }));

  const parsed = bulkPayloadSchema.safeParse(sanitizedUpdates);

  if (!parsed.success) {
    console.error('❌ Error de validación en actualización masiva:', parsed.error);
    return {
      ok: false,
      successes: [],
      failures: [
        {
          id: 'validation',
          error: 'Los datos enviados no son válidos para la actualización masiva.',
        },
      ],
    };
  }

  if (!googleScriptURL) {
    console.error('❌ GOOGLE_SCRIPT_URL no está definido.');
    return {
      ok: false,
      successes: [],
      failures: [
        {
          id: 'configuration',
          error: 'La URL de configuración no está disponible. Contacta al administrador.',
        },
      ],
    };
  }

  const results = await Promise.all(
    parsed.data.map(async (prospect) => {
      const { id, ...payload } = prospect;

      try {
        const response = await fetch(`${googleScriptURL}?id=${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            id,
            action: 'update',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error al actualizar prospecto ${id}: ${errorText}`);
          return {
            ok: false,
            id,
            error: response.statusText || 'Error desconocido al actualizar el prospecto.',
          };
        }

        return { ok: true, id };
      } catch (error) {
        console.error(`❌ Error inesperado al actualizar prospecto ${id}:`, error);
        return {
          ok: false,
          id,
          error:
            error instanceof Error
              ? error.message
              : 'Error desconocido durante la actualización.',
        };
      }
    })
  );

  const successes = results.filter((result) => result.ok).map((result) => result.id);
  const failures = results
    .filter((result) => !result.ok)
    .map((result) => ({
      id: result.id,
      error: 'error' in result && result.error ? result.error : 'Error desconocido',
    }));

  if (successes.length > 0) {
    revalidatePath('/prospects');
    revalidatePath('/overview/prospects');
  }

  return {
    ok: failures.length === 0,
    successes,
    failures,
  };
};

