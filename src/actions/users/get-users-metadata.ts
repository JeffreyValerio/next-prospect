import clerkClient from "@clerk/clerk-sdk-node";

export async function getUserMetadata(userId: string) {
  const user = await clerkClient.users.getUser(userId);

  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    role: user.publicMetadata?.role ?? "user",
  };
}
