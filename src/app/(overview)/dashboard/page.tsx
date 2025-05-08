import { getProspect } from "@/actions/prospects/get-prospect";
import { ProspectsByUser } from "@/components/reports/ProspectsByUser";
import { Sales } from "@/components/reports/Sales";
import { UsersReport } from "@/components/reports/UsersReport";

export default async function DashboardPage() {

  const prospects = await getProspect();

  return (
    <div className="grid gap-2">

      <div className="grid sm:grid-cols-2 gap-2">
        <UsersReport prospects={prospects} />
        <Sales prospects={prospects} />
      </div>

        <ProspectsByUser prospects={prospects} />

    </div>
  );
}