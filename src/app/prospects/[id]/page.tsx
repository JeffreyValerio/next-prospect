import { getProspectById } from "@/actions/prospects/getProspectsById";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { redirect } from "next/navigation";

interface Props {
    params: {
        id: string
    }
}
export default async function ProspectPage(params: Props) {
    const { id } = await params.params
    const prospect = await getProspectById(id);

    if (!prospect && id !== 'new') redirect('/prospects')

    const title = id === 'new' ? 'Nuevo Prospecto' : `Editar Prospecto`
    return <ProspectForm title={title} prospect={prospect ?? {}} />
}