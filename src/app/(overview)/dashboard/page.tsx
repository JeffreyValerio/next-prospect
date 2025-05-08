import { getProspect } from "@/actions/prospects/get-prospect";
import { CallAndSales } from "@/components/reports/CallAndSales";
import { ProspectsByUser } from "@/components/reports/ProspectsByUser";
import { Sales } from "@/components/reports/Sales";
import { UsersReport } from "@/components/reports/UsersReport";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const user = await currentUser()
  const role = user?.publicMetadata?.role ?? ""

  const isAdmin = role === "admin";

  const allProspects = await getProspect();
  let prospects = allProspects;

  if (!isAdmin && user?.firstName) {
    const userName = `${user?.firstName} ${user?.lastName}`;
    prospects = allProspects.filter((p: { assignedTo: string; }) => p.assignedTo?.trim() === userName);
  }

  return (
    <div className="grid gap-2">

      <div className="grid sm:grid-cols-2 gap-2">
        <UsersReport prospects={prospects} />
        <Sales prospects={prospects} />
      </div>

      <CallAndSales prospects={prospects} />

      {isAdmin ? (
        <ProspectsByUser prospects={prospects} />
      ) : <></>}

    </div>
  );
}