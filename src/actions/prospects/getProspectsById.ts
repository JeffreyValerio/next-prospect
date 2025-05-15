"use server";

export const getProspectById = async (id: string) => {
  const res = await fetch(`${process.env.GOOGLE_SCRIPT_URL}?id=${id}`, {
    next: {
      revalidate: 60,
    },
  });

  if (!res.ok) {
    throw new Error("Error fetching prospect by ID");
  }

  const data = await res.json();
  return data;
};
