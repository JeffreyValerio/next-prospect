import { IProspect } from "@/interfaces/prospect.interface";

/**
 * Normaliza un número de teléfono de Costa Rica agregando +506 si es necesario
 */
export function normalizeCostaRicaPhone(phone: string | number | null | undefined): string {
  // Convertir a string y validar
  if (!phone) return "";
  
  const phoneString = String(phone).trim();
  if (!phoneString) return "";
  
  // Remover espacios, guiones y otros caracteres
  const cleaned = phoneString.replace(/[\s\-\(\)]/g, "");
  
  // Si ya tiene código de país, usarlo tal cual
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  // Si empieza con 506 (código de Costa Rica sin +), agregar el +
  if (cleaned.startsWith("506")) {
    return "+" + cleaned;
  }
  
  // Si no tiene código de país, agregar +506 (Costa Rica)
  return "+506" + cleaned;
}

/**
 * Filtra prospectos agregados ayer
 */
export function filterProspectsFromYesterday(prospects: IProspect[]): IProspect[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Formato de fecha esperado: "MMM DD, YYYY" o similar
  const yesterdayFormatted = yesterday.toLocaleDateString("es-CR", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  
  // También verificar formato ISO y otros formatos comunes
  const yesterdayISO = yesterday.toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterdayFormatted2 = yesterday.toLocaleDateString("es-CR", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  
  return prospects.filter((prospect) => {
    if (!prospect.date) return false;
    
    const prospectDate = prospect.date.trim();
    
    // Verificar si la fecha contiene la fecha de ayer en algún formato
    return (
      prospectDate.includes(yesterdayFormatted) ||
      prospectDate.startsWith(yesterdayISO) ||
      prospectDate.includes(yesterdayFormatted2) ||
      // Verificar si la fecha parseada es de ayer
      isDateYesterday(prospectDate)
    );
  });
}

/**
 * Verifica si una fecha string es de ayer
 */
function isDateYesterday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const prospectDate = new Date(date);
    prospectDate.setHours(0, 0, 0, 0);
    
    return prospectDate.getTime() === yesterday.getTime();
  } catch {
    return false;
  }
}

/**
 * Obtiene números de teléfono válidos de un prospecto
 */
export function getValidPhoneNumbers(prospect: IProspect): string[] {
  const phones: string[] = [];
  
  // Validar y normalizar phone1
  if (prospect.phone1) {
    try {
      const normalized = normalizeCostaRicaPhone(prospect.phone1);
      if (normalized && normalized.length >= 11) { // +506 + 8 dígitos mínimo
        phones.push(normalized);
      }
    } catch (error) {
      console.error(`Error normalizando phone1 para prospecto ${prospect.id}:`, error);
    }
  }
  
  // Validar y normalizar phone2
  if (prospect.phone2) {
    try {
      const normalized = normalizeCostaRicaPhone(prospect.phone2);
      if (normalized && normalized.length >= 11) {
        phones.push(normalized);
      }
    } catch (error) {
      console.error(`Error normalizando phone2 para prospecto ${prospect.id}:`, error);
    }
  }
  
  return phones;
}
