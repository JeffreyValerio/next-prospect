import { redirect } from "next/navigation";
import { getProspectById } from "@/actions/prospects/getProspectsById";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { IProspect } from "@/interfaces/prospect.interface";
import { getProspect } from "@/actions/prospects/get-prospect";

export async function generateStaticParams() {
    const prospects = await getProspect(); 

    return prospects.map((prospect: IProspect) => ({
        id: prospect.id,
    }));
}

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    if (id === 'new') {
        return <ProspectForm title="Nuevo Prospecto" prospect={{}} />;
    }

    const prospect = await getProspectById(id);

    if (!prospect && id !== 'new') redirect('/prospects')

    if (!prospect) {
        redirect('/prospects');
    }

    const title = id === 'new' ? 'Nuevo Prospecto' : `Editar Prospecto`
    return <ProspectForm title={title} prospect={prospect ?? {}} />
}