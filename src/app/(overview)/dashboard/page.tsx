import { getProspect } from "@/actions/prospects/get-prospect";
import { ProspectsByUser } from "@/components/reports/ProspectsByUser";
import { UsersReport } from "@/components/reports/UsersReport";

export default async function DashboardPage() {

  const prospects = await getProspect();

  return (
    <div className="grid gap-4">

      <div className="grid sm:grid-cols-2 gap-4">
        <UsersReport prospects={prospects} />
      </div>

      <div className="w-full">
        <ProspectsByUser prospects={prospects} />
      </div>

    </div>
  );
}