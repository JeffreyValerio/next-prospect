import { getProspect } from "@/actions/prospects/get-prospect";
import { currentUser } from "@clerk/nextjs/server";
import { ProspectTable } from "@/components";

export default async function ProspectTableWrapper() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin";
  const allProspects = await getProspect();

  let prospects = allProspects;

  if (!isAdmin && user?.firstName) {
    const userName = `${user?.firstName} ${user?.lastName}`;
    prospects = allProspects.filter((p: { assignedTo: string }) => p.assignedTo?.trim() === userName);
  }

  return <ProspectTable prospects={prospects} isAdmin={isAdmin} />;
}
