export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return parsedDate.toLocaleString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};