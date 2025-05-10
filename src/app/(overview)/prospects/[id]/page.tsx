import { redirect } from "next/navigation";

import { getClerkUsers } from "@/actions/users/get-clerk-users";
import { getProspect } from "@/actions/prospects/get-prospect";
import { getProspectById } from "@/actions/prospects/getProspectsById";
import { IProspect } from "@/interfaces/prospect.interface";
import { ProspectForm } from "@/components/prospects/ProspectForm";

export async function generateStaticParams() {
    const prospects = await getProspect();

    return prospects.map((prospect: IProspect) => ({
        id: prospect.id
    }));
}
export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const users = await getClerkUsers();

    if (id === 'new') {
        return <ProspectForm title="Nuevo Prospecto" prospect={{}} users={users} />;
    }

    const prospect = await getProspectById(id);

    if (!prospect && id !== 'new') return redirect('/prospects');

    const title = id === 'new' ? 'Nuevo Prospecto' : `Editar Prospecto`
    return <ProspectForm title={title} prospect={prospect ?? {}} users={users} />
}