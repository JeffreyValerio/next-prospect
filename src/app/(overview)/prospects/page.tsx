import { auth } from "@clerk/nextjs/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { ProspectTable } from "@/components";
import { getUserMetadata } from "@/actions/users/get-users-metadata";

export default async function ProspectPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const user = await getUserMetadata(userId); 
  const isAdmin = user?.role === "admin";

  const allProspects = await getProspect();

  let prospects = allProspects;

  if (!isAdmin && user?.firstName) {
    const userName = `${user.firstName} ${user.lastName}`.trim();
    prospects = allProspects.filter(
      (p: { assignedTo: string }) => p.assignedTo?.trim() === userName
    );
  }

  return <ProspectTable prospects={prospects} isAdmin={isAdmin} />;
}
