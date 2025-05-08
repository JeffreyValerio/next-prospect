"use server";

import { clerkClient } from "@clerk/clerk-sdk-node";

export const getClerkUsers = async () => {
  try {
    const users = await clerkClient.users.getUserList({
      limit: 100, // puedes ajustar este número si necesitas más
    });

    return users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "Sin correo",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    }));
  } catch (error) {
    console.error("Error al obtener los usuarios de Clerk:", error);
    // throw new Error("No se pudieron obtener los usuarios");
  }
};