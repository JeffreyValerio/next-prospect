import { unstable_cache } from "next/cache";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { IUser } from "@/interfaces/user.interface";

const fetchClerkUsers = async (): Promise<IUser[]> => {
  try {
    const users = await clerkClient.users.getUserList();

    const mappedUsers: IUser[] = users.map((user) => ({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.emailAddresses?.[0]?.emailAddress || "Sin correo",
      username: user.username || "",
      imageUrl: user.imageUrl || "",
      role: (user.publicMetadata?.role as string) || "sin rol",
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    }));

    // Ordenar alfabéticamente por fullName
    mappedUsers.sort((a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }));

    return mappedUsers;
  } catch (error) {
    console.error("❌ Error al obtener los usuarios de Clerk:", error);
    return [];
  }
};

export const getClerkUsers = unstable_cache(fetchClerkUsers, ["clerk-users"], {
  revalidate: 300,
  tags: ["clerk-users"],
});
