import { auth, currentUser } from "@clerk/nextjs/server";

export async function validateUser() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const user = await currentUser();
  const role = user?.publicMetadata?.role ?? "";
  const isAdmin = role === "admin";

  return { user, isAdmin };
}
