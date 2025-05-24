"use server";

export async function searchProspects(formData: FormData) {
  formData.get("query") as string;
}