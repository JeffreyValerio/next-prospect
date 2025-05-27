"use server";

export const getProspects = async () => {
  const res = await fetch(process.env.GOOGLE_SCRIPT_URL!);

  if (!res.ok) {
    throw new Error("Error fetching prospects");
  }

  const data = await res.json();

  return data;
};
