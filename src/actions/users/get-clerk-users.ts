// src/actions/users/get-clerk-users.ts

import { unstable_cache } from "next/cache";
import { clerkClient } from "@clerk/clerk-sdk-node";

interface ClerkUser {
  id: string;
  email: string;
  fullName: string;
}

const fetchClerkUsers = async (): Promise<ClerkUser[]> => {
  console.log("🔄 Calling Clerk API");
  try {
    const users = await clerkClient.users.getUserList({ limit: 30 });

    return users.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "Sin correo",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    }));
  } catch (error) {
    console.error("❌ Error al obtener los usuarios de Clerk:", error);
    return [];
  }
};

export const getClerkUsers = unstable_cache(
  fetchClerkUsers,
  ["clerk-users"],
  {
    revalidate: 86400,           // 🕒 Cache TTL: 1 dia
  }
);