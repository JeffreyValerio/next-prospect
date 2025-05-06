export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getProspectById } from "@/actions/prospects/getProspectsById";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { auth } from "@clerk/nextjs/server";
import { getClerkUsers } from "@/actions/users/get-clerk-users";

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { userId, sessionClaims } = await auth()
    const role = sessionClaims?.metadata?.role;
    const isAdmin = role == "admin" ? true : false;
    
    console.log({sessionClaims})
    
    const users = await getClerkUsers();

    if (!isAdmin && !userId) return redirect("/")

    if (id === 'new') { 
        return <ProspectForm title="Nuevo Prospecto" prospect={{}} users={users} />;
    }

    const prospect = await getProspectById(id);

    if (!prospect && id !== 'new') redirect('/prospects')
 
    if (!prospect) {
        redirect('/prospects');
    }

    const title = id === 'new' ? 'Nuevo Prospecto' : `Editar Prospecto`
    return <ProspectForm title={title} prospect={prospect ?? {}} users={users} />
}