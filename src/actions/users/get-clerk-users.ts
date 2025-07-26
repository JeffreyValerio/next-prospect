import { unstable_cache } from "next/cache"
import { clerkClient } from "@clerk/clerk-sdk-node"
import { IUser } from "@/interfaces/user.interface"

const fetchClerkUsers = async (): Promise<IUser[]> => {
  try {
    const allUsers: IUser[] = []
    let offset = 0
    const limit = 100
    let hasMore = true

    const now = Date.now()
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000

    while (hasMore) {
      const response = await clerkClient.users.getUserList({
        limit,
        offset,
      })

      const mappedUsers: IUser[] = response
        .map((user) => ({
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
        }))
        .filter((user) => user.lastSignInAt && user.lastSignInAt >= oneMonthAgo)

      allUsers.push(...mappedUsers)
      offset += limit
      hasMore = response.length === limit
    }

    allUsers.sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
    )

    return allUsers 
  } catch (error) {
    console.error("❌ Error al obtener los usuarios de Clerk:", error)
    return []
  }
}

// ❗ Cache válido por 5 minutos (300s), sin Date.now()
export const getClerkUsers = unstable_cache(
  fetchClerkUsers,
  ["clerk-users-last-month"],
  {
    revalidate: 300, // 5 minutos
    tags: ["clerk-users"],
  }
)
