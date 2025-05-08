export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getProspectById } from "@/actions/prospects/getProspectsById";
import { ProspectForm } from "@/components/prospects/ProspectForm";
import { auth } from "@clerk/nextjs/server";
import { getClerkUsers } from "@/actions/users/get-clerk-users";
import { getUserMetadata } from "@/actions/users/get-users-metadata";

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { userId } = await auth()
    if (!userId) return redirectToSignIn();

    const user = await getUserMetadata(userId);
    const isAdmin = user?.role === "admin";

    let users = [];

    users = await getClerkUsers();

    if (!isAdmin && !userId) return redirect("/")

    if (id === 'new') {
        return <ProspectForm title="Nuevo Prospecto" prospect={{}} users={users} />;
    }

    const prospect = await getProspectById(id);

    if (!prospect && id !== 'new') return redirect('/prospects');

    const title = id === 'new' ? 'Nuevo Prospecto' : `Editar Prospecto`
    return <ProspectForm title={title} prospect={prospect ?? {}} users={users} />
}

function redirectToSignIn() {
    throw new Error("Function not implemented.");
}
