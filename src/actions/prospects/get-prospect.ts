"use server";

export const getProspect = async () => {
  const res = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
    next: {
      revalidate: 300,
    },
  });

  if (!res.ok) {
    throw new Error("Error fetching prospects");
  }

  const data = await res.json();

  return data;
};
