/**
 * Parsea una fecha en varios formatos a un objeto Date
 * Soporta: "DD/MM/YYYY HH:MM:SS", "DD MMM YYYY. HH:MM", "DD MMM YYYY, HH:MM a. m./p. m."
 */
export function parseDateString(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    // Intentar parsear formato "DD/MM/YYYY HH:MM:SS" (formato nuevo del Excel)
    const matchExcel = dateString.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
    if (matchExcel) {
      const [, day, month, year, hour, minute, second] = matchExcel;
      const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Intentar parsear como fecha estándar
    const standardDate = new Date(dateString);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }

    // Parsear formato "DD MMM YYYY. HH:MM" (formato antiguo)
    const monthMap: Record<string, number> = {
      'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };

    const cleaned = dateString.trim();
    
    // Intentar parsear formato "DD MMM YYYY. HH:MM"
    const match1 = cleaned.match(/^(\d{1,2})\s+([a-z]{3})\s+(\d{4})\.\s+(\d{1,2}):(\d{2})/i);
    if (match1) {
      const [, day, month, year, hour, minute] = match1;
      const monthIndex = monthMap[month.toLowerCase()];
      if (monthIndex !== undefined) {
        const date = new Date(Number(year), monthIndex, Number(day), Number(hour), Number(minute));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // Intentar parsear formato "DD MMM YYYY, HH:MM a. m./p. m."
    const match2 = cleaned.match(/^(\d{1,2})\s+([a-z]{3})\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(a\.\s*m\.|p\.\s*m\.)/i);
    if (match2) {
      const [, day, month, year, hour, minute, ampm] = match2;
      const monthIndex = monthMap[month.toLowerCase()];
      if (monthIndex !== undefined) {
        let hour24 = Number(hour);
        const isPM = ampm.toLowerCase().includes('p');
        if (isPM && hour24 !== 12) {
          hour24 += 12;
        } else if (!isPM && hour24 === 12) {
          hour24 = 0;
        }
        const date = new Date(Number(year), monthIndex, Number(day), hour24, Number(minute));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Formatea una fecha para mostrar en la tabla
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "-";
  
  const parsedDate = parseDateString(dateString);
  
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    // Si no se puede parsear, intentar mostrar tal cual si tiene formato válido
    if (dateString.match(/^\d{1,2}\s+[a-z]{3}\s+\d{4}/i)) {
      return dateString;
    }
    return "-";
  }

  // Formatear como "DD MMM YYYY, HH:MM a. m./p. m."
  const day = parsedDate.getDate();
  const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const month = monthNames[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();
  let hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "p. m." : "a. m.";
  hours = hours % 12 || 12;
  
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}
