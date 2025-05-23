import { redirect } from "next/navigation";

import { getClerkUsers } from "@/actions/users/get-clerk-users";
import { getProspectById } from "@/actions/prospects/getProspectsById";
import { ProspectForm } from "@/components/prospects/ProspectForm";

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const users = await getClerkUsers();

    if (id === 'new') {
        return <ProspectForm title="Nuevo Prospecto" prospect={{}} users={users} />;
    }

    const prospect = await getProspectById(id);

    if (!prospect && id !== 'new') return redirect('/prospects');

    const title = id === 'new' ? 'Nuevo Prospecto' : `Editar Prospecto`
    return (
        <section className="relative flex flex-col gap-4">
            <ProspectForm title={title} prospect={prospect ?? {}} users={users} />
        </section>
    )
}