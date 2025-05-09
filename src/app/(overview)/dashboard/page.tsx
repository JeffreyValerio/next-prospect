import { auth, currentUser } from "@clerk/nextjs/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { CallAndSales, Objective, ProspectsByUser, Sales, UsersReport } from "@/components";

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

      <div className="bg-white py-2 px-4 rounded shadow">
        <h1 className="font-medium capitalize">
          👋🏻 Hola <span className="font-bold">{user?.firstName} {user?.lastName}</span>
        </h1>

      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        <UsersReport prospects={prospects} />
        <Sales prospects={prospects} />
        <Objective prospects={prospects}/>
      </div>

      <CallAndSales prospects={prospects} />

      {isAdmin ? (
        <ProspectsByUser prospects={prospects} />
      ) : <></>}

    </div>
  );
}