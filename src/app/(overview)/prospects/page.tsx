import { auth } from "@clerk/nextjs/server";
import { getProspects } from "@/actions";
import { ProspectsTable } from "@/components";
import { validateUser } from "@/utils/auth";

export default async function ProspectsPage() {

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const { user, isAdmin } = await validateUser()

  const allProspects = await getProspects();

  let prospects = allProspects;

  if (!isAdmin && user?.firstName) {
    const userName = `${user?.firstName} ${user?.lastName}`;
    prospects = allProspects.filter((p: { assignedTo: string; }) => p.assignedTo?.trim() === userName);
  }

  return (
    <section className="relative h-full flex flex-col gap-4">
      <ProspectsTable prospects={prospects} isAdmin={isAdmin} />
    </section>
  );
}